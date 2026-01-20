import { PartialType } from '@nestjs/mapped-types';
import { CreateStagelistDto } from './create-stagelist.dto';

export class UpdateStagelistDto extends PartialType(CreateStagelistDto) {}

export class UpdateOrderDto {
    ids: string[]
}