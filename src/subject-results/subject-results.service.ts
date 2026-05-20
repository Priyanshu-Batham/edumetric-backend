import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectResult } from './entities/subject-result.entity';
import {
  CreateSubjectResultDto,
  UpdateSubjectResultDto,
  BulkCreateSubjectResultDto,
} from './dto/subject-result.dto';

@Injectable()
export class SubjectResultsService {
  constructor(
    @InjectRepository(SubjectResult)
    private readonly resultRepo: Repository<SubjectResult>,
  ) {}

  async findAll(filters?: { exam_session_id?: number; subject_id?: number }) {
    const where: any = {};
    if (filters?.exam_session_id) where.exam_session_id = filters.exam_session_id;
    if (filters?.subject_id) where.subject_id = filters.subject_id;

    return this.resultRepo.find({
      where,
      relations: ['exam_session', 'exam_session.student', 'subject'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const result = await this.resultRepo.findOne({
      where: { id },
      relations: ['exam_session', 'exam_session.student', 'subject'],
    });
    if (!result) throw new NotFoundException(`Subject result #${id} not found`);
    return result;
  }

  async create(dto: CreateSubjectResultDto) {
    const result = this.resultRepo.create(dto);
    return this.resultRepo.save(result);
  }

  async bulkCreate(dto: BulkCreateSubjectResultDto) {
    const results = dto.results.map(r => this.resultRepo.create(r));
    return this.resultRepo.save(results);
  }

  async update(id: number, dto: UpdateSubjectResultDto) {
    const result = await this.resultRepo.findOne({ where: { id } });
    if (!result) throw new NotFoundException(`Subject result #${id} not found`);
    Object.assign(result, dto);
    return this.resultRepo.save(result);
  }

  async remove(id: number) {
    const result = await this.resultRepo.findOne({ where: { id } });
    if (!result) throw new NotFoundException(`Subject result #${id} not found`);
    await this.resultRepo.remove(result);
    return { message: `Subject result #${id} deleted successfully` };
  }
}
