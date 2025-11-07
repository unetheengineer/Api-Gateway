import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

/**
 * Update Event DTO - All fields optional
 */
export class UpdateEventDto extends PartialType(CreateEventDto) {}
