import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from 'src/shows/entities/show.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class DateService {
  constructor(
    @InjectRepository(Show) private readonly showRepository: Repository<Show>,
  ) {}
  isValidShow(startDateTime: Date) {
    const now = new Date();

    if (startDateTime.getTime() - now.getTime() < 10 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException(
        'Show must be scheduled at least 10 days in advance',
      );
    }

    const hour = startDateTime.getHours();

    if (hour >= 0 && hour < 8) {
      throw new BadRequestException(
        'Shows cannot be scheduled between 00:00 AM and 8:00 AM',
      );
    }
  }

  isOverLapping(
    startDateTime: Date,
    endDateTime: Date,
    prevShowEndDateTime: Date | boolean,
    nextShowEndDateTime: Date | boolean,
  ) {
    return !(
      (prevShowEndDateTime === true || prevShowEndDateTime <= startDateTime) &&
      (nextShowEndDateTime === true || endDateTime <= nextShowEndDateTime)
    );
  }
}
