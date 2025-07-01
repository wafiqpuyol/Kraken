import { QueueEventsProducer } from "bullmq"
import { redisConfig } from "../config"

const queueName = 'customEventQueue';
const connection = { host: redisConfig.host, port: Number(redisConfig.port) }

export const queueEventsProducer = new QueueEventsProducer(queueName, {
  connection,
});

export class CustomEvent {
  private constructor() { }
  public static async updateJobCallback(payload: string) {
    console.log(payload)
    // const parsedPayload = JSON.parse(JSON.parse(payload).payload)
    // console.log(parsedPayload)
    // const a = new Function(parsedPayload.action)()

    // console.log(a)
    // try {
    //   a(parsedPayload.jobId,
    //      Number(parsedPayload.formData.amount), Number(parsedPayload.prevAmount),
    //       {userId:parsedPayload.userDetails.userId, number:parsedPayload.userDetails.number, totalBalance:parsedPayload.userDetails.totalBalance}
    //     )
      
    // } catch (error) {
    //   throw error
    // }
  }
}
 

`const executor = async (jobId, newAmount, prevAmount, userDetails) => {
                        console.log(jobId, newAmount, prevAmount, userDetails);
                        const value = Number(prevAmount) - newAmount;
                        let changedRow = {};
                        try {
                            if (value < 0) {
                                changedRow = {
                                    locked: {
                                        decrement: Math.abs(value)
                                    },
                                    amount: {
                                        increment: Math.abs(value)
                                    }
                                };
                            } else {
                                if ((userDetails.totalBalance / 100) < value) {
                                    throw new Error("You're wallet does not have sufficient balance to make this scheduled transfer");
                                }
                                changedRow = {
                                    locked: {
                                        increment: value
                                    },
                                    amount: {
                                        decrement: value
                                    }
                                };
                            };

                            await prisma.schedulePayment.update({
                                where: { jobId },
                                data: {
                                    amount: newAmount.toString()
                                }
                            });
                            const updatedSenderBalance = await prisma.balance.update({
                                where: { userId: userDetails.userId },
                                data: {
                                    ...changedRow
                                }
                            });
                            await redisManager().updateUserCred(userDetails.number, "balance", JSON.stringify(updatedSenderBalance));
                        } catch (error) {
                            throw error;
                        };
                    };
                    return executor;`