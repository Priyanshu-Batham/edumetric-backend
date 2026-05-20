import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ExamSession } from '../../exam-sessions/entities/exam-session.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  enrollment_no: string;

  @Column()
  roll_no: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  father_name: string;

  @Column({ nullable: true })
  mother_name: string;

  @Column({ nullable: true })
  course: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => ExamSession, (session) => session.student)
  exam_sessions: ExamSession[];
}
