import { ClassConstructor, ClassTransformOptions } from 'class-transformer';
import { ValidatorOptions } from 'class-validator';
import * as dotenv from 'dotenv';
import {
  deepFreeze,
  mergeDefault,
  toDto,
} from '../data/data-operation';

interface envConfigOptions {
  /**
   * class-validator 驗證選項
   */
  validateOption?: ValidatorOptions;
  /**
   * class-transformer 轉換選項
   */
  transformOption?: ClassTransformOptions;
  /**
   * dotenv 選項
   */
  dotenvOption?: dotenv.DotenvConfigOptions;
  /**
   * 是否凍結物件 (預設為 true) 會以遞歸方式深層凍結物件
   */
  freeze?: boolean;
}

export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

/**
 * 載入 ENV 設定檔、進行驗證、轉換、凍結後回傳
 * @param dtoClass 欲轉換的類別
 * @param options 進階選項
 * @param options.validateOption class-validator 驗證選項
 * @param options.transformOption class-transformer 轉換選項
 * @param options.dotenvOption dotenv 選項
 * @param options.freeze 是否凍結物件 (預設為 true) 會以遞歸方式深層凍結物件
 * @author 楊以宏
 */
export function loadEnvConfig<T extends object>(
  dtoClass: ClassConstructor<T>,
  options?: envConfigOptions,
): T {
  const {
    validateOption,
    transformOption,
    dotenvOption,
    freeze = true,
  } = options || {};
  const rawConfig = replaceEnvVariable(
    dotenv.config(dotenvOption).parsed || {},
  );
  const defaultConfig: T = new dtoClass();
  const dto = toDto<T>(
    dtoClass,
    mergeDefault(rawConfig, defaultConfig),
    transformOption,
    validateOption || true,
  );
  if (freeze) {
    deepFreeze(dto);
  }
  return dto;
}

/**
 * 會將 ENV 中的 ${KEY} 字串取代為 KEY 的值並傳回新的物件
 *
 * 此段程式碼原始版本由冠文提供，感謝貢獻
 */
function replaceEnvVariable(parsed: dotenv.DotenvParseOutput): object {
  const result = {};
  const keyList = Object.keys(parsed);
  const regex = /(?<=\$\{).*?(?=\})/g;
  for (let i = 0; i < keyList.length; i++) {
    const key = keyList[i];
    let value = parsed[key];
    if (value === undefined) {
      continue;
    }
    let matchArray = regex.exec(value);
    while (matchArray !== null) {
      const matchKey = matchArray[0];
      const replaceValue = parsed[matchKey];
      if (matchKey === key) throw Error(`不可自己引用自己 ${matchKey}`);
      if (replaceValue === undefined) throw Error(`找無環境變數 ${matchKey}`);

      value = value.replace(`\${${matchKey}}`, replaceValue);
      parsed[key] = value;
      regex.lastIndex = 0;
      matchArray = regex.exec(value);
    }
    result[key] = parsed[key];
  }
  return result;
}
