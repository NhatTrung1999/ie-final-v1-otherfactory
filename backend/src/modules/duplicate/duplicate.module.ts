import { Module } from '@nestjs/common';
import { DuplicateService } from './duplicate.service';
import { DuplicateController } from './duplicate.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DuplicateController],
  providers: [DuplicateService],
})
export class DuplicateModule {}
