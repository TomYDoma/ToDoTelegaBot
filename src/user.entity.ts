import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'User' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'int' })
  operationLabel: number;

  @Column({ type: 'text' })
  chatID: string;
}
