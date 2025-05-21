import { TransformFnParams } from "class-transformer";
/**
 * 將字串轉換為布林值的轉換函數。用於 class-transformer 的 `@Transform()` 裝飾器。
 * 若 value 非字串則不會轉換，直接回傳原值。字串內容必須為 'true' 或 'false'，否則會拋出錯誤。
 */
export function stringToBoolean({ value, key }: TransformFnParams): boolean {
  if (typeof value !== "string") {
    return value;
  }
  value = value.trim().toLowerCase();
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`Value of ${key} must be 'true' or 'false' but got ${value}`);
}

/**
 * 將 null 值轉換為 undefined 的轉換函數。用於 class-transformer 的 `@Transform()` 裝飾器。
 * 當 value 為 null 時回傳 undefined，否則回傳原值。
 */
export function nullToUndefined({ value }: TransformFnParams): any {
  if (value === null) {
    return undefined;
  }
  return value;
}

export function undefinedToNull({ value }: TransformFnParams): any {
  if (value === undefined) {
    return null;
  }
  return value;
}

export function emptyStringToNull({ value }: TransformFnParams): any {
  if (value === "") {
    return null;
  }
  return value;
}

export function emptyStringToUndefined({ value }: TransformFnParams): any {
  if (value === "") {
    return undefined;
  }
  return value;
}

/**
 * 將字串轉換為整數的轉換函數。用於 class-transformer 的 `@Transform()` 裝飾器。
 * 當 value 非字串時不會轉換，直接回傳原值。
 * 字串內容必須為合法的整數，否則會拋出錯誤。
 */
export function stringToInteger({ value, key }: TransformFnParams): number {
  if (typeof value !== "string") {
    return value;
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Value of ${key} must be an integer but got ${value}`);
  }
  return num;
}

/**
 * 將字串轉換為數字的轉換函數。用於 class-transformer 的 `@Transform()` 裝飾器。
 * 當 value 非字串時不會轉換，直接回傳原值。
 * 字串內容必須為合法的數字，否則會拋出錯誤。
 */
export function stringToNumber({ value, key }: TransformFnParams): number {
  if (typeof value !== "string") {
    return value;
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Value of ${key} must be a number but got ${value}`);
  }
  return num;
}

/**
 * 將字串轉換為 null 的轉換函數。用於 class-transformer 的 `@Transform()` 裝飾器。
 * 當 value 為 'null' 時回傳 null，否則回傳原值。
 */
export function stringToNull({ value }: TransformFnParams): any {
  if (value === "null") {
    return null;
  }
  return value;
}
/**
 * 將字串轉換為陣列的轉換函數。用於 class-transformer 的 `@Transform()` 裝飾器。
 * 預設使用逗號分隔字串，並將每個元素去除前後空白。可透過 options 參數設定分隔符號及元素型別。
 * 當 value 非字串時不會轉換，直接回傳原值。
 * @param options.delimiter 分隔符號。預設為逗號。
 * @param options.elementType 元素型別。預設為 'string'。
 * @returns 傳回可用於 `@Transform()` 裝飾器的轉換函數。
 */
export function stringToArray(
  options: { delimiter?: string; elementType?: "string" | "number" } = {}
) {
  const { delimiter = ",", elementType = "string" } = options;
  return ({ value, key }: TransformFnParams): any[] => {
    if (typeof value !== "string") {
      return value;
    }
    const array = value.split(delimiter).map((item) => item.trim());
    if (elementType === "string") {
      return array;
    }
    if (elementType === "number") {
      return array.map((item, index) => {
        const num = Number(item);
        if (isNaN(num)) {
          throw new Error(
            `Value of ${key}[${index}] must be a number but got '${item}'`
          );
        }
        return num;
      });
    }
    throw new Error(`Unknown elementType: ${elementType as string}`);
  };
}
/**
 * 將字串轉換為日期的轉換函數。用於 class-transformer 的 `@Transform()` 裝飾器。
 * 當 value 非字串時不會轉換，直接回傳原值。
 */
export function stringToDate({ value, key }: TransformFnParams): Date {
  if (typeof value !== "string") {
    return value;
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(
      `Value of ${key} must be a valid date string but got ${value}`
    );
  }
  return date;
}

/**
 * 從另一個欄位複製值的轉換函數。用於 class-transformer 的 `@Transform()` 裝飾器。
 * @param options.source 來源欄位名稱。會從此欄位複製值。
 * @param options.overwrite 是否覆蓋原本的值。預設為 `true`。若為 false 則只有當前欄位值為 `undefined` 時才從來源欄位複製值。
 * @param options.copyUndefined 是否複製 `undefined` 值。預設為 `false`，即當來源欄位值為 `undefined` 時不複製值。
 * @returns 傳回可用於 `@Transform()` 裝飾器的轉換函數。
 */
export function copyFrom(options: {
  source: string;
  overwrite?: boolean;
  copyUndefined?: boolean;
}): (params: TransformFnParams) => any {
  const { source, overwrite = true, copyUndefined = false } = options;
  return ({ value, obj }) => {
    if (!overwrite && value !== undefined) {
      return value;
    }
    const newValue = obj[source];
    if (!copyUndefined && newValue === undefined) {
      return value;
    }
    return newValue;
  };
}

/**
 * 將 JSON 字串轉換為 物件的轉換函數。用於 class-transformer 的 `@Transform()` 裝飾器。
 * 當 value 非字串時不會轉換，直接回傳原值。
 * 字串內容必須為合法的 JSON 格式，否則會拋出錯誤。
 */
export function jsonStringToObject({ value }: TransformFnParams): any {
  if (typeof value === "string") {
    return JSON.parse(value);
  }
  return value;
}
