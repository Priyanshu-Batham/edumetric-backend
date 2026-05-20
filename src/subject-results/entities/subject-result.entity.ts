import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExamSession } from '../../exam-sessions/entities/exam-session.entity';
import { Subject } from '../../subjects/entities/subject.entity';

@Entity('subject_results')
export class SubjectResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  exam_session_id: number;

  @Column({ nullable: true })
  subject_id: number;

  @Column({ nullable: true })
  marks: number;

  @Column({ nullable: true })
  credit: number;

  @Column({ nullable: true })
  grade: string;

  @ManyToOne(() => ExamSession, (session) => session.subject_results)
  @JoinColumn({ name: 'exam_session_id' })
  exam_session: ExamSession;

  @ManyToOne(() => Subject, (subject) => subject.results)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;
}
