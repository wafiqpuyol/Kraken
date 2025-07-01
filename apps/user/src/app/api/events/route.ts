import { createClient } from 'redis';
import {RedisClient} from "../../../lib/config"

// This function cannot be a Server Action. It must be a Route Handler.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  // You would also get the userId from an authenticated session here

  if (!userId) {
    return new Response('Job ID is required.', { status: 400 });
  }

  // A ReadableStream is the modern way to handle streaming in Next.js
  const stream = new ReadableStream({
    async start(controller) {
      // Setup Redis subscriber
      // const subscriber = createClient({ url: "redis://localhost:6379" });
      const subscriber = RedisClient.getInstance().redisClient
      await subscriber.connect();

      // Encode messages for SSE format
      const encoder = new TextEncoder();
      const sendEvent = (data: object) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };
      
      // Subscribe to a channel specific to this job
      const channel = "schedule_payment";
      subscriber.subscribe(channel, (message) => {
        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
        console.log(message)
        sendEvent({ progress: JSON.parse(message) });
      });

      // Send a keep-alive comment every 20 seconds
      const keepAliveInterval = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 20000);

      // Clean up when the client disconnects
      request.signal.onabort = () => {
        clearInterval(keepAliveInterval);
        subscriber.unsubscribe(channel);
        subscriber.quit();
        controller.close();
        console.log(`SSE connection closed for job ${userId}`);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}