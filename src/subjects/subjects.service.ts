import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
  ) {}

  async findAll(search?: string) {
    if (search) {
      return this.subjectRepo.find({
        where: [
          { paper_name: ILike(`%${search}%`) },
          { paper_code: ILike(`%${search}%`) },
        ],
        order: { paper_code: 'ASC' },
      });
    }
    return this.subjectRepo.find({ order: { paper_code: 'ASC' } });
  }

  async findOne(id: number) {
    const subject = await this.subjectRepo.findOne({ where: { id } });
    if (!subject) throw new NotFoundException(`Subject #${id} not found`);
    return subject;
  }

  async create(dto: CreateSubjectDto) {
    const existing = await this.subjectRepo.findOne({ where: { paper_code: dto.paper_code } });
    if (existing) throw new ConflictException(`Paper code ${dto.paper_code} already exists`);
    const subject = this.subjectRepo.create(dto);
    return this.subjectRepo.save(subject);
  }

  async update(id: number, dto: UpdateSubjectDto) {
    const subject = await this.subjectRepo.findOne({ where: { id } });
    if (!subject) throw new NotFoundException(`Subject #${id} not found`);
    Object.assign(subject, dto);
    return this.subjectRepo.save(subject);
  }

  async remove(id: number) {
    const subject = await this.subjectRepo.findOne({ where: { id } });
    if (!subject) throw new NotFoundException(`Subject #${id} not found`);
    await this.subjectRepo.remove(subject);
    return { message: `Subject #${id} deleted successfully` };
  }
}
