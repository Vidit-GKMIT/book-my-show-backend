import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TheatreAttribute } from 'src/theatres/entities/theatre_attributes.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TheatreAttributes {
  constructor(
    @InjectRepository(TheatreAttribute)
    private readonly theatreRepository: Repository<TheatreAttribute>,
  ) {}

  async getBufferTime(): Promise<number> {
    const time = await this.theatreRepository.findOne({
      select: {
        value: true,
      },
      where: {
        key: 'BufferTime',
      },
    });

    if (!time) {
      throw new NotFoundException('Buffer time is not defined.');
    }

    return +time.value;
  }
}
