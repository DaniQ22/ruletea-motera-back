import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { AdminGuard } from '../common/admin.guard';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateMemberDto) {
    return this.membersService.create(dto);
  }

  @Patch(':id/phone')
  updatePhone(@Param('id') id: string, @Body() dto: UpdatePhoneDto) {
    return this.membersService.updatePhone(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }
}
