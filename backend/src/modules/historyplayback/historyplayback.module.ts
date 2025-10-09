import { Module } from '@nestjs/common';
import { HistoryplaybackService } from './historyplayback.service';
import { HistoryplaybackController } from './historyplayback.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HistoryplaybackController],
  providers: [HistoryplaybackService],
})
export class HistoryplaybackModule {}
