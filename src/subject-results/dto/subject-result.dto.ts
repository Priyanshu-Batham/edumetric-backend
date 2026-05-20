import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSubjectResultDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Type(() => Number)
  exam_session_id: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Type(() => Number)
  subject_id: number;

  @ApiPropertyOptional({ example: 78 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  marks?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  credit?: number;

  @ApiPropertyOptional({ example: 'B+' })
  @IsString()
  @IsOptional()
  grade?: string;
}

export class BulkCreateSubjectResultDto {
  @ApiProperty({ type: [CreateSubjectResultDto] })
  results: CreateSubjectResultDto[];
}

export class UpdateSubjectResultDto extends PartialType(CreateSubjectResultDto) {}
