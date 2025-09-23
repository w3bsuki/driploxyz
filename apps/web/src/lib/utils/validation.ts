import * as i18n from '@repo/i18n';

/**
 * Validation error messages in multiple languages
 */
const VALIDATION_MESSAGES = {
  'en': {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    password: 'Password must be at least 8 characters long',
    passwordMatch: 'Passwords do not match',
    minLength: 'Must be at least {min} characters long',
    maxLength: 'Cannot exceed {max} characters',
    minValue: 'Must be at least {min}',
    maxValue: 'Cannot exceed {max}',
    numeric: 'Must be a number',
    positive: 'Must be a positive number',
    integer: 'Must be a whole number',
    username: 'Username can only contain letters, numbers, and underscores',
    url: 'Please enter a valid URL',
    phone: 'Please enter a valid phone number',
    postalCode: 'Please enter a valid postal code',
    dateFormat: 'Please enter a valid date',
    futureDate: 'Date must be in the future',
    pastDate: 'Date must be in the past',
    fileSize: 'File size cannot exceed {max}MB',
    fileType: 'File type not supported',
    imageFormat: 'Please upload a valid image (JPG, PNG, GIF)',
    priceRange: 'Price must be between {min} and {max}',
    strongPassword: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  },
  'bg': {
    required: 'Това поле е задължително',
    email: 'Моля, въведете валиден имейл адрес',
    password: 'Паролата трябва да бъде поне 8 символа',
    passwordMatch: 'Паролите не съвпадат',
    minLength: 'Трябва да бъде поне {min} символа',
    maxLength: 'Не може да превишава {max} символа',
    minValue: 'Трябва да бъде поне {min}',
    maxValue: 'Не може да превишава {max}',
    numeric: 'Трябва да бъде число',
    positive: 'Трябва да бъде положително число',
    integer: 'Трябва да бъде цяло число',
    username: 'Потребителското име може да съдържа само букви, цифри и долни черти',
    url: 'Моля, въведете валиден URL',
    phone: 'Моля, въведете валиден телефонен номер',
    postalCode: 'Моля, въведете валиден пощенски код',
    dateFormat: 'Моля, въведете валидна дата',
    futureDate: 'Датата трябва да бъде в бъдещето',
    pastDate: 'Датата трябва да бъде в миналото',
    fileSize: 'Размерът на файла не може да превишава {max}MB',
    fileType: 'Типът файл не се поддържа',
    imageFormat: 'Моля, качете валидно изображение (JPG, PNG, GIF)',
    priceRange: 'Цената трябва да бъде между {min} и {max}',
    strongPassword: 'Паролата трябва да съдържа поне една главна буква, една малка буква и една цифра'
  },
  'ru': {
    required: 'Это поле обязательно для заполнения',
    email: 'Пожалуйста, введите корректный email адрес',
    password: 'Пароль должен содержать минимум 8 символов',
    passwordMatch: 'Пароли не совпадают',
    minLength: 'Должно содержать минимум {min} символов',
    maxLength: 'Не может превышать {max} символов',
    minValue: 'Должно быть минимум {min}',
    maxValue: 'Не может превышать {max}',
    numeric: 'Должно быть числом',
    positive: 'Должно быть положительным числом',
    integer: 'Должно быть целым числом',
    username: 'Имя пользователя может содержать только буквы, цифры и подчеркивания',
    url: 'Пожалуйста, введите корректный URL',
    phone: 'Пожалуйста, введите корректный номер телефона',
    postalCode: 'Пожалуйста, введите корректный почтовый индекс',
    dateFormat: 'Пожалуйста, введите корректную дату',
    futureDate: 'Дата должна быть в будущем',
    pastDate: 'Дата должна быть в прошлом',
    fileSize: 'Размер файла не может превышать {max}МБ',
    fileType: 'Тип файла не поддерживается',
    imageFormat: 'Пожалуйста, загрузите корректное изображение (JPG, PNG, GIF)',
    priceRange: 'Цена должна быть между {min} и {max}',
    strongPassword: 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру'
  },
  'ua': {
    required: 'Це поле є обов\'язковим',
    email: 'Будь ласка, введіть коректну email адресу',
    password: 'Пароль повинен містити мінімум 8 символів',
    passwordMatch: 'Паролі не співпадають',
    minLength: 'Повинно містити мінімум {min} символів',
    maxLength: 'Не може перевищувати {max} символів',
    minValue: 'Повинно бути мінімум {min}',
    maxValue: 'Не може перевищувати {max}',
    numeric: 'Повинно бути числом',
    positive: 'Повинно бути позитивним числом',
    integer: 'Повинно бути цілим числом',
    username: 'Ім\'я користувача може містити тільки літери, цифри та підкреслення',
    url: 'Будь ласка, введіть коректний URL',
    phone: 'Будь ласка, введіть коректний номер телефону',
    postalCode: 'Будь ласка, введіть коректний поштовий індекс',
    dateFormat: 'Будь ласка, введіть коректну дату',
    futureDate: 'Дата повинна бути в майбутньому',
    pastDate: 'Дата повинна бути в минулому',
    fileSize: 'Розмір файлу не може перевищувати {max}МБ',
    fileType: 'Тип файлу не підтримується',
    imageFormat: 'Будь ласка, завантажте коректне зображення (JPG, PNG, GIF)',
    priceRange: 'Ціна повинна бути між {min} та {max}',
    strongPassword: 'Пароль повинен містити мінімум одну велику літеру, одну малу літеру та одну цифру'
  }
} as const;

