import { RedisClient } from "../config";
import { RedisClientType } from "redis";


const MAPPING_PREFIX = "schedulemap:";

export class SchedulerMap {
  private static instance: SchedulerMap;
  public redisClient: RedisClientType;
  private constructor() {
    this.redisClient = RedisClient.getInstance().redisClient;
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SchedulerMap();
    }
    return this.instance
  }

  public async storeJobMapping(scheduleId: string, jobId: string) {
    if (!scheduleId || !jobId) {
      console.error("Error: scheduleId and jobId are required for mapping.");
      return;
    }

    try {
      await this.redisClient.set(`${MAPPING_PREFIX}${scheduleId}`, jobId);
    } catch (error) {
      console.error(
        `Error storing job mapping for scheduleId ${scheduleId}:`,
        error
      );
    }
  }

  public async getJobId(scheduleId: string) {
    if (!scheduleId) return null;
    try {
      const jobId = await this.redisClient.get(
        `${MAPPING_PREFIX}${scheduleId}`
      );
      return jobId;
    } catch (error) {
      console.error(
        `Error retrieving jobId for scheduleId ${scheduleId}:`,
        error
      );
      return null;
    }
  }

  public async removeJobMapping(scheduleId: string) {
    if (!scheduleId) return;
    try {
      await this.redisClient.del(`${MAPPING_PREFIX}${scheduleId}`);
    } catch (error) {
      console.error(
        `Error removing job mapping for scheduleId ${scheduleId}:`,
        error
      );
    }
  }
}