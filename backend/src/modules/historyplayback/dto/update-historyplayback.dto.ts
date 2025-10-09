import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoryplaybackDto } from './create-historyplayback.dto';

export class UpdateHistoryplaybackDto extends PartialType(CreateHistoryplaybackDto) {}
