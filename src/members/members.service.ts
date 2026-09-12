import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { PHONE_ERROR_MESSAGE, isValidPhone, normalizePhone } from '../common/phone.util';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
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
    const phone = normalizePhone(dto.phone);
    if (!isValidPhone(phone)) {
      throw new BadRequestException(PHONE_ERROR_MESSAGE);
    }

    const existingName = await this.membersRepository.findOne({
      where: { name },
    });
    if (existingName) {
      throw new ConflictException('Ya hay un miembro registrado con ese nombre.');
    }

    const existingPhone = await this.membersRepository.findOne({
      where: { phone },
    });
    if (existingPhone) {
      throw new ConflictException('Ese teléfono ya está registrado.');
    }

    const member = this.membersRepository.create({ name, phone });
    return this.membersRepository.save(member);
  }

  async updatePhone(id: string, dto: UpdatePhoneDto): Promise<Member> {
    const member = await this.findOne(id);
    const phone = normalizePhone(dto.phone);
    if (!isValidPhone(phone)) {
      throw new BadRequestException(PHONE_ERROR_MESSAGE);
    }

    const existingPhone = await this.membersRepository.findOne({
      where: { phone },
    });
    if (existingPhone && existingPhone.id !== id) {
      throw new ConflictException('Ese teléfono ya está registrado.');
    }

    member.phone = phone;
    return this.membersRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    const result = await this.membersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Ese piloto no está en el club.');
    }
  }

  async count(): Promise<number> {
    return this.membersRepository.count();
  }

  async clearAll(): Promise<void> {
    await this.membersRepository.clear();
  }
}
