// src/shared/services/email.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";

@Injectable()
export class RedisService {
  private redisClient;
  constructor(private configService: ConfigService) {
    // Initialize Redis redisClient with config values
    this.redisClient = createClient({
      url: `redis://${this.configService.get(
        "REDIS_HOST"
      )}:${this.configService.get("REDIS_PORT")}`,
    });
    (this.redisClient as ReturnType<typeof createClient>)
      .connect()
      .catch((err: Error) => console.error("Redis connection error:", err));
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redisClient.setex(key, ttl, value);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      // Store refresh token in Redis with 7-day expiration
      await this.redisClient.set(`refresh:${userId}`, refreshToken, {
        EX: 604800, // 7 days in seconds
      });
    } catch (error) {
      console.error("Error storing refresh token in Redis:", error);
      throw new Error("Failed to store refresh token");
    }
  }
}
