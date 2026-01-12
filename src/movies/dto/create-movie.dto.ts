import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  duration: number;

  // @IsString()
  // @IsNotEmpty()
  // poster: string;

  // @IsString()
  // @IsNotEmpty()
  // trailer: string;
}
