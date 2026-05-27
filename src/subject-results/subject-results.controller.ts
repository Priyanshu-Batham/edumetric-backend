import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SubjectResultsService } from './subject-results.service';
import {
  CreateSubjectResultDto,
  UpdateSubjectResultDto,
  BulkCreateSubjectResultDto,
} from './dto/subject-result.dto';

@ApiTags('Subject Results')
@Controller('subject-results')
export class SubjectResultsController {
  constructor(private readonly subjectResultsService: SubjectResultsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subject results with optional filters' })
  @ApiQuery({ name: 'exam_session_id', required: false, type: Number })
  @ApiQuery({ name: 'subject_id', required: false, type: Number })
  findAll(
    @Query('exam_session_id') exam_session_id?: string,
    @Query('subject_id') subject_id?: string,
  ) {
    return this.subjectResultsService.findAll({
      exam_session_id: exam_session_id ? parseInt(exam_session_id) : undefined,
      subject_id: subject_id ? parseInt(subject_id) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single subject result' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectResultsService.findOne(id);
  }

  //Disabled for security, I'll use them when admin login is setup
  // @Post()
  // @ApiOperation({ summary: 'Create a subject result' })
  // create(@Body() dto: CreateSubjectResultDto) {
  //   return this.subjectResultsService.create(dto);
  // }

  // @Post('bulk')
  // @ApiOperation({ summary: 'Bulk create subject results' })
  // bulkCreate(@Body() dto: BulkCreateSubjectResultDto) {
  //   return this.subjectResultsService.bulkCreate(dto);
  // }

  // @Put(':id')
  // @ApiOperation({ summary: 'Update a subject result' })
  // update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubjectResultDto) {
  //   return this.subjectResultsService.update(id, dto);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete a subject result' })
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.subjectResultsService.remove(id);
  // }
}
