import { ClassConstructor, ClassTransformOptions } from 'class-transformer';
import { ValidatorOptions } from 'class-validator';
import * as fs from 'fs';
import * as path from 'path';
import { deepFreeze, mergeDefault, toDto } from '../data/data-operation';

const DEFAULT_BASE_DIR = path.resolve(process.cwd(), 'config');
interface JsonConfigOptions {
  baseDir?: string;
  validateOption?: ValidatorOptions;
  transformOption?: ClassTransformOptions;
  freeze?: boolean;
}
/**
 * 載入 JSON 設定檔、進行驗證、轉換、凍結後回傳
 * @param dtoClass 欲轉換的類別
 * @param relativeFilePath 相對於 baseDir 的檔案路徑，注意：預設的 baseDir 為 'config'
 * @param options 進階選項
 * @param options.baseDir 設定檔的根目錄
 * @param options.validateOption class-validator 驗證選項
 * @param options.transformOption class-transformer 轉換選項
 * @param options.freeze 是否凍結物件 (預設為 true) 會以遞歸方式深層凍結物件
 * @author 楊以宏
 */
export function loadJsonConfig<T extends object>(
  dtoClass: ClassConstructor<T>,
  relativeFilePath: string,
  options?: JsonConfigOptions,
): T {
  const {
    baseDir = DEFAULT_BASE_DIR,
    validateOption,
    transformOption,
    freeze = true,
  } = options || {};
  fs.mkdirSync(baseDir, { recursive: true });
  const filePath = path.resolve(baseDir, relativeFilePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`JSON 設定檔遺失: ${filePath}`);
  }
  const rawConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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
