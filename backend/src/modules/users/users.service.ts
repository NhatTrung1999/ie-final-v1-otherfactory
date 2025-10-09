import { Inject, Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { IAuth } from 'src/types/auth';

@Injectable()
export class UsersService {
  constructor(@Inject('IE') private readonly IE: Sequelize) {}

  async validate(username: string, password: string, factory: string) {
    const payload: any = await this.IE.query(
      `SELECT *
        FROM IE_Account
        WHERE UserID = ? AND [Password] = ? AND Factory = ?`,
      {
        replacements: [username, password, factory],
        type: QueryTypes.SELECT,
      },
    );

    if (payload.length === 0) return false;
    return payload[0];
  }
}
