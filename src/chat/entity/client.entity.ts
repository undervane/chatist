import { Message } from './message.entity';
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, OneToMany } from 'typeorm';

@Entity()
export class Client {

  @PrimaryColumn()
  socketId: string;

  @Column()
  name: string;

}
