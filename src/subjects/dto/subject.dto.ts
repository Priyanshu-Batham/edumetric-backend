import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ example: 'CS301' })
  @IsString()
  @IsNotEmpty()
  paper_code: string;

  @ApiProperty({ example: 'Data Structures & Algorithms' })
  @IsString()
  @IsNotEmpty()
  paper_name: string;
}

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
