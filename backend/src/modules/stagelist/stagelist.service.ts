import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStagelistDto } from './dto/create-stagelist.dto';
import * as path from 'path';
import * as fs from 'fs';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { IStageListData } from 'src/types/stagelist';
import { ConfigService } from '@nestjs/config';
import { ITablectData } from 'src/types/tablect';

@Injectable()
export class StagelistService {
  constructor(
    @Inject('IE') private readonly IE: Sequelize,
    private readonly configService: ConfigService,
  ) {}

  async stagelistUpload(
    createStagelistDto: CreateStagelistDto,
    files: Array<Express.Multer.File>,
    user: any,
  ) {
    try {
      const { date, season, stage, cutDie, area, article } = createStagelistDto;
      const { userId, factory } = user;
      let resData: IStageListData[] = [];

      const networkPath =
        this.configService.get<string>('UPLOAD_DESTINATION') ||
        '\\192.168.0.102\\cie\\IE_VIDEO';
      // const networkPath =
      // this.configService.get<string>('UPLOAD_DESTINATION') ||
      // '\\192.168.30.9\\cime\\IE_VIDEO';
      // const networkPath =
      //   this.configService.get<string>('UPLOAD_DESTINATION') ||
      //   '\\192.168.55.3\\lym\\ME\\IE_VIDEO';
      // const networkPath =
      //   this.configService.get<string>('UPLOAD_DESTINATION') ||
      //   '\\192.168.60.6\\tyxuan2\\ME\\IE_VIDEO';

      // const basePath = path.join(
      //   process.cwd(),
      //   'uploads',
      //   date,
      //   season,
      //   stage,
      //   area,
      //   article,
      // );

      const basePath = path.join(
        networkPath,
        date,
        season,
        stage,
        area,
        article,
      );

      if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true });
      }

      for (let item of files) {
        const originalName = Buffer.from(item.filename, 'latin1').toString(
          'utf-8',
        );
        const id = uuidv4();
        const filePath = path.join(basePath, item.filename);
        await this.IE.query(
          `INSERT INTO IE_StageList
        (
          Id,
          [Date],
          Season,
          Stage,
          CutDie,
          Area,
          Article,
          Name,
          [Path],
          CreatedBy,
          CreatedFactory,
          CreatedAt
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          GETDATE()
        )`,
          {
            replacements: [
              id,
              date,
              season,
              stage,
              cutDie,
              area,
              article,
              originalName,
              filePath,
              userId,
              factory,
            ],
            type: QueryTypes.INSERT,
          },
        );

        const result: IStageListData[] = await this.IE.query(
          `SELECT * FROM IE_StageList WHERE Id = ?`,
          { replacements: [id, date], type: QueryTypes.SELECT },
        );
        resData.push(result[0]);
      }

      resData = resData.map((item) => {
        const normalizedPath = item.Path.replace(/\\/g, '/');
        const relativePath = normalizedPath.split('/IE_VIDEO')[1];
        return {
          ...item,
          Path: `${this.configService.get('BASEPATH')}/IE_VIDEO${relativePath}`,
        };
      });

      return resData;
    } catch (error: any) {
      throw new InternalServerErrorException('Upload video failed!');
    }
  }

  async stagelistList(
    DateFrom: string,
    DateTo: string,
    Season: string,
    Stage: string,
    Area: string,
    Article: string,
  ) {
    let where = 'WHERE 1=1';
    const replacements: any[] = [];

    if (DateFrom && DateTo) {
      where += ` AND [Date] BETWEEN ? AND ?`;
      replacements.push(DateFrom, DateTo);
    }

    if (Season) {
      where += ` AND Season LIKE ?`;
      replacements.push(`%${Season}%`);
    }

    if (Stage) {
      where += ` AND Stage LIKE ?`;
      replacements.push(`%${Stage}%`);
    }

    if (Area) {
      where += ` AND Area LIKE ?`;
      replacements.push(`%${Area}%`);
    }

    if (Article) {
      where += ` AND Article LIKE ?`;
      replacements.push(`%${Article}%`);
    }

    let records: IStageListData[] = await this.IE.query(
      `SELECT *
        FROM IE_StageList
        ${where}
        ORDER BY CreatedAt`,
      { replacements, type: QueryTypes.SELECT },
    );
    records = records.map((item) => {
      const normalizedPath = item.Path.replace(/\\/g, '/');
      const relativePath = normalizedPath.split('/IE_VIDEO')[1];
      return {
        ...item,
        Path: `${this.configService.get('BASEPATH')}/IE_VIDEO${relativePath}`,
      };
    });
    return records;
  }

  async stagelistDelete(id: string): Promise<IStageListData[]> {
    const record: IStageListData[] = await this.IE.query(
      `SELECT * FROM IE_StageList WHERE Id = ?`,
      { replacements: [id], type: QueryTypes.SELECT },
    );

    const checkExist: ITablectData[] = await this.IE.query(
      `SELECT * FROM IE_TableCT WHERE Id = ?`,
      { replacements: [id], type: QueryTypes.SELECT },
    );

    if (checkExist.length > 0) {
      throw new BadRequestException(
        'Please delete data related in TableCT before!',
      );
    }

    if (!record.length) {
      throw new NotFoundException(`No stagelist found with Id: ${id}`);
    }
    const { Path } = record[0];

    await this.IE.query(`DELETE FROM IE_StageList WHERE Id = ?`, {
      replacements: [id],
      type: QueryTypes.DELETE,
    });

    if (fs.existsSync(Path)) {
      fs.unlinkSync(Path);
    }

    const dir = path.dirname(Path);
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir, { recursive: true });
    }

    const records: IStageListData[] = await this.IE.query(
      `SELECT * FROM IE_StageList`,
      { replacements: [id], type: QueryTypes.SELECT },
    );

    return records;
  }
}
