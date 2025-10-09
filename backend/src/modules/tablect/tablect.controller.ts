import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TablectService } from './tablect.service';
import { CreateTablectDto } from './dto/create-tablect.dto';
import { UpdateTablectDto } from './dto/update-tablect.dto';

@Controller('tablect')
export class TablectController {
  constructor(private readonly tablectService: TablectService) {}

  @Get('get-data')
  getData(
    @Query('DateFrom') DateFrom: string,
    @Query('DateTo') DateTo: string,
    @Query('Season') Season: string,
    @Query('Stage') Stage: string,
    @Query('Area') Area: string,
    @Query('Article') Article: string,
  ) {
    return this.tablectService.getData(
      DateFrom,
      DateTo,
      Season,
      Stage,
      Area,
      Article,
    );
  }

  @Post('create-data')
  async createData(@Body() body: CreateTablectDto) {
    return this.tablectService.createData(body);
  }

  @Patch('save-data')
  async saveData(@Body() body: UpdateTablectDto) {
    return this.tablectService.saveData(body);
  }

  @Delete(':Id')
  async deleteData(@Param('Id') Id: string) {
    return this.tablectService.deleteData(Id);
  }

  @Patch('confirm-data')
  async confirmData(@Body() body: UpdateTablectDto[]) {
    return this.tablectService.confirmData(body);
  }

  @Get('get-department-machine-type')
  async getDepartmentMachineType() {
    return this.tablectService.getDepartmentMachineType();
  }
}
