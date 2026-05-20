import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { RankingsService } from './rankings.service';

@ApiTags('Rankings')
@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('semester/:semester')
  @ApiOperation({ summary: 'Rank all students in a semester by SGPA' })
  @ApiQuery({ name: 'exam_session', required: false })
  getRankBySemester(
    @Param('semester') semester: string,
    @Query('exam_session') exam_session?: string,
  ) {
    return this.rankingsService.getRankBySemester(semester, exam_session);
  }

  @Get('subject/:subjectId')
  @ApiOperation({ summary: 'Rank students in a subject by marks' })
  @ApiQuery({ name: 'semester', required: false })
  @ApiQuery({ name: 'exam_session', required: false })
  getRankBySubject(
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Query('semester') semester?: string,
    @Query('exam_session') exam_session?: string,
  ) {
    return this.rankingsService.getRankBySubject(subjectId, { semester, exam_session });
  }

  @Get('course/:course')
  @ApiOperation({ summary: 'Rank students within a course by SGPA' })
  @ApiQuery({ name: 'semester', required: false })
  @ApiQuery({ name: 'exam_session', required: false })
  getRankByCourse(
    @Param('course') course: string,
    @Query('semester') semester?: string,
    @Query('exam_session') exam_session?: string,
  ) {
    return this.rankingsService.getRankByCourse(course, { semester, exam_session });
  }

  @Get('overall')
  @ApiOperation({ summary: 'Overall CGPA-based all-time ranking' })
  @ApiQuery({ name: 'course', required: false })
  getOverallRanking(@Query('course') course?: string) {
    return this.rankingsService.getOverallCgpaRanking({ course });
  }

  @Get('student/:studentId/rank')
  @ApiOperation({ summary: 'Get rank of a specific student in a semester' })
  @ApiQuery({ name: 'semester', required: true })
  @ApiQuery({ name: 'exam_session', required: false })
  getStudentRank(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('semester') semester: string,
    @Query('exam_session') exam_session?: string,
  ) {
    return this.rankingsService.getStudentRank(studentId, semester, exam_session);
  }

  @Get('student/:studentId/percentile')
  @ApiOperation({ summary: 'Get percentile of a student in a semester' })
  @ApiQuery({ name: 'semester', required: true })
  getStudentPercentile(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('semester') semester: string,
  ) {
    return this.rankingsService.getStudentPercentile(studentId, semester);
  }
}