type LocaleKey = keyof typeof VALIDATION_MESSAGES;
type MessageKey = keyof typeof VALIDATION_MESSAGES['en'];

/**
 * Get validation error message in current locale
 */
export function getValidationMessage(
  key: MessageKey, 
  params?: Record<string, string | number>,
  locale?: string
): string {
  const currentLocale = (locale || i18n.getLocale()) as LocaleKey;
  const messages = VALIDATION_MESSAGES[currentLocale] || VALIDATION_MESSAGES.en;
  
  let message: string = messages[key as keyof typeof messages] || key;
  
  // Replace placeholders with actual values
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      message = message.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
    });
  }
  
  return message;
}

/**
 * Validation functions with localized error messages
 */
export const validators = {
  required: (value: unknown, locale?: string): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return getValidationMessage('required', undefined, locale);
    }
    return null;
  },

  email: (value: string, locale?: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return getValidationMessage('email', undefined, locale);
    }
    return null;
  },

  password: (value: string, locale?: string): string | null => {
    if (value && value.length < 8) {
      return getValidationMessage('password', undefined, locale);
    }
    return null;
  },

  strongPassword: (value: string, locale?: string): string | null => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (value && !strongPasswordRegex.test(value)) {
      return getValidationMessage('strongPassword', undefined, locale);
    }
    return null;
  },

  passwordMatch: (password: string, confirmPassword: string, locale?: string): string | null => {
    if (password && confirmPassword && password !== confirmPassword) {
      return getValidationMessage('passwordMatch', undefined, locale);
    }
    return null;
  },

  minLength: (value: string, min: number, locale?: string): string | null => {
    if (value && value.length < min) {
      return getValidationMessage('minLength', { min }, locale);
    }
    return null;
  },

  maxLength: (value: string, max: number, locale?: string): string | null => {
    if (value && value.length > max) {
      return getValidationMessage('maxLength', { max }, locale);
    }
    return null;
  },

  minValue: (value: number, min: number, locale?: string): string | null => {
    if (value < min) {
      return getValidationMessage('minValue', { min }, locale);
    }
    return null;
  },

  maxValue: (value: number, max: number, locale?: string): string | null => {
    if (value > max) {
      return getValidationMessage('maxValue', { max }, locale);
    }
    return null;
  },

  numeric: (value: string, locale?: string): string | null => {
    if (value && isNaN(Number(value))) {
      return getValidationMessage('numeric', undefined, locale);
    }
    return null;
  },

  positive: (value: number, locale?: string): string | null => {
    if (value <= 0) {
      return getValidationMessage('positive', undefined, locale);
    }
    return null;
  },

  integer: (value: string, locale?: string): string | null => {
    if (value && (!Number.isInteger(Number(value)) || Number(value) !== Math.floor(Number(value)))) {
      return getValidationMessage('integer', undefined, locale);
    }
    return null;
  },

  username: (value: string, locale?: string): string | null => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (value && !usernameRegex.test(value)) {
      return getValidationMessage('username', undefined, locale);
    }
    return null;
  },

  url: (value: string, locale?: string): string | null => {
    try {
      if (value) {
        new URL(value);
      }
      return null;
    } catch {
      return getValidationMessage('url', undefined, locale);
    }
  },

  phone: (value: string, locale?: string): string | null => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (value && !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return getValidationMessage('phone', undefined, locale);
    }
    return null;
  },

  priceRange: (value: number, min: number, max: number, locale?: string): string | null => {
    if (value < min || value > max) {
      return getValidationMessage('priceRange', { min, max }, locale);
    }
    return null;
  },

  fileSize: (file: File, maxSizeMB: number, locale?: string): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return getValidationMessage('fileSize', { max: maxSizeMB }, locale);
    }
    return null;
  },

  imageFormat: (file: File, locale?: string): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return getValidationMessage('imageFormat', undefined, locale);
    }
    return null;
  }
};

/**
 * Validate multiple fields with a validation schema
 */
export interface ValidationRule {
  validator: keyof typeof validators;
  params?: unknown[];
  message?: string;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateSchema(
  data: Record<string, unknown>, 
  schema: ValidationSchema, 
  locale?: string
): ValidationResult {
  const errors: Record<string, string> = {};
  
  Object.entries(schema).forEach(([fieldName, rules]) => {
    const value = data[fieldName];
    
    for (const rule of rules) {
      const validator = validators[rule.validator as keyof typeof validators] as (...args: unknown[]) => string | null;
      if (!validator) {
        
        continue;
      }
      
      const error = rule.params 
        ? validator(value, ...rule.params, locale)
        : validator(value, locale);
      
      if (error) {
        errors[fieldName] = rule.message || error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Create a validation function for a specific locale
 */
export function createValidator(locale: string) {
  return {
    getMessage: (key: MessageKey, params?: Record<string, string | number>) => 
      getValidationMessage(key, params, locale),
    
    validate: (data: Record<string, unknown>, schema: ValidationSchema) => 
      validateSchema(data, schema, locale),
    
    validators: Object.fromEntries(
      Object.entries(validators).map(([key, validator]) => [
        key,
        (...args: unknown[]) => (validator as (...args: unknown[]) => string | null)(...args, locale)
      ])
    )
  };
}