import { Module } from '@nestjs/common';
import { TablectService } from './tablect.service';
import { TablectController } from './tablect.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TablectController],
  providers: [TablectService],
})
export class TablectModule {}
