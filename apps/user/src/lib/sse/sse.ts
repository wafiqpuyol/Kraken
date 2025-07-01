import { Response } from 'express';

export interface SseClient {
  id: string;
  res: Response;
  userId: string;
}

export interface BroadcastEvent {
  type: 'payment-update' | 'general-notification' | 'connection-established';
  payload: Record<string, any>;
  target: {
    type: 'all' | 'user';
    userId?: string;
  };
}

// //
// // 📂 6. SSE Service (`src/core/sseService.ts`)
// //
// // MONOLITH VERSION: This is now simpler. It no longer needs Redis Pub/Sub.
// // It directly manages an in-memory map of clients for this single process.
// //
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SseClient, BroadcastEvent } from '../types';
import logger from '../utils/logger';
import { config } from '../config';

class SseService {
  private clients: Map<string, SseClient> = new Map();

  /**
   * Directly handles broadcast events and dispatches them to relevant clients.
   * This method is called by the internal broadcast controller.
   * @param event The broadcast event.
   */
  public handleBroadcastEvent(event: BroadcastEvent): void {
    logger.info('Handling internal broadcast event', { type: event.type, target: event.target });
    if (event.target.type === 'all') {
      this.clients.forEach(client => this.sendEvent(client, event));
    } else if (event.target.type === 'user' && event.target.userId) {
      this.clients.forEach(client => {
        if (client.userId === event.target.userId) {
          this.sendEvent(client, event);
        }
      });
    }
  }

  /**
   * Adds a new client connection.
   * @param res The Express Response object for the client.
   * @param userId The authenticated user's ID.
   */
  public addClient(res: Response, userId: string): void {
    const clientId = uuidv4();
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': config.cors.origin,
    });

    const keepAliveInterval = setInterval(() => res.write(`: keep-alive\n\n`), config.sse.keepAliveInterval);

    const client: SseClient = { id: clientId, res, userId };
    this.clients.set(clientId, client);
    logger.info(`Client connected: ${clientId}, User: ${userId}. Total clients: ${this.clients.size}`);

    res.write(`retry: ${config.sse.retryInterval}\n\n`);
    this.sendEvent(client, {
      type: 'connection-established',
      payload: { clientId, message: 'SSE connection successful.' },
    });

    res.on('close', () => {
      clearInterval(keepAliveInterval);
      this.clients.delete(clientId);
      logger.info(`Client disconnected: ${clientId}, User: ${userId}. Total clients: ${this.clients.size}`);
    });

    res.on('error', (err) => {
      logger.error(`Error on client response stream: ${clientId}`, { error: err });
      clearInterval(keepAliveInterval);
      this.clients.delete(clientId);
    });
  }

  /**
   * Formats and sends an event to a single client.
   * @param client The SSE client to send the event to.
   * @param event The event data.
   */
  private sendEvent(client: SseClient, event: Omit<BroadcastEvent, 'target'>): void {
    try {
      const dataString = JSON.stringify(event.payload);
      let message = `id: ${new Date().getTime()}\n`;
      message += `event: ${event.type}\n`;
      message += `data: ${dataString}\n\n`;
      client.res.write(message);
    } catch (err) {
      logger.error('Failed to send event to client', { clientId: client.id, error: err });
    }
  }
  
  /**
   * Closes all active client connections for graceful shutdown.
   */
  public closeAllConnections(): void {
    logger.info(`Closing all ${this.clients.size} client connections...`);
    this.clients.forEach(client => client.res.end());
    this.clients.clear();
  }
}

export const sseService = new SseService();

