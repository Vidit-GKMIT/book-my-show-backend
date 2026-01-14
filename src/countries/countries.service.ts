import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}
  async create(createCountryDto: CreateCountryDto) {
    const name = createCountryDto.name;
    const existingCountry = await this.countryRepository.findOne({
      where: { name },
    });
    if (existingCountry) {
      throw new ConflictException('Country with this name already exists');
    }
    const country = this.countryRepository.create({
      name,
    });
    await this.countryRepository.save(country);
  }

  findAll() {
    return `This action returns all countries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} country`;
  }

  update(id: number, updateCountryDto: UpdateCountryDto) {
    return `This action updates a #${id} country`;
  }

  remove(id: number) {
    return `This action removes a #${id} country`;
  }
}
