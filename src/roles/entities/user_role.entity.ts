import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users_roles')
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.userRole)
  @JoinColumn({
    name: 'user_id',
  })
  userId: User;

  @ManyToOne(() => Role, (role) => role.roles)
  @JoinColumn({
    name: 'role_id',
  })
  roleId: Role;
}
