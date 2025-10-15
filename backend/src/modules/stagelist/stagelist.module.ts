import { BadRequestException, Module } from '@nestjs/common';
import { StagelistService } from './stagelist.service';
import { StagelistController } from './stagelist.controller';
import { DatabaseModule } from 'src/database/database.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { CreateStagelistDto } from './dto/create-stagelist.dto';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    DatabaseModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: (req, file, cb) => {
            const { date, season, stage, area, article } =
              req.body as CreateStagelistDto;
            const basePath = `${configService.get('UPLOAD_DESTINATION') || '\\192.168.0.102\\cie\\IE_VIDEO'}`;
            const targetPath = path.join(
              basePath,
              date,
              season,
              stage,
              area,
              article,
            );
            if (!fs.existsSync(targetPath)) {
              fs.mkdirSync(targetPath, { recursive: true });
            }
            cb(null, targetPath);
          },
          filename: (req, file, cb) => {
            const { date, season, stage, area, article } =
              req.body as CreateStagelistDto;
            const ext = path.extname(file.originalname);
            const baseName = path.basename(file.originalname, ext);
            // const destination = `${configService.get('UPLOAD_DESTINATION') || './uploads'}/${date}/${season}/${stage}/${area}/${article}`;
            const basePath =
              configService.get<string>('UPLOAD_DESTINATION') ||
              '\\192.168.0.102\\cie\\IE_VIDEO';
            const targetPath = path.join(
              basePath,
              date,
              season,
              stage,
              area,
              article,
            );
            let finalName = file.originalname;
            let counter = 0;

            while (fs.existsSync(path.join(targetPath, finalName))) {
              counter++;
              finalName = `${baseName}(${counter})${ext}`;
            }
            cb(null, finalName);
          },
        }),
        fileFilter: (req, file, cb) => {
          const allowedMimeTypes = [
            'video/mp4',
            'video/mpeg',
            'video/quicktime', // mov
            'video/x-msvideo', // avi
            'video/x-matroska', // mkv
          ];

          if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
              new BadRequestException(
                `Invalid file format: "${file.originalname}". Only video files are allowed (mp4, avi, mov, mkv).`,
              ),
              false,
            );
          }
          cb(null, true);
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [StagelistController],
  providers: [StagelistService],
})
export class StagelistModule {}
