import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectResult } from './entities/subject-result.entity';
import { SubjectResultsService } from './subject-results.service';
import { SubjectResultsController } from './subject-results.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectResult])],
  providers: [SubjectResultsService],
  controllers: [SubjectResultsController],
  exports: [SubjectResultsService],
})
export class SubjectResultsModule {}
