import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check (PostgreSQL + Redis)' })
  async check() {
    await this.prisma.$queryRaw`SELECT 1`;
    const redis = await this.redis.ping();

    return {
      status: 'ok',
      database: 'connected',
      redis,
      timestamp: new Date().toISOString(),
    };
  }
}
