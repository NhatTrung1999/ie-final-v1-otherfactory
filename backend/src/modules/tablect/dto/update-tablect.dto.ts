import { PartialType } from '@nestjs/mapped-types';
import { CreateTablectDto } from './create-tablect.dto';

export class UpdateTablectDto extends PartialType(CreateTablectDto) {}
