import { Queue, Worker, ConnectionOptions, Job, QueueEvents } from "bullmq";
import { redisConfig } from "../config"
import {SchedulerMap} from "./schedulerMap"
import { ATTEMPT_VALUE,BACKOFF_DELAY } from "@repo/ui/constants"


export const paymentScheduleQueueConfig = {
  queuename: process.env.PAYMENT_QUEUE_NAME || "payment-schedule-queue",
};

export const paymentScheduleQueue = new Queue(paymentScheduleQueueConfig.queuename, {
  connection: { host: redisConfig.host, port: Number(redisConfig.port) },
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

export const gracefullShutdown= (worker:Worker)=> {
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

        console.log('Graceful shutdown complete.');
        process.exit(0);
      } catch (err) {
        console.error('Error during graceful shutdown:', err);
        process.exit(1);
      }
    });
})
}