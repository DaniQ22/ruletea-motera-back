import { Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';

@Controller('admin')
export class AdminController {
  @UseGuards(AdminGuard)
  @Post('verify')
  verify() {
    return { ok: true };
  }
}
