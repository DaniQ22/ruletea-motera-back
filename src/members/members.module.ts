import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { Assignment } from '../draw/assignment.entity';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Assignment])],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService, TypeOrmModule],
})
export class MembersModule {}
