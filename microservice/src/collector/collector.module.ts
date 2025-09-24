import { Module } from '@nestjs/common';
import { CollectorService } from './collector.service';
import { CollectorController } from './collector.controller';
import { TuyaService } from './tuya.service';
import { DatabaseService } from './database.service';

@Module({
  controllers: [CollectorController],
  providers: [CollectorService, TuyaService, DatabaseService],
  exports: [CollectorService],
})
export class CollectorModule { }