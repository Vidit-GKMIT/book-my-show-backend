import { Exclude } from 'class-transformer';
import { Show } from 'src/shows/entities/show.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Timestamp,
  OneToMany,
} from 'typeorm';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 40,
  })
  name: string;

  @Column({
    type: 'int',
  })
  duration: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  poster: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  trailer: string;

  @OneToMany(() => Show, (show) => show.movieId)
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
