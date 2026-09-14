import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MembersModule } from './members/members.module';
import { DrawModule } from './draw/draw.module';
import { AdminModule } from './admin/admin.module';
import { Member } from './members/member.entity';
import { Assignment } from './draw/assignment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Member, Assignment],
      synchronize: true,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    }),
    MembersModule,
    DrawModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
