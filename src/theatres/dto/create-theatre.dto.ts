import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateTheatreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  city: number;

  // @IsNumber()
  // @Min(1, { message: 'Please create at least one screen' })
  // @IsNotEmpty()
  // screens: number;

  // @IsNumber()
  // @Min(1, { message: 'Theatre should have at least one seat' })
  // @IsNotEmpty()
  // seats: number;
}
