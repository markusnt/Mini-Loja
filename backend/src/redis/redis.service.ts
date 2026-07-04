import { Global, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

const DEFAULT_CACHE_TTL_SECONDS = 300;

@Global()
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;
  readonly cacheTtlSeconds: number;

  constructor(private readonly configService: ConfigService) {
    this.cacheTtlSeconds = this.resolveCacheTtlSeconds();
    this.client = new Redis(
      this.configService.getOrThrow<string>('REDIS_URL'),
    );
    this.client.on('error', (err: Error) => {
      this.logger.warn(`Redis connection error: ${err.message}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
    } catch (err) {
      this.logger.warn(
        `Redis shutdown failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    await this.runSafely('SET', undefined, async () => {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
        return;
      }

      await this.client.set(key, value);
    });
  }

  async get(key: string): Promise<string | null> {
    return this.runSafely('GET', null, () => this.client.get(key));
  }

  async del(key: string): Promise<void> {
    await this.runSafely('DEL', undefined, () => this.client.del(key));
  }

  async delByPattern(pattern: string): Promise<void> {
    await this.runSafely('DEL pattern', undefined, async () => {
      let cursor = '0';

      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );

        cursor = nextCursor;

        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    });
  }

  private resolveCacheTtlSeconds(): number {
    const raw = this.configService.get<string>(
      'CACHE_TTL_SECONDS',
      String(DEFAULT_CACHE_TTL_SECONDS),
    );
    const parsed = parseInt(raw, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      this.logger.warn(
        `CACHE_TTL_SECONDS inválido (${raw}); usando ${DEFAULT_CACHE_TTL_SECONDS}s`,
      );
      return DEFAULT_CACHE_TTL_SECONDS;
    }

    return parsed;
  }

  private async runSafely<T>(
    operation: string,
    fallback: T,
    fn: () => Promise<T>,
  ): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      this.logger.warn(
        `Redis ${operation} falhou (${err instanceof Error ? err.message : String(err)}); continuando sem cache`,
      );
      return fallback;
    }
  }
}
