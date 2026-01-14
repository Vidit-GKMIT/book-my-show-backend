import { Injectable } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City) private readonly cityRepository: Repository<City>,
  ) {}
  create(createCityDto: CreateCityDto) {
    return 'This action adds a new city';
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, order } = paginationDto;

    const offset = (page - 1) * limit;
    const sortOrder = order === 1 ? 'ASC' : 'DESC';

    const [data, count] = await this.cityRepository.findAndCount({
      take: limit,
      skip: offset,
      order: {
        id: sortOrder,
      },
    });

    return { data, page, limit, totalPages: Math.ceil(count / limit) };
  }

  findOne(id: number) {
    return `This action returns a #${id} city`;
  }

  update(id: number, updateCityDto: UpdateCityDto) {
    return `This action updates a #${id} city`;
  }

  remove(id: number) {
    return `This action removes a #${id} city`;
  }
}
