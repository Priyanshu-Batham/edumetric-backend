import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ExamSessionsService } from './exam-sessions.service';
import { CreateExamSessionDto, UpdateExamSessionDto } from './dto/exam-session.dto';

@ApiTags('Exam Sessions')
@Controller('exam-sessions')
export class ExamSessionsController {
  constructor(private readonly examSessionsService: ExamSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exam sessions with optional filters' })
  @ApiQuery({ name: 'semester', required: false })
  @ApiQuery({ name: 'exam_session', required: false })
  @ApiQuery({ name: 'result', required: false, description: 'PASS or FAIL' })
  findAll(
    @Query('semester') semester?: string,
    @Query('exam_session') exam_session?: string,
    @Query('result') result?: string,
  ) {
    return this.examSessionsService.findAll({ semester, exam_session, result });
  }

  @Get('semesters')
  @ApiOperation({ summary: 'Get all distinct semesters' })
  getSemesters() {
    return this.examSessionsService.getDistinctSemesters();
  }

  @Get('exam-session-names')
  @ApiOperation({ summary: 'Get all distinct exam session names' })
  getExamSessionNames() {
    return this.examSessionsService.getDistinctExamSessions();
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get all exam sessions for a student' })
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.examSessionsService.findByStudent(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single exam session with all subject results' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.examSessionsService.findOne(id);
  }

  //Disabled for security, I'll use them when admin login is setup
  // @Post()
  // @ApiOperation({ summary: 'Create an exam session' })
  // create(@Body() dto: CreateExamSessionDto) {
  //   return this.examSessionsService.create(dto);
  // }

  // @Put(':id')
  // @ApiOperation({ summary: 'Update an exam session' })
  // update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExamSessionDto) {
  //   return this.examSessionsService.update(id, dto);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete an exam session' })
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.examSessionsService.remove(id);
  // }
}
