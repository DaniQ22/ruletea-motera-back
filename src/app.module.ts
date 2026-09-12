import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MembersModule } from './members/members.module';
import { DrawModule } from './draw/draw.module';
import { AdminModule } from './admin/admin.module';
import { Member } from './members/member.entity';
import { Assignment } from './draw/assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH ?? join(__dirname, '..', 'data', 'club.sqlite'),
      entities: [Member, Assignment],
      synchronize: true,
    }),
    MembersModule,
    DrawModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
