import { IsInt, IsPositive, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateShowDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  @IsDateString()
  @IsNotEmpty()
  showDateTime: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  movieId: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  screenId: number;
}
