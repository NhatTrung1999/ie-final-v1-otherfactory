import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';

export const databaseProviders = [
  {
    provide: 'IE',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const sequelize = new Sequelize({
        dialect: 'mssql',
        host: configService.get('IE_HOST'),
        port: configService.get('IE_PORT'),
        username: configService.get('IE_USERNAME'),
        password: configService.get('IE_PASSWORD'),
        database: configService.get('IE_DATABASE'),
        dialectOptions: {
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
        },
      });
      return await sequelize;
    },
  },
];
