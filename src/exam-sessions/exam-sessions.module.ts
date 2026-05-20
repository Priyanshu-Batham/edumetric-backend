import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamSession } from './entities/exam-session.entity';
import { ExamSessionsService } from './exam-sessions.service';
import { ExamSessionsController } from './exam-sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExamSession])],
  providers: [ExamSessionsService],
  controllers: [ExamSessionsController],
  exports: [ExamSessionsService],
})
export class ExamSessionsModule {}
