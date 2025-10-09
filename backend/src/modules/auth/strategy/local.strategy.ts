import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ passReqToCallback: true });
  }

  async validate(request: Request): Promise<any> {
    const { username, password, factory } = request.body as any;
    const user = await this.authService.validateUser(
      username,
      password,
      factory,
    );
    if (!user) {
      throw new UnauthorizedException('Account or password is not valid!');
    }
    return user;
  }
}
