import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  poster: string;

  @IsString()
  @IsNotEmpty()
  trailer: string;
}
