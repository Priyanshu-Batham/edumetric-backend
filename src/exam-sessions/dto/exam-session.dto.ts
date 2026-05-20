import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateExamSessionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Type(() => Number)
  student_id: number;

  @ApiProperty({ example: '3rd' })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ example: 'Even 2024' })
  @IsString()
  @IsNotEmpty()
  exam_session: string;

  @ApiPropertyOptional({ example: 8.5 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sgpa?: number;

  @ApiPropertyOptional({ example: 'A' })
  @IsString()
  @IsOptional()
  average_grade?: string;

  @ApiPropertyOptional({ example: 'PASS' })
  @IsString()
  @IsOptional()
  result?: string;

  @ApiPropertyOptional({ example: 450 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  total_marks?: number;

  @ApiPropertyOptional({ example: 600 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  max_marks?: number;

  @ApiPropertyOptional({ example: 24 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  total_credits?: number;
}

export class UpdateExamSessionDto extends PartialType(CreateExamSessionDto) {}
