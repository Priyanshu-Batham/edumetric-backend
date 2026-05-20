import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';

import { Student } from './students/entities/student.entity';
import { Subject } from './subjects/entities/subject.entity';
import { ExamSession } from './exam-sessions/entities/exam-session.entity';
import { SubjectResult } from './subject-results/entities/subject-result.entity';

import { StudentsModule } from './students/students.module';
import { SubjectsModule } from './subjects/subjects.module';
import { ExamSessionsModule } from './exam-sessions/exam-sessions.module';
import { SubjectResultsModule } from './subject-results/subject-results.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RankingsModule } from './rankings/rankings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.get('database.host'),
        port: configService.get<number>('database.port'),

        username: configService.get('database.username'),
        password: configService.get('database.password'),

        database: configService.get('database.name'),

        entities: [Student, Subject, ExamSession, SubjectResult],

        synchronize: false,
        logging: configService.get('NODE_ENV') !== 'production',

        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    StudentsModule,
    SubjectsModule,
    ExamSessionsModule,
    SubjectResultsModule,
    AnalyticsModule,
    RankingsModule,
  ],
})
export class AppModule {}
