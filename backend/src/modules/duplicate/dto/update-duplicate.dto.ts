import { PartialType } from '@nestjs/mapped-types';
import { CreateDuplicateDto } from './create-duplicate.dto';

export class UpdateDuplicateDto extends PartialType(CreateDuplicateDto) {}
