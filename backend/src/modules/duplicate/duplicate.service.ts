import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { IStageListData } from 'src/types/stagelist';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DuplicateService {
  constructor(
    @Inject('IE') private readonly IE: Sequelize,
    private readonly configService: ConfigService,
  ) {}

  async duplicateList(
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
        ORDER BY 
          CASE WHEN OrderIndex IS NULL THEN 1 ELSE 0 END, 
          OrderIndex ASC, 
          CreatedAt DESC`,
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

  async duplicateStage(ids: string[]) {
    // console.log(ids);
    const transaction = await this.IE.transaction();
    const newItems: IStageListData[] = [];
    const createdFiles: string[] = [];

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const currentDateFolder = `${year}-${month}-${day}`;

    const basePath =
      this.configService.get('UPLOAD_DESTINATION') ||
      '\\\\192.168.0.102\\cie\\IE_VIDEO';
    try {
      for (const id of ids) {
        const oldStagelist: any[] = await this.IE.query(
          `SELECT tb.*,
                  sl.Date, sl.Season, sl.Stage, sl.CutDie, sl.Area, sl.Article, sl.Name, sl.CreatedFactory
            FROM IE_TableCT AS tb
            LEFT JOIN IE_StageList AS sl ON sl.Id = tb.Id
            WHERE tb.Id = ?
          `,
          { replacements: [id], type: QueryTypes.SELECT, transaction },
        );
        if (!oldStagelist.length) continue;

        const origin = oldStagelist[0];
        const newId = uuidv4();

        const oldPath = origin.Path;
        let newPath = oldPath;

        if (oldPath && fs.existsSync(oldPath)) {
          const extension = path.extname(oldPath);
          const fileName = path.basename(oldPath, extension);
          const targetDir = path.join(
            basePath,
            currentDateFolder,
            origin.Season || 'UnknowSeason',
            origin.Stage || 'UnknowStage',
            origin.Area || 'UnknowArea',
            origin.Article || 'UnknowArticle',
          );
          if (!fs.existsSync(targetDir)) {
            try {
              fs.mkdirSync(targetDir, { recursive: true });
            } catch (error) {
              throw new Error(
                `Không thể tạo thư mục lưu trữ: ${error.message}`,
              );
            }
          }

          let newFileName = `${fileName}${extension}`;
          let newPath = path.join(targetDir, newFileName);

          if (fs.existsSync(newPath)) {
            newFileName = `${fileName}_copy_${Date.now()}${extension}`;
            newPath = path.join(targetDir, newFileName);
          }

          try {
            fs.copyFileSync(oldPath, newPath);
            createdFiles.push(newPath);
          } catch (error) {
            throw new Error(
              `Lỗi khi copy video (${fileName}): ${error.message}`,
            );
          }
        }
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
              newId,
              currentDateFolder,
              origin.Season,
              origin.Stage,
              origin.CutDie,
              origin.Area,
              origin.Article,
              origin.Name,
              newPath,
              origin.CreatedBy,
              origin.CreatedFactory,
            ],
            type: QueryTypes.INSERT,
            transaction,
          },
        );

        await this.IE.query(
          `INSERT INTO IE_TableCT 
           (Id, [No], ProgressStagePartName, Area, [Path], Nva, Va, MachineType, Loss, IsSave, CreatedBy, CreatedAt, OrderIndex)
           VALUES 
           (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), 9999)`,
          {
            replacements: [
              newId,
              origin.No,
              origin.ProgressStagePartName,
              origin.Area,
              newPath,
              origin.Nva,
              origin.Va,
              origin.MachineType,
              origin.Loss,
              origin.IsSave,
              origin.CreatedBy,
            ],
            type: QueryTypes.INSERT,
            transaction,
          },
        );

        const newItem: IStageListData[] = await this.IE.query(
          `SELECT * FROM IE_StageList WHERE Id = ?`,
          { replacements: [newId], type: QueryTypes.SELECT, transaction },
        );
        if (newItem.length) newItems.push(newItem[0]);
      }
      await transaction.commit();
      return { message: 'Duplicate success', data: newItems };
    } catch (error) {
      await transaction.rollback();
      if (createdFiles.length > 0) {
        for (const file of createdFiles) {
          try {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
            }
          } catch (error) {
            console.error(`Không thể xóa file rác: ${file}`, error);
          }
        }
      }
      throw new InternalServerErrorException(
        'Duplicate failed: ' + error.message,
      );
    }
  }
}
