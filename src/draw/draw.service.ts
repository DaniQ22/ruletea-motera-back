import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './assignment.entity';
import { MembersService } from '../members/members.service';
import { Member } from '../members/member.entity';
import { normalizePhone } from '../common/phone.util';

@Injectable()
export class DrawService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentsRepository: Repository<Assignment>,
    private readonly membersService: MembersService,
  ) {}

  async getStatus() {
    const totalMembers = await this.membersService.count();
    const totalAssignments = await this.assignmentsRepository.count();
    return {
      totalMembers,
      drawDone: totalAssignments > 0,
      minRequired: 3,
    };
  }

  /** Baraja el club y arma un solo ciclo: nadie se saca a sí mismo ni se repite. */
  private buildCycle(members: Member[]): Member[] {
    const shuffled = [...members];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async performDraw(): Promise<Assignment[]> {
    const existing = await this.assignmentsRepository.count();
    if (existing > 0) {
      throw new BadRequestException(
        'El sorteo ya se realizó. Reinicia el club antes de volver a girar.',
      );
    }

    const members = await this.membersService.findAll();
    if (members.length < 3) {
      throw new BadRequestException(
        'Se necesitan al menos 3 motoqueros registrados para sortear.',
      );
    }

    const cycle = this.buildCycle(members);
    const assignments = cycle.map((giver, index) => {
      const receiver = cycle[(index + 1) % cycle.length];
      return this.assignmentsRepository.create({
        giverId: giver.id,
        giverName: giver.name,
        receiverId: receiver.id,
        receiverName: receiver.name,
      });
    });

    return this.assignmentsRepository.save(assignments);
  }

  async getAssignmentForMember(memberId: string): Promise<Assignment> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { giverId: memberId },
    });
    if (!assignment) {
      throw new NotFoundException(
        'Todavía no hay sorteo, o ese piloto no está registrado.',
      );
    }
    return assignment;
  }

  /** Solo entrega la asignación si el teléfono coincide con el del piloto elegido. */
  async confirmAndGetAssignment(
    memberId: string,
    phone: string,
  ): Promise<Assignment> {
    const member = await this.membersService.findOne(memberId);
    const normalized = normalizePhone(phone);

    if (!member.phone || member.phone !== normalized) {
      throw new ForbiddenException('El teléfono no coincide con ese piloto.');
    }

    return this.getAssignmentForMember(memberId);
  }

  async markRevealed(memberId: string): Promise<Assignment> {
    const assignment = await this.getAssignmentForMember(memberId);
    assignment.revealed = true;
    return this.assignmentsRepository.save(assignment);
  }

  async reset(): Promise<void> {
    await this.assignmentsRepository.clear();
  }
}
