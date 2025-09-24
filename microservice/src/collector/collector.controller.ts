import { Controller, Post, Get, Logger } from '@nestjs/common';
import { CollectorService } from './collector.service';

@Controller('collector')
export class CollectorController {
  private readonly logger = new Logger(CollectorController.name);

  constructor(private readonly collectorService: CollectorService) { }

  @Post('collect')
  async forceCollection() {
    this.logger.log('🔄 Coleta manual iniciada via API');
    return await this.collectorService.collectData();
  }

  @Get('stats')
  getStats() {
    return this.collectorService.getStats();
  }
}