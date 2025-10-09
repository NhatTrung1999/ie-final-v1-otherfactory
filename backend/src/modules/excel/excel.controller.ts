import { Controller, Get, Query, Res } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { Response } from 'express';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('export-lsa')
  async exportLSA(
    @Query('DateFrom') DateFrom: string,
    @Query('DateTo') DateTo: string,
    @Query('Season') Season: string,
    @Query('Stage') Stage: string,
    @Query('Area') Area: string,
    @Query('Article') Article: string,
    @Query('Account') Account: string,
    @Res() res: Response,
  ) {
    console.log(Account);
    const buffer = await this.excelService.exportLSA(
      DateFrom,
      DateTo,
      Season,
      Stage,
      Area,
      Article,
      Account,
    );
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=ExcelLSA.xlsx',
    });
    res.send(buffer);
  }

  @Get('export-time-study')
  async exportTimeStudy(
    @Query('DateFrom') DateFrom: string,
    @Query('DateTo') DateTo: string,
    @Query('Season') Season: string,
    @Query('Stage') Stage: string,
    @Query('Area') Area: string,
    @Query('Article') Article: string,
    @Query('Account') Account: string,
    @Res() res: Response,
  ) {
    const buffer = await this.excelService.exportTimeStudy(
      DateFrom,
      DateTo,
      Season,
      Stage,
      Area,
      Article,
      Account,
    );
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=ExcelTimeStudy.xlsx',
    });
    res.send(buffer);
  }
}
