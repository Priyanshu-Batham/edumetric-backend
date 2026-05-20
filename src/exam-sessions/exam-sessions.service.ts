import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamSession } from './entities/exam-session.entity';
import { CreateExamSessionDto, UpdateExamSessionDto } from './dto/exam-session.dto';

@Injectable()
export class ExamSessionsService {
  constructor(
    @InjectRepository(ExamSession)
    private readonly sessionRepo: Repository<ExamSession>,
  ) {}

  async findAll(filters?: { semester?: string; exam_session?: string; result?: string }) {
    const qb = this.sessionRepo
      .createQueryBuilder('es')
      .leftJoinAndSelect('es.student', 'student')
      .leftJoinAndSelect('es.subject_results', 'sr')
      .leftJoinAndSelect('sr.subject', 'subject')
      .orderBy('es.id', 'DESC');

    if (filters?.semester) qb.andWhere('es.semester = :semester', { semester: filters.semester });
    if (filters?.exam_session) qb.andWhere('es.exam_session = :exam_session', { exam_session: filters.exam_session });
    if (filters?.result) qb.andWhere('UPPER(es.result) = :result', { result: filters.result.toUpperCase() });

    return qb.getMany();
  }

  async findOne(id: number) {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['student', 'subject_results', 'subject_results.subject'],
    });
    if (!session) throw new NotFoundException(`Exam session #${id} not found`);
    return session;
  }

  async findByStudent(studentId: number) {
    return this.sessionRepo.find({
      where: { student_id: studentId },
      relations: ['subject_results', 'subject_results.subject'],
      order: { semester: 'ASC' },
    });
  }

  async getDistinctSemesters() {
    const result = await this.sessionRepo
      .createQueryBuilder('es')
      .select('DISTINCT es.semester', 'semester')
      .orderBy('es.semester', 'ASC')
      .getRawMany();
    return result.map(r => r.semester).filter(Boolean);
  }

  async getDistinctExamSessions() {
    const result = await this.sessionRepo
      .createQueryBuilder('es')
      .select('DISTINCT es.exam_session', 'exam_session')
      .orderBy('es.exam_session', 'ASC')
      .getRawMany();
    return result.map(r => r.exam_session).filter(Boolean);
  }

  async create(dto: CreateExamSessionDto) {
    const session = this.sessionRepo.create(dto);
    return this.sessionRepo.save(session);
  }

  async update(id: number, dto: UpdateExamSessionDto) {
    const session = await this.sessionRepo.findOne({ where: { id } });
    if (!session) throw new NotFoundException(`Exam session #${id} not found`);
    Object.assign(session, dto);
    return this.sessionRepo.save(session);
  }

  async remove(id: number) {
    const session = await this.sessionRepo.findOne({ where: { id } });
    if (!session) throw new NotFoundException(`Exam session #${id} not found`);
    await this.sessionRepo.remove(session);
    return { message: `Exam session #${id} deleted successfully` };
  }
}
