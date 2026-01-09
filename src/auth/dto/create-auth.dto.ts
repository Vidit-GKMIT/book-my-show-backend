import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateAuthDto {}

export class registerDTO {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  @Length(1, 255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  phoneNo: string;

  @IsInt()
  @Min(1)
  roleId: number;
}
export class loginDTO {
  @IsEmail()
  @IsNotEmpty()
  @Length(1, 255)
  email: string;
}
