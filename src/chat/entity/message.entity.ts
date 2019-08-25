import { Client } from './client.entity';
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';

@Entity()
export class Message {

  @PrimaryColumn()
  messageId: string;

  @Column()
  socketId: string;

  @Column()
  message: string;

}
