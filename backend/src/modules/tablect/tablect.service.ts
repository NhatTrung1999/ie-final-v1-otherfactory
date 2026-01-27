import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CreateTablectDto } from './dto/create-tablect.dto';
import { QueryTypes } from 'sequelize';
import { ITablectData } from 'src/types/tablect';
import { UpdateTablectDto } from './dto/update-tablect.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TablectService {
  constructor(
    @Inject('IE') private readonly IE: Sequelize,
    private readonly configService: ConfigService,
  ) {}

  async getData(
    DateFrom: string,
    DateTo: string,
    Season: string,
    Stage: string,
    Area: string,
    Article: string,
    IsCompleted: boolean = false,
  ) {
    let where = 'WHERE 1=1';
    const replacements: any[] = [];

    if (DateFrom && DateTo) {
      where += ` AND sl.[Date] BETWEEN ? AND ?`;
      replacements.push(DateFrom, DateTo);
    }

    if (Season) {
      where += ` AND sl.Season LIKE ?`;
      replacements.push(`%${Season}%`);
    }

    if (Stage) {
      where += ` AND sl.Stage LIKE ?`;
      replacements.push(`%${Stage}%`);
    }

    if (Area) {
      where += ` AND sl.Area LIKE ?`;
      replacements.push(`%${Area}%`);
    }

    if (Article) {
      where += ` AND sl.Article LIKE ?`;
      replacements.push(`%${Article}%`);
    }

    if (IsCompleted) {
      where += ` AND sl.IsCompleted <> '1'`;
    }

    let records: ITablectData[] = await this.IE.query(
      `SELECT tb.*
        FROM IE_TableCT AS tb
        LEFT JOIN IE_StageList AS sl ON sl.Id = tb.Id
        ${where}
        ORDER BY 
          CASE WHEN tb.OrderIndex IS NULL THEN 1 ELSE 0 END, 
          tb.OrderIndex ASC, 
          tb.CreatedAt`,
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

  async updateOrder(ids: string[]) {
    const transaction = await this.IE.transaction();
    try {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        await this.IE.query(
          `UPDATE IE_TableCT SET OrderIndex = ? WHERE Id = ?`,
          {
            replacements: [i, id],
            type: QueryTypes.UPDATE,
            transaction: transaction,
          },
        );
      }
      await transaction.commit();
      return { message: 'Order updated successfully' };
    } catch (error) {
      await transaction.rollback();
      throw new InternalServerErrorException('Failed to update order');
    }
  }

  async createData(body: CreateTablectDto) {
    const {
      Id,
      No,
      ProgressStagePartName,
      Area,
      Path,
      Nva,
      Va,
      IsSave,
      CreatedBy,
    } = body;
    await this.IE.query(
      `
      INSERT INTO IE_TableCT
          (Id, [No], ProgressStagePartName, Area, [Path], Nva, Va, IsSave, CreatedBy, CreatedAt)
      VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE())`,
      {
        replacements: [
          Id,
          No,
          ProgressStagePartName,
          Area,
          Path,
          Nva,
          Va,
          IsSave,
          CreatedBy,
        ],
        type: QueryTypes.INSERT,
      },
    );

    let records: ITablectData[] = await this.IE.query(
      `SELECT *
        FROM IE_TableCT
        WHERE Id = ?
        ORDER BY CreatedAt`,
      { replacements: [Id], type: QueryTypes.SELECT },
    );

    records = records.map((item) => {
      const normalizedPath = item.Path.replace(/\\/g, '/');
      const relativePath = normalizedPath.split('/IE_VIDEO')[1];
      return {
        ...item,
        Path: `${this.configService.get('BASEPATH')}/IE_VIDEO${relativePath}`,
      };
    });

    return records[0];
  }

  async saveData(body: UpdateTablectDto) {
    const { Id, Nva, Va, IsSave, MachineType = '', Loss = '' } = body;
    await this.IE.query(
      `
      UPDATE IE_TableCT
      SET
          Nva = ?,
          Va = ?,
          MachineType = ?,
	        Loss = ?,
          IsSave = ?
      WHERE Id = ?`,
      {
        replacements: [Nva, Va, MachineType, Loss, IsSave, Id],
        type: QueryTypes.UPDATE,
      },
    );

    const records: ITablectData[] = await this.IE.query(
      `SELECT *
        FROM IE_TableCT
        WHERE Id = ?`,
      { replacements: [Id], type: QueryTypes.SELECT },
    );

    return records;
  }

  async deleteData(Id: string) {
    await this.IE.query(`DELETE FROM IE_TableCT WHERE Id = ?`, {
      replacements: [Id],
      type: QueryTypes.DELETE,
    });

    const records: ITablectData[] = await this.IE.query(
      `SELECT *
        FROM IE_TableCT
        ORDER BY CreatedAt`,
      { replacements: [Id], type: QueryTypes.SELECT },
    );
    return records;
  }

  async confirmData(body: UpdateTablectDto[]) {
    // console.log(body);
    try {
      for (let item of body) {
        const { Id, ConfirmId } = item;
        await this.IE.query(
          `
          UPDATE IE_TableCT
          SET
              ConfirmId = ?
          WHERE Id = ?`,
          {
            replacements: [ConfirmId, Id],
            type: QueryTypes.UPDATE,
          },
        );
      }
      const records: ITablectData[] = await this.IE.query(
        `SELECT *
            FROM IE_TableCT
            ORDER BY CreatedAt`,
        { type: QueryTypes.SELECT },
      );
      return records;
    } catch (error: any) {
      throw new InternalServerErrorException(error);
    }
  }

  async getDepartmentMachineType() {
    const records = await this.IE.query(
      `SELECT MachineTypeEn, MachineTypeCN, MachineTypeVN, Loss
        FROM IE_Department_MachineType`,
      { type: QueryTypes.SELECT },
    );

    return records;
  }
}
