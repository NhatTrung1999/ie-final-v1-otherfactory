import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { StagelistService } from './stagelist.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateStagelistDto } from './dto/create-stagelist.dto';
import { UpdateOrderDto } from './dto/update-stagelist.dto';

@Controller('stagelist')
export class StagelistController {
  constructor(private readonly stagelistService: StagelistService) {}

  @Post('stagelist-upload')
  @UseInterceptors(FilesInterceptor('files'))
  async stagelistUpload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: CreateStagelistDto,
    @Request() req,
  ) {
    return await this.stagelistService.stagelistUpload(body, files, req.user);
  }

  @Get('stagelist-list')
  async stagelistList(
    @Query('DateFrom') DateFrom: string,
    @Query('DateTo') DateTo: string,
    @Query('Season') Season: string,
    @Query('Stage') Stage: string,
    @Query('Area') Area: string,
    @Query('Article') Article: string,
  ) {
    // console.log(DateFrom, DateTo, Season, Stage, Area, Article);
    return await this.stagelistService.stagelistList(
      DateFrom,
      DateTo,
      Season,
      Stage,
      Area,
      Article,
    );
  }

  @Post('update-order')
  async updateOrder(@Body() body: UpdateOrderDto) {
    return await this.stagelistService.updateOrder(body.ids);
  }

  @Delete('stagelist-delete/:id')
  async stagelistDelete(@Param('id') id: string) {
    return await this.stagelistService.stagelistDelete(id);
  }
}
