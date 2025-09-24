import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DatabaseService } from '../collector/database.service';

@Module({
  controllers: [HealthController],
  providers: [DatabaseService],
})
export class HealthModule { }