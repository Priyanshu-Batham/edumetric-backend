import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamSession } from '../exam-sessions/entities/exam-session.entity';
import { SubjectResult } from '../subject-results/entities/subject-result.entity';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExamSession, SubjectResult])],
  providers: [RankingsService],
  controllers: [RankingsController],
})
export class RankingsModule {}
