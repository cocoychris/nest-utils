import {
  ClassConstructor,
  ClassTransformOptions,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { validateSync, ValidatorOptions } from 'class-validator';
import { DeepPartial, PlainObject } from './types';

/**
 * 合併資料與型別定義
 * 會將 data2 的資料合併到 data1，並回傳合併後的資料。即 data1 的資料會被 data2 覆蓋。
 * 傳回的是深度複製後的物件，故修改傳回的物件不會影響原物件。
 */
export function mergeData<T1 extends object, T2 extends object>(
  data1: T1,
  data2: T2,
): T1 & T2 {
  const keys = Array.from(
    new Set([...Object.keys(data1), ...Object.keys(data2)]),
  );
  const output = {} as T1 & T2;
  keys.forEach((key) => {
    const value1 = data1[key];
    const value2 = data2[key];
    if (
      typeof value1 == 'object' &&
      typeof value2 == 'object' &&
      value1 !== null &&
      value2 !== null
    ) {
      output[key] = mergeData(value1, value2);
      return;
    }
    if (value2 !== undefined) {
      output[key] = value2;
      return;
    }
    output[key] = value1;
  });
  return output;
}

/**
 * 將資料與預設資料合併(深度合併)
 * 傳回的是深度複製後的物件，故修改傳回的物件不會影響原物件。
 * 暫時不支援陣列中包含物件的情況
 * @param data 局部資料
 * @param defaultData 預設資料
 * @returns 合併後的資料
 */
export function mergeDefault<T extends object>(
  data: DeepPartial<T>,
  defaultData: T,
): T {
  const result: Record<string, any> = {};
  const keySet = new Set([...Object.keys(data), ...Object.keys(defaultData)]);
  for (const key of keySet) {
    const value: any = data[key];
    const defaultValue: any = defaultData[key];
    // 若是物件，則遞迴合併
    if (defaultValue && defaultValue instanceof Object) {
      // console.log(`[Object] key: ${key}, value: ${value}, defaultValue: ${defaultValue}`);
      const objValue =
        value && value instanceof Object && !Array.isArray(value) ? value : {};
      result[key] = mergeDefault(objValue, defaultValue);
      continue;
    }
    // 若是陣列，則拷貝陣列
    if (Array.isArray(defaultValue)) {
      // console.log(`[Array] key: ${key}, value: ${value}, defaultValue: ${defaultValue}`);
      if (Array.isArray(value)) {
        const arrayValue: Array<any> = value;
        for (const element of arrayValue) {
          if (element instanceof Object) {
            throw new Error(
              `Invalid data: Array of object is not supported in key ${key}`,
            );
          }
        }
        result[key] = arrayValue.slice();
        continue;
      }
      for (const element of defaultValue) {
        if (element instanceof Object) {
          throw new Error(
            `Invalid default data: Array of object is not supported in key ${key}`,
          );
        }
      }
      result[key] = defaultValue.slice();
      continue;
    }
    // 若是其他型別，則直接取值
    // console.log(`[Other] key: ${key}, value: ${value}, defaultValue: ${defaultValue}`);
    result[key] = value === undefined ? defaultValue : value;
  }
  return result as T;
}

/**
 * 深層凍結物件
 *
 * 物件及其子物件都會被凍結，凍結後的物件無法被修改。
 */
export function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  Object.freeze(obj);
  for (const value of Object.values(obj)) {
    deepFreeze(value);
  }
  return obj;
}

const DEFAULT_TRANSFORM_OPTION: ClassTransformOptions = {
  excludeExtraneousValues: true,
};

/**
 * 將物件轉換為 DTO
 *
 * - 預設會移除多餘的屬性 (excludeExtraneousValues = true)
 * - 若將 validate 設為 true 或放入 ValidatorOptions，則會進行驗證
 * - 如驗證失敗會顯示人類可閱讀的錯誤訊息
 */
export function toDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  plainObj: PlainObject<T>,
  transformOption: ClassTransformOptions = {},
  validate: ValidatorOptions | boolean = false,
): T {
  const instance = plainToInstance(
    dtoClass,
    plainObj,
    mergeDefault(transformOption, DEFAULT_TRANSFORM_OPTION),
  );
  if (!validate) {
    return instance;
  }
  const validateOption = validate === true ? undefined : validate;
  const errors = validateSync(instance, validateOption);
  if (errors.length > 0) {
    let message = '';
    for (const error of errors) {
      if (error.constraints) {
        for (const key in error.constraints) {
          message += `- ${key}: ${error.constraints[key]}\n`;
        }
      } else {
        message += `- ${error.toString()}\n`;
      }
    }
    throw new Error(`DTO ${dtoClass.name} 驗證失敗:\n${message}`);
  }
  return instance;
}

export function fromDto<T extends object>(
  dto: T,
  transformOption: ClassTransformOptions = {},
  validate: ValidatorOptions | boolean = false,
): PlainObject<T> {
  if (validate) {
    const validateOption = validate === true ? undefined : validate;
    const errors = validateSync(dto, validateOption);
    if (errors.length > 0) {
      let message = '';
      for (const error of errors) {
        if (error.constraints) {
          for (const key in error.constraints) {
            message += `- ${key}: ${error.constraints[key]}\n`;
          }
        } else {
          message += `- ${error.toString()}\n`;
        }
      }
      throw new Error(`DTO ${dto.constructor.name} 驗證失敗:\n${message}`);
    }
  }
  return instanceToPlain(
    dto,
    mergeDefault(transformOption, DEFAULT_TRANSFORM_OPTION),
  ) as PlainObject<T>;
}

export function toDtoList<T extends object>(
  dtoClass: ClassConstructor<T>,
  plainObjList: PlainObject<T>[],
  transformOption: ClassTransformOptions = DEFAULT_TRANSFORM_OPTION,
  validate: ValidatorOptions | boolean = false,
): T[] {
  return plainObjList.map((plainObj, index) => {
    try {
      return toDto(dtoClass, plainObj, transformOption, validate);
    } catch (error) {
      throw new Error(
        `轉換 ${dtoClass.name}[${index}] 時發生錯誤:${(error as Error).message || error}`,
      );
    }
  });
}

export abstract class ArrayUtils {
  static unique(array: any[]): any[] {
    return Array.from(new Set(array));
  }

  static difference<T>(array1: T[], array2: T[]): T[] {
    const map2 = new Map<T, boolean>();
    for (const item of array2) {
      map2.set(item, true);
    }
    return array1.filter((item) => !map2.has(item));
  }
}
