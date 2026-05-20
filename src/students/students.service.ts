import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  async findAll(query: StudentQueryDto) {
    const where: any = {};
    if (query.course) where.course = ILike(`%${query.course}%`);
    if (query.name) where.name = ILike(`%${query.name}%`);
    if (query.enrollment_no) where.enrollment_no = query.enrollment_no;

    return this.studentRepo.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['exam_sessions', 'exam_sessions.subject_results', 'exam_sessions.subject_results.subject'],
    });
    if (!student) throw new NotFoundException(`Student #${id} not found`);
    return student;
  }

  async findByEnrollment(enrollmentNo: string) {
    const student = await this.studentRepo.findOne({
      where: { enrollment_no: enrollmentNo },
      relations: ['exam_sessions', 'exam_sessions.subject_results', 'exam_sessions.subject_results.subject'],
    });
    if (!student) throw new NotFoundException(`Student with enrollment ${enrollmentNo} not found`);
    return student;
  }

  async create(dto: CreateStudentDto) {
    const existing = await this.studentRepo.findOne({ where: { enrollment_no: dto.enrollment_no } });
    if (existing) throw new ConflictException(`Enrollment no ${dto.enrollment_no} already exists`);
    const student = this.studentRepo.create(dto);
    return this.studentRepo.save(student);
  }

  async update(id: number, dto: UpdateStudentDto) {
    const student = await this.studentRepo.findOne({ where: { id } });
    if (!student) throw new NotFoundException(`Student #${id} not found`);
    Object.assign(student, dto);
    return this.studentRepo.save(student);
  }

  async remove(id: number) {
    const student = await this.studentRepo.findOne({ where: { id } });
    if (!student) throw new NotFoundException(`Student #${id} not found`);
    await this.studentRepo.remove(student);
    return { message: `Student #${id} deleted successfully` };
  }

  async getStudentPerformance(id: number) {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['exam_sessions', 'exam_sessions.subject_results', 'exam_sessions.subject_results.subject'],
    });
    if (!student) throw new NotFoundException(`Student #${id} not found`);

    const sessions = student.exam_sessions || [];
    const sgpaValues = sessions.filter(s => s.sgpa != null).map(s => s.sgpa);
    const cgpa = sgpaValues.length > 0
      ? parseFloat((sgpaValues.reduce((a, b) => a + b, 0) / sgpaValues.length).toFixed(2))
      : null;

    const semesterWise = sessions.map(session => ({
      semester: session.semester,
      exam_session: session.exam_session,
      sgpa: session.sgpa,
      result: session.result,
      total_marks: session.total_marks,
      max_marks: session.max_marks,
      percentage: session.total_marks && session.max_marks
        ? parseFloat(((session.total_marks / session.max_marks) * 100).toFixed(2))
        : null,
      subjects: (session.subject_results || []).map(sr => ({
        paper_code: sr.subject?.paper_code,
        paper_name: sr.subject?.paper_name,
        marks: sr.marks,
        credit: sr.credit,
        grade: sr.grade,
      })),
    }));

    return {
      student: {
        id: student.id,
        name: student.name,
        enrollment_no: student.enrollment_no,
        roll_no: student.roll_no,
        course: student.course,
        father_name: student.father_name,
        mother_name: student.mother_name,
      },
      summary: {
        total_semesters: sessions.length,
        cgpa,
        highest_sgpa: sgpaValues.length ? Math.max(...sgpaValues) : null,
        lowest_sgpa: sgpaValues.length ? Math.min(...sgpaValues) : null,
        pass_count: sessions.filter(s => s.result?.toUpperCase() === 'PASS').length,
        fail_count: sessions.filter(s => s.result?.toUpperCase() === 'FAIL').length,
      },
      semester_wise: semesterWise,
    };
  }

  async getCourses() {
    const result = await this.studentRepo
      .createQueryBuilder('s')
      .select('DISTINCT s.course', 'course')
      .where('s.course IS NOT NULL')
      .getRawMany();
    return result.map(r => r.course).filter(Boolean);
  }

  async getCount() {
    return {
      total: await this.studentRepo.count(),
    };
  }
}
