import { Exclude } from 'class-transformer';
import { Show } from 'src/shows/entities/show.entity';
import { Theatre } from 'src/theatres/entities/theatre.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'screens' })
export class Screen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 5 })
  name: string;

  @Column({ type: 'int' })
  seats: number;

  @ManyToOne(() => Theatre, (theatre) => theatre.screens)
  @JoinColumn({ name: 'theatre_id' })
  theatreId: Theatre;

  @OneToMany(() => Show, (show) => show.screenId)
  shows: Show[];

  @Exclude()
  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Timestamp;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Timestamp;

  @Exclude()
  @DeleteDateColumn({
    type: 'timestamptz',
    name: 'deleted_at',
    default: null,
    nullable: true,
  })
  deletedAt: Timestamp;
}
