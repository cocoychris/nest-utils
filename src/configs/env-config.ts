import { ClassConstructor, ClassTransformOptions } from "class-transformer";
import { ValidatorOptions } from "class-validator";
import * as dotenv from "dotenv";
import { deepFreeze, mergeDefault, toDto } from "../data/data-operation";

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
  options?: envConfigOptions
): T {
  const {
    validateOption,
    transformOption,
    dotenvOption,
    freeze = true,
  } = options || {};
  const rawConfig: Record<string, any> =
    dotenv.config(dotenvOption).parsed || {};
  const defaultConfig: T = new dtoClass();
  const dto = toDto<T>(
    dtoClass,
    mergeDefault(rawConfig, defaultConfig),
    transformOption,
    validateOption || true
  );
  if (freeze) {
    deepFreeze(dto);
  }
  return dto;
}
