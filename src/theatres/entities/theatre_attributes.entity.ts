import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('theatre_attributes')
export class TheatreAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 30,
    name: 'key',
  })
  key: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'value',
  })
  value: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'type',
  })
  type: string;
}
