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
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { City } from 'src/cities/entities/city.entity';
import { Screen } from 'src/screens/entities/screen.entity';

@Entity({ name: 'theatres' })
export class Theatre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @ManyToOne(() => User, (user) => user.theatres)
  user: User;

  @ManyToOne(() => City, (city) => city.theatres)
  city: City;

  @OneToMany(() => Screen, (screen) => screen.theatreId)
  screens: Screen[];

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Timestamp;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Timestamp;

  @DeleteDateColumn({
    type: 'timestamptz',
    name: 'deleted_at',
    default: null,
    nullable: true,
  })
  deletedAt: Timestamp;
}
