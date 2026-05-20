import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { SubjectResult } from '../../subject-results/entities/subject-result.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  paper_code: string;

  @Column({ nullable: true })
  paper_name: string;

  @OneToMany(() => SubjectResult, (result) => result.subject)
  results: SubjectResult[];
}
