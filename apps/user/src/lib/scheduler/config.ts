import { Queue, Worker, ConnectionOptions, Job, QueueEvents, QueueEventsListener } from "bullmq";
import { redisConfig } from "../config"
import { SchedulerMap } from "./schedulerMap"
import { ATTEMPT_VALUE, BACKOFF_DELAY } from "@repo/ui/constants"
import {CustomEvent} from "./event"

export interface CustomEventPayload {
  eventName: string;
  data: object;
}
const paymentScheduleQueueConfig = {
  queuename: process.env.PAYMENT_QUEUE_NAME || "payment-schedule-queue",
};
const connection = { host: redisConfig.host, port: Number(redisConfig.port) };

export const paymentScheduleQueue = new Queue(paymentScheduleQueueConfig.queuename, {
  connection,
  defaultJobOptions: {
    attempts: ATTEMPT_VALUE,
    backoff: {
      type: "exponential",
      delay: BACKOFF_DELAY
    },
    removeOnComplete: {
      count: 0,
    },
    removeOnFail: {
      count: 0,
    },
  },
});

paymentScheduleQueue.on("error", (error) => {
  console.error(
    `BullMQ Queue Error (${paymentScheduleQueueConfig.queuename}):`,
    error
  );
});

console.log(
  `BullMQ Queue "${paymentScheduleQueueConfig.queuename}" initialized.`
);


/* ------------------- Custom bullMQ event configure  ------------------- */
declare global {
  var __queueEvents: QueueEvents | undefined;
}

let queueEvents: QueueEvents;

if (process.env.NODE_ENV === 'production') {
  // In production, always create a new instance.
  // In production, each Server Action runs in a separate, stateless environment.
  queueEvents = new QueueEvents('customEventQueue', { connection });
} else {
  // In development, the 'global' object is preserved across module reloads.
  // In development, use the global singleton.
  if (!global.__queueEvents) {
    console.log('✨ Creating a NEW singleton instance of QueueEvents for development.');
    global.__queueEvents = new QueueEvents('customEventQueue', { connection });
  }
  queueEvents = global.__queueEvents;
}


// IMPORTANT: You should only attach listeners ONCE.
// A simple flag can prevent re-attaching listeners on every hot-reload.
if (!(queueEvents as any)._listenersAttached) {
  interface CustomListener extends QueueEventsListener {
    job_update: (args: { returnvalue: object,  jobId:object; }, id:string) => void;
  }
  // Here payload only takes strings as argument i donno why. Thats why i sent whole data as stringified.
  queueEvents.on<CustomListener>('job_update', async (payload: any) => {
    try {
      console.log("*******************", await CustomEvent.updateJobCallback(payload));
    } catch (error) {
      throw error
    }
    // console.log("✅ Custom event 'job_update' received!", payload);
  }); 

  // Add any other listeners here...
  queueEvents.on('completed', ({ jobId }) => {
    console.log(`🎉 Built-in event "completed" received for job ${jobId}`);
  });

  (queueEvents as any)._listenersAttached = true;
  console.log('Attaching BullMQ event listeners.');
}



export { queueEvents, paymentScheduleQueueConfig};

export const gracefullShutdown = (worker: Worker) => {
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  signals.forEach(signal => {
    process.on(signal, async () => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      console.log("------------------ gracefullShutdown ---------------")
      console.log(paymentScheduleQueue, worker)
      try {
        // Close BullMQ components
        // Check if paymentScheduleQueue and paymentWorker are defined before closing
        if (typeof paymentScheduleQueue !== 'undefined' && paymentScheduleQueue.close) {
          await paymentScheduleQueue.close();
          console.log('Payment schedule queue closed.');
        }
        if (typeof worker !== 'undefined' && worker.close) {
          await worker.close(); // Pass true to wait for active jobs to finish
          console.log('Payment worker closed.');
        }
        // Close Redis connections if manually managed
        if (typeof SchedulerMap.getInstance().redisClient !== 'undefined' && SchedulerMap.getInstance().redisClient.quit) {
          await SchedulerMap.getInstance().redisClient.quit();
          console.log('Redis mapping client closed.');
        }
        if (typeof queueEvents !== "undefined" && queueEvents.close) {
          await queueEvents.close()
        }
        console.log('Graceful shutdown complete.');
        process.exit(0);
      } catch (err) {
        console.error('Error during graceful shutdown:', err);
        process.exit(1);
      }
    });
  })
}