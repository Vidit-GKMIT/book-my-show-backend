import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Timestamp,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { City } from 'src/cities/entities/city.entity';
import { Screen } from 'src/screens/entities/screen.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'theatres' })
export class Theatre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @ManyToOne(() => User, (user) => user.theatres)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => City, (city) => city.theatres)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @OneToMany(() => Screen, (screen) => screen.theatreId)
  screens: Screen[];

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
