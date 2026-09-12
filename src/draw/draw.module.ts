import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './assignment.entity';
import { DrawService } from './draw.service';
import { DrawController } from './draw.controller';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment]), MembersModule],
  controllers: [DrawController],
  providers: [DrawService],
})
export class DrawModule {}
