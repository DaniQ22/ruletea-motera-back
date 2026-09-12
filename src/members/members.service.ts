import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';
import { Assignment } from '../draw/assignment.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import {
  KEYWORD_ERROR_MESSAGE,
  isValidKeyword,
  normalizeKeyword,
} from '../common/keyword.util';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
    @InjectRepository(Assignment)
    private readonly assignmentsRepository: Repository<Assignment>,
  ) {}

  findAll(): Promise<Member[]> {
    return this.membersRepository.find({ order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<Member> {
    const member = await this.membersRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('Ese piloto no está en el club.');
    }
    return member;
  }

  async create(dto: CreateMemberDto): Promise<Member> {
    const name = dto.name.trim();
    const keyword = normalizeKeyword(dto.keyword);
    if (!isValidKeyword(keyword)) {
      throw new BadRequestException(KEYWORD_ERROR_MESSAGE);
    }

    const existingName = await this.membersRepository.findOne({
      where: { name },
    });
    if (existingName) {
      throw new ConflictException('Ya hay un miembro registrado con ese nombre.');
    }

    const member = this.membersRepository.create({ name, keyword });
    return this.membersRepository.save(member);
  }

  async updateKeyword(id: string, dto: UpdateKeywordDto): Promise<Member> {
    const member = await this.findOne(id);
    const keyword = normalizeKeyword(dto.keyword);
    if (!isValidKeyword(keyword)) {
      throw new BadRequestException(KEYWORD_ERROR_MESSAGE);
    }

    member.keyword = keyword;
    return this.membersRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const hasPair = await this.assignmentsRepository.count({
      where: [{ giverId: id }, { receiverId: id }],
    });
    if (hasPair > 0) {
      throw new BadRequestException(
        'Ese piloto ya tiene pareja asignada en el sorteo. Reinicia el sorteo antes de eliminarlo.',
      );
    }

    await this.membersRepository.delete(id);
  }

  async count(): Promise<number> {
    return this.membersRepository.count();
  }

  async clearAll(): Promise<void> {
    await this.membersRepository.clear();
  }
}
