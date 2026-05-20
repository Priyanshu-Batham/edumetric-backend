import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamSession } from '../exam-sessions/entities/exam-session.entity';
import { SubjectResult } from '../subject-results/entities/subject-result.entity';

@Injectable()
export class RankingsService {
  constructor(
    @InjectRepository(ExamSession)
    private readonly sessionRepo: Repository<ExamSession>,
    @InjectRepository(SubjectResult)
    private readonly resultRepo: Repository<SubjectResult>,
  ) {}

  // ─── Overall Rank by SGPA in a semester/exam_session ─────────────────────────
  async getRankBySemester(semester: string, examSession?: string) {
    const qb = this.sessionRepo
      .createQueryBuilder('es')
      .leftJoinAndSelect('es.student', 'student')
      .where('es.semester = :semester', { semester })
      .andWhere('es.sgpa IS NOT NULL');

    if (examSession) qb.andWhere('es.exam_session = :examSession', { examSession });

    qb.orderBy('es.sgpa', 'DESC').addOrderBy('es.total_marks', 'DESC');

    const sessions = await qb.getMany();

    return sessions.map((s, i) => ({
      rank: i + 1,
      student_id: s.student?.id,
      name: s.student?.name,
      enrollment_no: s.student?.enrollment_no,
      roll_no: s.student?.roll_no,
      course: s.student?.course,
      sgpa: s.sgpa,
      total_marks: s.total_marks,
      max_marks: s.max_marks,
      percentage: s.total_marks && s.max_marks
        ? parseFloat(((s.total_marks / s.max_marks) * 100).toFixed(2))
        : null,
      result: s.result,
      average_grade: s.average_grade,
    }));
  }

  // ─── Subject-wise Rank ────────────────────────────────────────────────────────
  async getRankBySubject(subjectId: number, filters?: { semester?: string; exam_session?: string }) {
    const qb = this.resultRepo
      .createQueryBuilder('sr')
      .leftJoinAndSelect('sr.exam_session', 'es')
      .leftJoinAndSelect('es.student', 'student')
      .leftJoinAndSelect('sr.subject', 'subject')
      .where('sr.subject_id = :subjectId', { subjectId })
      .andWhere('sr.marks IS NOT NULL');

    if (filters?.semester) qb.andWhere('es.semester = :semester', { semester: filters.semester });
    if (filters?.exam_session) qb.andWhere('es.exam_session = :exam_session', { exam_session: filters.exam_session });

    qb.orderBy('sr.marks', 'DESC');

    const results = await qb.getMany();

    return {
      subject: {
        id: results[0]?.subject?.id,
        paper_code: results[0]?.subject?.paper_code,
        paper_name: results[0]?.subject?.paper_name,
      },
      rankings: results.map((r, i) => ({
        rank: i + 1,
        student_id: r.exam_session?.student?.id,
        name: r.exam_session?.student?.name,
        enrollment_no: r.exam_session?.student?.enrollment_no,
        roll_no: r.exam_session?.student?.roll_no,
        marks: r.marks,
        grade: r.grade,
        credit: r.credit,
        semester: r.exam_session?.semester,
        exam_session: r.exam_session?.exam_session,
      })),
    };
  }

  // ─── Course-wise Rank ─────────────────────────────────────────────────────────
  async getRankByCourse(course: string, filters?: { semester?: string; exam_session?: string }) {
    const qb = this.sessionRepo
      .createQueryBuilder('es')
      .leftJoinAndSelect('es.student', 'student')
      .where('student.course ILIKE :course', { course: `%${course}%` })
      .andWhere('es.sgpa IS NOT NULL');

    if (filters?.semester) qb.andWhere('es.semester = :semester', { semester: filters.semester });
    if (filters?.exam_session) qb.andWhere('es.exam_session = :exam_session', { exam_session: filters.exam_session });

    qb.orderBy('es.sgpa', 'DESC').addOrderBy('es.total_marks', 'DESC');

    const sessions = await qb.getMany();

    return sessions.map((s, i) => ({
      rank: i + 1,
      student_id: s.student?.id,
      name: s.student?.name,
      enrollment_no: s.student?.enrollment_no,
      roll_no: s.student?.roll_no,
      course: s.student?.course,
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

  // ─── Student's rank in a specific semester ────────────────────────────────────
  async getStudentRank(studentId: number, semester: string, examSession?: string) {
    const allRanks = await this.getRankBySemester(semester, examSession);
    const found = allRanks.find(r => r.student_id === studentId);

    if (!found) {
      return { student_id: studentId, semester, message: 'Student not found in this semester' };
    }

    return {
      student_id: studentId,
      semester,
      exam_session: examSession,
      rank: found.rank,
      total_students: allRanks.length,
      sgpa: found.sgpa,
      percentage: found.percentage,
      result: found.result,
    };
  }

  // ─── CGPA-based All-time Rank ─────────────────────────────────────────────────
  async getOverallCgpaRanking(filters?: { course?: string }) {
    const qb = this.sessionRepo
      .createQueryBuilder('es')
      .leftJoinAndSelect('es.student', 'student')
      .where('es.sgpa IS NOT NULL');

    if (filters?.course) qb.andWhere('student.course ILIKE :course', { course: `%${filters.course}%` });

    const sessions = await qb.getMany();

    // Group by student
    const studentMap = new Map<number, { student: any; sgpaList: number[]; totalMarks: number; maxMarks: number }>();

    sessions.forEach(s => {
      if (!s.student) return;
      if (!studentMap.has(s.student.id)) {
        studentMap.set(s.student.id, {
          student: s.student,
          sgpaList: [],
          totalMarks: 0,
          maxMarks: 0,
        });
      }
      const entry = studentMap.get(s.student.id);
      entry.sgpaList.push(s.sgpa);
      entry.totalMarks += s.total_marks || 0;
      entry.maxMarks += s.max_marks || 0;
    });

    const ranked = Array.from(studentMap.values())
      .map(entry => ({
        student_id: entry.student.id,
        name: entry.student.name,
        enrollment_no: entry.student.enrollment_no,
        roll_no: entry.student.roll_no,
        course: entry.student.course,
        semesters_completed: entry.sgpaList.length,
        cgpa: parseFloat((entry.sgpaList.reduce((a, b) => a + b, 0) / entry.sgpaList.length).toFixed(2)),
        total_marks: entry.totalMarks,
        max_marks: entry.maxMarks,
        overall_percentage: entry.maxMarks
          ? parseFloat(((entry.totalMarks / entry.maxMarks) * 100).toFixed(2))
          : null,
      }))
      .sort((a, b) => b.cgpa - a.cgpa || b.total_marks - a.total_marks)
      .map((item, i) => ({ rank: i + 1, ...item }));

    return ranked;
  }

  // ─── Top N per subject across all sessions ────────────────────────────────────
  async getTopNPerSubject(subjectId: number, n = 5) {
    return this.getRankBySubject(subjectId);
  }

  // ─── Percentile of a student in a semester ────────────────────────────────────
  async getStudentPercentile(studentId: number, semester: string) {
    const allRanks = await this.getRankBySemester(semester);
    const total = allRanks.length;
    const found = allRanks.find(r => r.student_id === studentId);

    if (!found) return { student_id: studentId, semester, message: 'Not found' };

    const percentile = parseFloat((((total - found.rank) / total) * 100).toFixed(2));

    return {
      student_id: studentId,
      semester,
      rank: found.rank,
      total_students: total,
      percentile,
      sgpa: found.sgpa,
    };
  }
}
