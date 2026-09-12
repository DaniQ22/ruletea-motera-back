import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DrawService } from './draw.service';
import { AdminGuard } from '../common/admin.guard';

@Controller('draw')
export class DrawController {
  constructor(private readonly drawService: DrawService) {}

  @Get('status')
  getStatus() {
    return this.drawService.getStatus();
  }

  @UseGuards(AdminGuard)
  @Post()
  performDraw() {
    return this.drawService.performDraw();
  }

  @UseGuards(AdminGuard)
  @Post('reset')
  reset() {
    return this.drawService.reset();
  }

  @Get(':memberId/confirm/:phone')
  confirmAndGetAssignment(
    @Param('memberId') memberId: string,
    @Param('phone') phone: string,
  ) {
    return this.drawService.confirmAndGetAssignment(memberId, phone);
  }

  @Post(':memberId/reveal')
  reveal(@Param('memberId') memberId: string) {
    return this.drawService.markRevealed(memberId);
  }
}
