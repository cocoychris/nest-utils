import { BadRequestException, PipeTransform } from '@nestjs/common';

const MAX_POSTGRES_INT = 2147483647;
const DEFAULT_NAME = 'id';

export class IntIdPipe implements PipeTransform<string, number> {
  constructor(private readonly name: string = DEFAULT_NAME) {}
  transform(value: string): number {
    // Check length
    if (value.length > 10) {
      throw new BadRequestException(`${this.name} length must be less than 10`);
    }
    // Check if it is a number
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      throw new BadRequestException(`${this.name} must be a positive integer`);
    }
    // Check if it is out of range of a 32-bit signed integer
    if (num > MAX_POSTGRES_INT) {
      throw new BadRequestException(
        `${this.name} must be less than ${MAX_POSTGRES_INT}`,
      );
    }
    return num;
  }
}
