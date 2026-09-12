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
import { normalizeKeyword } from '../common/keyword.util';

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

  /** Arma un ciclo válido para el grupo dado y guarda las asignaciones. */
  private async pairUpGroup(members: Member[]): Promise<Assignment[]> {
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

    return this.pairUpGroup(members);
  }

  /**
   * Empareja solo a quienes todavía no tienen pareja (rezagados o
   * miembros que se anotaron después del sorteo inicial), sin tocar
   * las parejas que ya existen.
   */
  async completeRemaining(): Promise<Assignment[]> {
    const totalAssignments = await this.assignmentsRepository.count();
    if (totalAssignments === 0) {
      throw new BadRequestException(
        'Todavía no se ha hecho el sorteo inicial. Usa "Realizar sorteo" primero.',
      );
    }

    const [allMembers, existingAssignments] = await Promise.all([
      this.membersService.findAll(),
      this.assignmentsRepository.find(),
    ]);

    const pairedIds = new Set(existingAssignments.map((a) => a.giverId));
    const unpaired = allMembers.filter((m) => !pairedIds.has(m.id));

    if (unpaired.length === 0) {
      throw new BadRequestException('Todos los pilotos ya tienen pareja.');
    }
    if (unpaired.length < 2) {
      throw new BadRequestException(
        'Falta un solo piloto sin pareja; necesitas al menos 2 para poder emparejarlos entre sí.',
      );
    }

    return this.pairUpGroup(unpaired);
  }

  /** Estado por piloto para el admin: si ya tiene pareja y si ya giró, sin revelar con quién. */
  async getChecklist(): Promise<
    { id: string; name: string; hasPartner: boolean; revealed: boolean }[]
  > {
    const [members, assignments] = await Promise.all([
      this.membersService.findAll(),
      this.assignmentsRepository.find(),
    ]);

    const byGiverId = new Map(assignments.map((a) => [a.giverId, a]));

    return members.map((member) => {
      const assignment = byGiverId.get(member.id);
      return {
        id: member.id,
        name: member.name,
        hasPartner: !!assignment,
        revealed: assignment?.revealed ?? false,
      };
    });
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

  /** Solo entrega la asignación si la palabra clave coincide con la del piloto elegido. */
  async confirmAndGetAssignment(
    memberId: string,
    keyword: string,
  ): Promise<Assignment> {
    const member = await this.membersService.findOne(memberId);
    const normalized = normalizeKeyword(keyword);

    if (!member.keyword || member.keyword !== normalized) {
      throw new ForbiddenException('La palabra clave no coincide con ese piloto.');
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
