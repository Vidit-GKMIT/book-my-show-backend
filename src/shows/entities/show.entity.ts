import { Exclude } from 'class-transformer';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { Screen } from 'src/screens/entities/screen.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Timestamp,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('shows')
export class Show {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
  })
  price: number;

  @Column({ type: 'timestamptz', name: 'show_date_time' })
  showDateTime: Date;

  @Column({ type: 'timestamptz', name: 'show_end_date_time' })
  showEndDateTime: Date;

  @Column({ type: 'int', name: 'available_seats' })
  availableSeats: number;

  @ManyToOne(() => Movie, (movie) => movie.shows)
  @JoinColumn({ name: 'movie_id' })
  movieId: Movie;

  @ManyToOne(() => Screen, (screen) => screen.shows)
  @JoinColumn({ name: 'screen_id' })
  screenId: Screen;

  @OneToMany(() => Booking, (booking) => booking.showId)
  bookings: Booking[];

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
