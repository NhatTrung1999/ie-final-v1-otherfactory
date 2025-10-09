import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { HistoryplaybackService } from './historyplayback.service';
import { CreateHistoryplaybackDto } from './dto/create-historyplayback.dto';

@Controller('historyplayback')
export class HistoryplaybackController {
  constructor(
    private readonly historyplaybackService: HistoryplaybackService,
  ) {}

  @Get('historyplayback-list')
  async historyplaybackList() {
    return this.historyplaybackService.historyplaybackList();
  }

  @Post('historyplayback-create')
  async historyplaybackCreate(@Body() body: CreateHistoryplaybackDto) {
    return this.historyplaybackService.historyplaybackCreate(body);
  }

  @Delete('historyplayback-delete')
  async historyplaybackDelete(@Query('Id') Id: string) {
    return this.historyplaybackService.historyplaybackDelete(Id);
  }

  @Delete('historyplayback-delete-multiple')
  async historyplaybackDeleteMultiple(
    @Query('HistoryPlaybackId') HistoryPlaybackId: string,
  ) {
    return this.historyplaybackService.historyplaybackDeleteMultiple(HistoryPlaybackId);
  }
}
