import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DuplicateService } from './duplicate.service';

@Controller('duplicate')
export class DuplicateController {
  constructor(private readonly duplicateService: DuplicateService) {}

  @Get('duplicate-list')
  async duplicateList(
    @Query('DateFrom') DateFrom: string,
    @Query('DateTo') DateTo: string,
    @Query('Season') Season: string,
    @Query('Stage') Stage: string,
    @Query('Area') Area: string,
    @Query('Article') Article: string,
  ) {
    return this.duplicateService.duplicateList(
      DateFrom,
      DateTo,
      Season,
      Stage,
      Area,
      Article,
    );
  }

  @Post('duplicate-stage')
  async duplicateStage(@Body() body: { ids: string[] }) {
    return this.duplicateService.duplicateStage(body.ids);
  }
}
