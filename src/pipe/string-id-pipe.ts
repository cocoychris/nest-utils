import { BadRequestException, PipeTransform } from '@nestjs/common';

const DEFAULT_NAME = 'id';
const DEFAULT_MAX_LENGTH = 255;

export class StringIdPipe implements PipeTransform<string, string> {
  constructor(
    private readonly name: string = DEFAULT_NAME,
    private readonly maxLength: number = DEFAULT_MAX_LENGTH,
  ) {}
  transform(value: string): string {
    if (!value) {
      throw new BadRequestException(`${this.name} is required`);
    }
    if (value.length > this.maxLength) {
      throw new BadRequestException(`${this.name} length must be less than ${this.maxLength}`);
    }
    return value;
  }
}
