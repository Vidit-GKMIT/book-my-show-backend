import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class CreateScreenDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 5)
  name: string;

  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  seats: number;

  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  theatreId: number;
}
