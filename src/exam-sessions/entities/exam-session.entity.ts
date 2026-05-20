import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { SubjectResult } from '../../subject-results/entities/subject-result.entity';

@Entity('exam_sessions')
export class ExamSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  student_id: number;

  @Column({ nullable: true })
  semester: string;

  @Column({ nullable: true })
  exam_session: string;

  @Column({ type: 'float', nullable: true })
  sgpa: number;

  @Column({ nullable: true })
  average_grade: string;

  @Column({ nullable: true })
  result: string;

  @Column({ nullable: true })
  total_marks: number;

  @Column({ nullable: true })
  max_marks: number;

  @Column({ nullable: true })
  total_credits: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Student, (student) => student.exam_sessions)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @OneToMany(() => SubjectResult, (result) => result.exam_session)
  subject_results: SubjectResult[];
}
