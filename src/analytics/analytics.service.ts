import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamSession } from '../exam-sessions/entities/exam-session.entity';
import { SubjectResult } from '../subject-results/entities/subject-result.entity';
import { Student } from '../students/entities/student.entity';
import { Subject } from '../subjects/entities/subject.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ExamSession)
    private readonly sessionRepo: Repository<ExamSession>,
    @InjectRepository(SubjectResult)
    private readonly resultRepo: Repository<SubjectResult>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
  ) {}

  // ─── Overview ────────────────────────────────────────────────────────────────
  async getOverview() {
    const totalStudents = await this.studentRepo.count();
    const totalSessions = await this.sessionRepo.count();
    const totalSubjectResults = await this.resultRepo.count();

    const passFailRaw = await this.sessionRepo
      .createQueryBuilder('es')
      .select('UPPER(es.result)', 'result')
      .addSelect('COUNT(*)', 'count')
      .where('es.result IS NOT NULL')
      .groupBy('UPPER(es.result)')
      .getRawMany();

    const passFailMap: Record<string, number> = {};
    passFailRaw.forEach(r => { passFailMap[r.result] = parseInt(r.count); });

    const sgpaStats = await this.sessionRepo
      .createQueryBuilder('es')
      .select('AVG(es.sgpa)', 'avg')
      .addSelect('MAX(es.sgpa)', 'max')
      .addSelect('MIN(es.sgpa)', 'min')
      .where('es.sgpa IS NOT NULL')
      .getRawOne();

    const courses = await this.studentRepo
      .createQueryBuilder('s')
      .select('s.course', 'course')
      .addSelect('COUNT(*)', 'count')
      .where('s.course IS NOT NULL')
      .groupBy('s.course')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    return {
      totals: {
        students: totalStudents,
        exam_sessions: totalSessions,
        subject_results: totalSubjectResults,
      },
      pass_fail: {
        pass: passFailMap['PASS'] || 0,
        fail: passFailMap['FAIL'] || 0,
        other: totalSessions - (passFailMap['PASS'] || 0) - (passFailMap['FAIL'] || 0),
      },
      sgpa: {
        average: sgpaStats?.avg ? parseFloat(parseFloat(sgpaStats.avg).toFixed(2)) : null,
        highest: sgpaStats?.max ? parseFloat(sgpaStats.max) : null,
        lowest: sgpaStats?.min ? parseFloat(sgpaStats.min) : null,
      },
      course_distribution: courses.map(c => ({
        course: c.course,
        count: parseInt(c.count),
      })),
    };
  }

  // ─── Semester Analytics ───────────────────────────────────────────────────────
  async getSemesterAnalytics(semester: string) {
    const sessions = await this.sessionRepo
      .createQueryBuilder('es')
      .leftJoinAndSelect('es.student', 'student')
      .leftJoinAndSelect('es.subject_results', 'sr')
      .leftJoinAndSelect('sr.subject', 'subject')
      .where('es.semester = :semester', { semester })
      .getMany();

    if (!sessions.length) return { semester, data: null, message: 'No data found' };

    const sgpaValues = sessions.filter(s => s.sgpa != null).map(s => s.sgpa);
    const passCount = sessions.filter(s => s.result?.toUpperCase() === 'PASS').length;
    const failCount = sessions.filter(s => s.result?.toUpperCase() === 'FAIL').length;

    const gradeFreq: Record<string, number> = {};
    sessions.forEach(sess => {
      (sess.subject_results || []).forEach(sr => {
        if (sr.grade) gradeFreq[sr.grade] = (gradeFreq[sr.grade] || 0) + 1;
      });
    });

    return {
      semester,
      total_students: sessions.length,
      pass_count: passCount,
      fail_count: failCount,
      pass_percentage: parseFloat(((passCount / sessions.length) * 100).toFixed(2)),
      sgpa: {
        average: sgpaValues.length ? parseFloat((sgpaValues.reduce((a, b) => a + b, 0) / sgpaValues.length).toFixed(2)) : null,
        highest: sgpaValues.length ? Math.max(...sgpaValues) : null,
        lowest: sgpaValues.length ? Math.min(...sgpaValues) : null,
      },
      grade_distribution: Object.entries(gradeFreq)
        .map(([grade, count]) => ({ grade, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  // ─── Subject Stats ────────────────────────────────────────────────────────────
  async getSubjectStats(subjectId: number, filters?: { semester?: string; exam_session?: string }) {
    const qb = this.resultRepo
      .createQueryBuilder('sr')
      .leftJoinAndSelect('sr.subject', 'subject')
      .leftJoinAndSelect('sr.exam_session', 'es')
      .leftJoinAndSelect('es.student', 'student')
      .where('sr.subject_id = :subjectId', { subjectId });

    if (filters?.semester) qb.andWhere('es.semester = :semester', { semester: filters.semester });
    if (filters?.exam_session) qb.andWhere('es.exam_session = :exam_session', { exam_session: filters.exam_session });

    const results = await qb.getMany();
    if (!results.length) return { subject_id: subjectId, data: null, message: 'No results found' };

    const marks = results.filter(r => r.marks != null).map(r => r.marks);
    const gradeFreq: Record<string, number> = {};
    results.forEach(r => {
      if (r.grade) gradeFreq[r.grade] = (gradeFreq[r.grade] || 0) + 1;
    });

    const subject = results[0]?.subject;

    return {
      subject: {
        id: subject?.id,
        paper_code: subject?.paper_code,
        paper_name: subject?.paper_name,
      },
      total_students: results.length,
      marks_stats: {
        average: marks.length ? parseFloat((marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2)) : null,
        highest: marks.length ? Math.max(...marks) : null,
        lowest: marks.length ? Math.min(...marks) : null,
        median: marks.length ? this.median(marks) : null,
      },
      grade_distribution: Object.entries(gradeFreq)
        .map(([grade, count]) => ({ grade, count, percentage: parseFloat(((count / results.length) * 100).toFixed(2)) }))
        .sort((a, b) => b.count - a.count),
      student_results: results.map(r => ({
        student_id: r.exam_session?.student?.id,
        name: r.exam_session?.student?.name,
        enrollment_no: r.exam_session?.student?.enrollment_no,
        marks: r.marks,
        grade: r.grade,
        credit: r.credit,
        semester: r.exam_session?.semester,
        exam_session: r.exam_session?.exam_session,
      })),
    };
  }

  // ─── Grade Distribution (Global) ─────────────────────────────────────────────
  async getGradeDistribution(filters?: { semester?: string; exam_session?: string }) {
    const qb = this.resultRepo
      .createQueryBuilder('sr')
      .leftJoin('sr.exam_session', 'es')
      .select('sr.grade', 'grade')
      .addSelect('COUNT(*)', 'count')
      .where('sr.grade IS NOT NULL');

    if (filters?.semester) qb.andWhere('es.semester = :semester', { semester: filters.semester });
    if (filters?.exam_session) qb.andWhere('es.exam_session = :exam_session', { exam_session: filters.exam_session });

    const raw = await qb.groupBy('sr.grade').orderBy('COUNT(*)', 'DESC').getRawMany();
    const total = raw.reduce((sum, r) => sum + parseInt(r.count), 0);

    return raw.map(r => ({
      grade: r.grade,
      count: parseInt(r.count),
      percentage: parseFloat(((parseInt(r.count) / total) * 100).toFixed(2)),
    }));
  }

  // ─── SGPA Distribution ────────────────────────────────────────────────────────
  async getSgpaDistribution(filters?: { semester?: string; course?: string }) {
    const qb = this.sessionRepo
      .createQueryBuilder('es')
      .leftJoin('es.student', 'student')
      .where('es.sgpa IS NOT NULL');

    if (filters?.semester) qb.andWhere('es.semester = :semester', { semester: filters.semester });
    if (filters?.course) qb.andWhere('student.course ILIKE :course', { course: `%${filters.course}%` });

    const sessions = await qb.select(['es.sgpa', 'es.semester', 'es.exam_session']).getMany();

    const buckets = {
      '9-10': 0, '8-9': 0, '7-8': 0, '6-7': 0, '5-6': 0, 'below-5': 0,
    };
    sessions.forEach(s => {
      const v = s.sgpa;
      if (v >= 9) buckets['9-10']++;
      else if (v >= 8) buckets['8-9']++;
      else if (v >= 7) buckets['7-8']++;
      else if (v >= 6) buckets['6-7']++;
      else if (v >= 5) buckets['5-6']++;
      else buckets['below-5']++;
    });

    return {
      total: sessions.length,
      distribution: Object.entries(buckets).map(([range, count]) => ({
        range,
        count,
        percentage: sessions.length ? parseFloat(((count / sessions.length) * 100).toFixed(2)) : 0,
      })),
    };
  }

  // ─── Top Performers ───────────────────────────────────────────────────────────
  async getTopPerformers(limit = 10, filters?: { semester?: string; exam_session?: string; course?: string }) {
    const qb = this.sessionRepo
      .createQueryBuilder('es')
      .leftJoinAndSelect('es.student', 'student')
      .where('es.sgpa IS NOT NULL');

    if (filters?.semester) qb.andWhere('es.semester = :semester', { semester: filters.semester });
    if (filters?.exam_session) qb.andWhere('es.exam_session = :exam_session', { exam_session: filters.exam_session });
    if (filters?.course) qb.andWhere('student.course ILIKE :course', { course: `%${filters.course}%` });

    qb.orderBy('es.sgpa', 'DESC').limit(limit);

    const results = await qb.getMany();
    return results.map((r, i) => ({
      rank: i + 1,
      student_id: r.student?.id,
      name: r.student?.name,
      enrollment_no: r.student?.enrollment_no,
      roll_no: r.student?.roll_no,
      course: r.student?.course,
      semester: r.semester,
      exam_session: r.exam_session,
      sgpa: r.sgpa,
      result: r.result,
      total_marks: r.total_marks,
      max_marks: r.max_marks,
      percentage: r.total_marks && r.max_marks
        ? parseFloat(((r.total_marks / r.max_marks) * 100).toFixed(2))
        : null,
    }));
  }

  // ─── Comparison: Multiple Students ───────────────────────────────────────────
  async compareStudents(studentIds: number[]) {
    const results = await Promise.all(
      studentIds.map(async (id) => {
        const sessions = await this.sessionRepo.find({
          where: { student_id: id },
          relations: ['student'],
          order: { semester: 'ASC' },
        });
        const sgpaValues = sessions.filter(s => s.sgpa != null).map(s => s.sgpa);
        return {
          student_id: id,
          name: sessions[0]?.student?.name || null,
          enrollment_no: sessions[0]?.student?.enrollment_no || null,
          course: sessions[0]?.student?.course || null,
          semester_data: sessions.map(s => ({
            semester: s.semester,
            exam_session: s.exam_session,
            sgpa: s.sgpa,
            result: s.result,
          })),
          cgpa: sgpaValues.length
            ? parseFloat((sgpaValues.reduce((a, b) => a + b, 0) / sgpaValues.length).toFixed(2))
            : null,
        };
      })
    );
    return results;
  }

  // ─── Marks Histogram for a Subject ───────────────────────────────────────────
  async getSubjectMarksHistogram(subjectId: number, bins = 10) {
    const results = await this.resultRepo.find({
      where: { subject_id: subjectId },
      relations: ['subject'],
    });

    const marks = results.filter(r => r.marks != null).map(r => r.marks);
    if (!marks.length) return { subject_id: subjectId, histogram: [] };

    const min = Math.min(...marks);
    const max = Math.max(...marks);
    const binSize = Math.ceil((max - min + 1) / bins);

    const histogram: { range: string; count: number }[] = [];
    for (let i = 0; i < bins; i++) {
      const low = min + i * binSize;
      const high = low + binSize - 1;
      histogram.push({
        range: `${low}-${high}`,
        count: marks.filter(m => m >= low && m <= high).length,
      });
    }

    return {
      subject_id: subjectId,
      paper_code: results[0]?.subject?.paper_code,
      paper_name: results[0]?.subject?.paper_name,
      total: marks.length,
      histogram,
    };
  }

  // ─── Semester Trend for a Student ────────────────────────────────────────────
  async getStudentSemesterTrend(studentId: number) {
    const sessions = await this.sessionRepo.find({
      where: { student_id: studentId },
      relations: ['student'],
      order: { semester: 'ASC' },
    });
    return sessions.map(s => ({
      semester: s.semester,
      exam_session: s.exam_session,
      sgpa: s.sgpa,
      total_marks: s.total_marks,
      max_marks: s.max_marks,
      percentage: s.total_marks && s.max_marks
        ? parseFloat(((s.total_marks / s.max_marks) * 100).toFixed(2))
        : null,
      result: s.result,
    }));
  }

  // ─── Course-wise Analytics ────────────────────────────────────────────────────
  async getCourseAnalytics(course: string) {
    const students = await this.studentRepo.find({ where: { course } });
    const studentIds = students.map(s => s.id);

    if (!studentIds.length) return { course, data: null };

    const sessions = await this.sessionRepo
      .createQueryBuilder('es')
      .where('es.student_id IN (:...ids)', { ids: studentIds })
      .getMany();

    const sgpaValues = sessions.filter(s => s.sgpa != null).map(s => s.sgpa);
    const passCount = sessions.filter(s => s.result?.toUpperCase() === 'PASS').length;

    return {
      course,
      total_students: students.length,
      total_sessions: sessions.length,
      pass_count: passCount,
      fail_count: sessions.length - passCount,
      sgpa: {
        average: sgpaValues.length ? parseFloat((sgpaValues.reduce((a, b) => a + b, 0) / sgpaValues.length).toFixed(2)) : null,
        highest: sgpaValues.length ? Math.max(...sgpaValues) : null,
        lowest: sgpaValues.length ? Math.min(...sgpaValues) : null,
      },
    };
  }

  // ─── Exam Session Comparison ──────────────────────────────────────────────────
  async compareExamSessions(session1: string, session2: string) {
    const getStats = async (examSession: string) => {
      const sessions = await this.sessionRepo.find({ where: { exam_session: examSession } });
      const sgpaValues = sessions.filter(s => s.sgpa != null).map(s => s.sgpa);
      const passCount = sessions.filter(s => s.result?.toUpperCase() === 'PASS').length;
      return {
        exam_session: examSession,
        total: sessions.length,
        pass: passCount,
        fail: sessions.length - passCount,
        avg_sgpa: sgpaValues.length ? parseFloat((sgpaValues.reduce((a, b) => a + b, 0) / sgpaValues.length).toFixed(2)) : null,
        max_sgpa: sgpaValues.length ? Math.max(...sgpaValues) : null,
      };
    };

    return {
      session1: await getStats(session1),
      session2: await getStats(session2),
    };
  }

  // ─── Helper ───────────────────────────────────────────────────────────────────
  private median(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  }
}
