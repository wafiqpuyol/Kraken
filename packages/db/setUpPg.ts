import { Pool, PoolClient } from "pg"
export const dbConfig = {
    max: 20, // set pool size to 20 connections
    idleTimeoutMillis: 10000, // close idle clients after 10 seconds
    connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'bkash',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false // Disable SSL for local development
}
let isListening = false;


export class NotificationListener {
    private pool: Pool;
    private client: PoolClient | null;
    // public isListening: boolean = false;
    private reconnectAttempts: number;
    private static instance: NotificationListener;

    private constructor() {
        console.log("**********************", isListening);
        this.pool = new Pool(dbConfig);
        this.reconnectAttempts = 0;
        this.client = null
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new NotificationListener();
        }
        return this.instance;
    }

    async start() {
        if (isListening) {
            console.log("Not starting notification listener, already listening");
            return;
        };

        console.log("----------------------Starting notification listener----------------------");
        try {
            this.client = await this.pool.connect();
            console.log(this.client.listenerCount('notification'));
            // Listen for notifications on the channel
            await this.client.query('LISTEN outbox_new_message');

            // Set up the notification handler
            this.client.on('notification', this.handleNotification.bind(this));

            this.reconnectAttempts = 0;
            console.log('Now listening for database notifications on channel: outbox_new_message');
            isListening = true;
        } catch (error) {
            isListening = false;
            console.error('Error starting notification listener:', error);
        }
    }


    async handleNotification(msg: unknown) {
        try {
            console.log("from handleNotification ===>", msg);
            console.log("from handleNotification ===>", typeof msg);
            // @ts-ignore
            const payload = JSON.parse(msg.payload);
            console.log(`Received notification for outbox message: ${payload}`);
        } catch (error) {
            console.error('Error handling notification:', error);
        }
    }
}


export const notificationListener = NotificationListener.getInstance();