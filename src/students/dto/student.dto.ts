import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: '2021001' })
  @IsString()
  @IsNotEmpty()
  enrollment_no: string;

  @ApiProperty({ example: '101' })
  @IsString()
  @IsNotEmpty()
  roll_no: string;

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Ramesh Sharma' })
  @IsString()
  @IsOptional()
  father_name?: string;

  @ApiPropertyOptional({ example: 'Sunita Sharma' })
  @IsString()
  @IsOptional()
  mother_name?: string;

  @ApiPropertyOptional({ example: 'B.Tech CSE' })
  @IsString()
  @IsOptional()
  course?: string;
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}

export class StudentQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() course?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() enrollment_no?: string;
}
