import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ListProductsQueryDto } from './dto/list-products.query.dto';
import { PaginatedResponse } from './types/paginated-response.type';

@Injectable()
export class ProductsCacheService {
  private readonly ttlSeconds = 300;
  private readonly listPrefix = 'products:list:';
  private readonly itemPrefix = 'products:item:';

  constructor(private readonly redis: RedisService) {}

  private listKey(query: ListProductsQueryDto): string {
    const search = query.search?.trim() || 'all';
    return `${this.listPrefix}page:${query.page}:limit:${query.limit}:search:${search}`;
  }

  private itemKey(id: number): string {
    return `${this.itemPrefix}${id}`;
  }

  async getList<T>(query: ListProductsQueryDto): Promise<T | null> {
    const cached = await this.redis.get(this.listKey(query));
    return cached ? (JSON.parse(cached) as T) : null;
  }

  async setList<T>(query: ListProductsQueryDto, data: T): Promise<void> {
    await this.redis.set(
      this.listKey(query),
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

  async invalidateProduct(id: number): Promise<void> {
    await this.invalidateItem(id);
    await this.invalidateLists();
  }

  async invalidateAllProducts(): Promise<void> {
    await this.invalidateLists();
  }
}

export type { PaginatedResponse };
