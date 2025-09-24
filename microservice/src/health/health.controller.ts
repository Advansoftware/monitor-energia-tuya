import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../collector/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) { }

  @Get()
  async getHealth() {
    const stats = await this.databaseService.getCollectionStats();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
      },
      database: stats,
      cronSchedule: process.env.CRON_SCHEDULE || '*/5 * * * *',
    };
  }
}