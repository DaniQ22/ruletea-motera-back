import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  giverId: string;

  @Column()
  giverName: string;

  @Column()
  receiverId: string;

  @Column()
  receiverName: string;

  @Column({ default: false })
  revealed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
