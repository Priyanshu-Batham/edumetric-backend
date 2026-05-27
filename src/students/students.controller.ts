import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto/student.dto';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all students with optional filters' })
  @ApiQuery({ name: 'course', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'enrollment_no', required: false })
  findAll(@Query() query: StudentQueryDto) {
    return this.studentsService.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get total student count' })
  getCount() {
    return this.studentsService.getCount();
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get all distinct courses' })
  getCourses() {
    return this.studentsService.getCourses();
  }

  @Get('enrollment/:enrollmentNo')
  @ApiOperation({ summary: 'Get student by enrollment number' })
  @ApiParam({ name: 'enrollmentNo' })
  findByEnrollment(@Param('enrollmentNo') enrollmentNo: string) {
    return this.studentsService.findByEnrollment(enrollmentNo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID with all exam sessions' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get full academic performance of a student' })
  getPerformance(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getStudentPerformance(id);
  }

  //Disabled for security, I'll use them when admin login is setup
  // @Post()
  // @ApiOperation({ summary: 'Create a new student' })
  // create(@Body() dto: CreateStudentDto) {
  //   return this.studentsService.create(dto);
  // }

  // @Put(':id')
  // @ApiOperation({ summary: 'Update a student' })
  // update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
  //   return this.studentsService.update(id, dto);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete a student' })
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.studentsService.remove(id);
  // }
}
