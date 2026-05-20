import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Global overview: totals, pass/fail, SGPA stats, course distribution' })
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('semester/:semester')
  @ApiOperation({ summary: 'Analytics for a specific semester' })
  getSemesterAnalytics(@Param('semester') semester: string) {
    return this.analyticsService.getSemesterAnalytics(semester);
  }

  @Get('subject/:subjectId')
  @ApiOperation({ summary: 'Stats for a subject: avg marks, grade distribution, student list' })
  @ApiQuery({ name: 'semester', required: false })
  @ApiQuery({ name: 'exam_session', required: false })
  getSubjectStats(
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Query('semester') semester?: string,
    @Query('exam_session') exam_session?: string,
  ) {
    return this.analyticsService.getSubjectStats(subjectId, { semester, exam_session });
  }

  @Get('subject/:subjectId/histogram')
  @ApiOperation({ summary: 'Marks histogram for a subject' })
  @ApiQuery({ name: 'bins', required: false, type: Number, description: 'Number of histogram bins (default 10)' })
  getSubjectHistogram(
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Query('bins') bins?: string,
  ) {
    return this.analyticsService.getSubjectMarksHistogram(subjectId, bins ? parseInt(bins) : 10);
  }

  @Get('grade-distribution')
  @ApiOperation({ summary: 'Grade distribution across all results' })
  @ApiQuery({ name: 'semester', required: false })
  @ApiQuery({ name: 'exam_session', required: false })
  getGradeDistribution(
    @Query('semester') semester?: string,
    @Query('exam_session') exam_session?: string,
  ) {
    return this.analyticsService.getGradeDistribution({ semester, exam_session });
  }

  @Get('sgpa-distribution')
  @ApiOperation({ summary: 'SGPA range distribution (bucket chart data)' })
  @ApiQuery({ name: 'semester', required: false })
  @ApiQuery({ name: 'course', required: false })
  getSgpaDistribution(
    @Query('semester') semester?: string,
    @Query('course') course?: string,
  ) {
    return this.analyticsService.getSgpaDistribution({ semester, course });
  }

  @Get('top-performers')
  @ApiOperation({ summary: 'Top N performing students by SGPA' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of results (default 10)' })
  @ApiQuery({ name: 'semester', required: false })
  @ApiQuery({ name: 'exam_session', required: false })
  @ApiQuery({ name: 'course', required: false })
  getTopPerformers(
    @Query('limit') limit?: string,
    @Query('semester') semester?: string,
    @Query('exam_session') exam_session?: string,
    @Query('course') course?: string,
  ) {
    return this.analyticsService.getTopPerformers(
      limit ? parseInt(limit) : 10,
      { semester, exam_session, course },
    );
  }

  @Get('compare-students')
  @ApiOperation({ summary: 'Compare multiple students side-by-side' })
  @ApiQuery({ name: 'ids', description: 'Comma-separated student IDs e.g. 1,2,3' })
  compareStudents(@Query('ids') ids: string) {
    const studentIds = ids.split(',').map(id => parseInt(id.trim())).filter(Boolean);
    return this.analyticsService.compareStudents(studentIds);
  }

  @Get('compare-exam-sessions')
  @ApiOperation({ summary: 'Compare two exam sessions' })
  @ApiQuery({ name: 'session1', required: true })
  @ApiQuery({ name: 'session2', required: true })
  compareExamSessions(
    @Query('session1') session1: string,
    @Query('session2') session2: string,
  ) {
    return this.analyticsService.compareExamSessions(session1, session2);
  }

  @Get('student/:studentId/trend')
  @ApiOperation({ summary: 'Semester-wise SGPA/marks trend for a student' })
  getStudentTrend(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.analyticsService.getStudentSemesterTrend(studentId);
  }

  @Get('course/:course')
  @ApiOperation({ summary: 'Analytics aggregated by course' })
  getCourseAnalytics(@Param('course') course: string) {
    return this.analyticsService.getCourseAnalytics(course);
  }
}
