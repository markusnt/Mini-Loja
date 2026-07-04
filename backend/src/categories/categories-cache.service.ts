import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CategoriesCacheService {
  private readonly ttlSeconds = 300;
  private readonly listPrefix = 'categories:list:';
  private readonly itemPrefix = 'categories:item:';

  constructor(private readonly redis: RedisService) {}

  private listKey(search?: string): string {
    const term = search?.trim() || 'all';
    return `${this.listPrefix}search:${term}`;
  }

  private itemKey(id: number): string {
    return `${this.itemPrefix}${id}`;
  }

  async getList<T>(search?: string): Promise<T | null> {
    const cached = await this.redis.get(this.listKey(search));
    return cached ? (JSON.parse(cached) as T) : null;
  }

  async setList<T>(search: string | undefined, data: T): Promise<void> {
    await this.redis.set(
      this.listKey(search),
      JSON.stringify(data),
      this.ttlSeconds,
    );
  }

  async getItem<T>(id: number): Promise<T | null> {
    const cached = await this.redis.get(this.itemKey(id));
    return cached ? (JSON.parse(cached) as T) : null;
  }

  async setItem<T>(id: number, data: T): Promise<void> {
    await this.redis.set(
      this.itemKey(id),
      JSON.stringify(data),
      this.ttlSeconds,
    );
  }

  async invalidateLists(): Promise<void> {
    await this.redis.delByPattern(`${this.listPrefix}*`);
  }

  async invalidateItem(id: number): Promise<void> {
    await this.redis.del(this.itemKey(id));
  }

  async invalidateCategory(id: number): Promise<void> {
    await this.invalidateItem(id);
    await this.invalidateLists();
  }

  async invalidateAllCategories(): Promise<void> {
    await this.invalidateLists();
  }

  async invalidateCategoriesByIds(ids: number[]): Promise<void> {
    const uniqueIds = [...new Set(ids.filter((id) => Number.isFinite(id)))];

    await Promise.all(uniqueIds.map((id) => this.invalidateItem(id)));
    await this.invalidateLists();
  }
}
