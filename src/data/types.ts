import { PlainLiteralObject } from '@nestjs/common';

/**
 * A nested object where all of its own properties and descendants' properties are optional.
 *
 * 遞歸將所有屬性及其子屬性設為可選。
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type PlainObject<T> = T & PlainLiteralObject;
