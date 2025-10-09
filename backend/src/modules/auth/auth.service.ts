import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IAuth } from 'src/types/auth';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
    factory: string,
  ): Promise<IAuth | null> {
    const user = await this.usersService.validate(username, pass, factory);
    if (user && user.Password === pass) {
      const { Password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: IAuth) {
    const payload = { username: user.Name, sub: user.UserID, factory: user.Factory };
    return {
      auth: {
        Id: user.Id,
        Name: user.Name,
        UserID: user.UserID,
        Factory: user.Factory,
        Role: user.Role,
        Permission: user.Permission,
        Active: user.Active,
        CreatedAt: user.CreatedAt,
        CreatedDate: user.CreatedDate,
        UpdatedAt: user.UpdatedAt,
        UpdatedDate: user.UpdatedDate,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }
}
