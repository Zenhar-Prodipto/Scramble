import { Injectable, Logger, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";
import { ApiException } from "src/common/exceptions/api.exceptions";

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private redisClient;
  private inMemoryStore: Map<string, string> = new Map();
  private isRedisConnected = false;

  constructor(private configService: ConfigService) {
    const redisHost = this.configService.get("REDIS_HOST", "redis");
    const redisPort = this.configService.get("REDIS_PORT", "6379");
    const redisPassword = this.configService.get(
      "REDIS_PASSWORD",
      "redis-pass"
    );

    this.redisClient = createClient({
      url: `redis://${redisHost}:${redisPort}`,
      password: redisPassword,
    });

    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      await this.redisClient.connect();
      this.isRedisConnected = true;
      this.logger.log("Redis connected successfully");
    } catch (error) {
      this.isRedisConnected = false;
      this.logger.warn(
        "Failed to connect to Redis, using in-memory store",
        error.message
      );
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (this.isRedisConnected) {
        if (ttl) {
          await this.redisClient.set(key, value, { EX: ttl });
        } else {
          await this.redisClient.set(key, value);
        }
        this.logger.log(`Set key ${key} in Redis`);
      } else {
        this.inMemoryStore.set(key, value);
        this.logger.log(`Set key ${key} in in-memory store`);
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key}: ${error.message}`);
      throw new ApiException(
        "Failed to set cache",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.isRedisConnected) {
        this.logger.log(`Retrieving key ${key} from Redis`);
        return await this.redisClient.get(key);
      }
      this.logger.log(`Retrieving key ${key} from in-memory store`);
      return this.inMemoryStore.get(key) || null;
    } catch (error) {
      this.logger.error(`Failed to get key ${key}: ${error.message}`);
      throw new ApiException(
        "Failed to retrieve cache",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.isRedisConnected) {
        this.logger.log(`Deleting key ${key} from Redis`);
        await this.redisClient.del(key);
      } else {
        this.logger.log(`Deleting key ${key} from in-memory store`);
        this.inMemoryStore.delete(key);
      }
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}: ${error.message}`);
      throw new ApiException(
        "Failed to delete cache",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      if (this.isRedisConnected) {
        await this.redisClient.set(`refresh:${userId}`, refreshToken, {
          EX: 604800, // 7 days
        });

        console.log(`Storing refresh token for user ${userId} in Redis`);
      } else {
        this.inMemoryStore.set(`refresh:${userId}`, refreshToken);
        console.log(
          `Storing refresh token for user ${userId} in in-memory store`
        );
      }
    } catch (error) {
      this.logger.error(`Failed to store refresh token: ${error.message}`);
      throw new ApiException(
        "Failed to store refresh token",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    try {
      if (this.isRedisConnected) {
        console.log(`Retrieving refresh token for user ${userId} from Redis`);
        return await this.redisClient.get(`refresh:${userId}`);
      }
      console.log(
        `Retrieving refresh token for user ${userId} from in-memory store`
      );
      return this.inMemoryStore.get(`refresh:${userId}`) || null;
    } catch (error) {
      this.logger.error(`Failed to retrieve refresh token: ${error.message}`);
      throw new ApiException(
        "Failed to retrieve refresh token",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async delRefreshToken(userId: string): Promise<void> {
    try {
      if (this.isRedisConnected) {
        console.log(`Deleting refresh token for user ${userId} from Redis`);
        await this.redisClient.del(`refresh:${userId}`);
      } else {
        console.log(
          `Deleting refresh token for user ${userId} from in-memory store`
        );
        this.inMemoryStore.delete(`refresh:${userId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete refresh token: ${error.message}`);
      throw new ApiException(
        "Failed to delete refresh token",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async isRedisAvailable(): Promise<boolean> {
    try {
      if (this.isRedisConnected) {
        await this.redisClient.ping();
        return true;
      }
      return false;
    } catch (error) {
      this.isRedisConnected = false;
      this.logger.warn("Redis is unavailable", error.message);
      return false;
    }
  }
}
