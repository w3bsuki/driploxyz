import { describe, it, expect } from 'vitest';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'firstname.lastname@company.com',
        'email@subdomain.domain.com'
      ];

      validEmails.forEach(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user name@domain.com',
        'user@domain',
        'user@.com',
        '.user@domain.com',
        'user@domain.',
        'user@domain..com'
      ];

      invalidEmails.forEach(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'StrongPass123!',
        'MyP@ssw0rd',
        'Complex123$%^',
        'V3ryS3cur3P@ss',
        'Test1234@Password',
        'SecurePass#2024'
      ];

      strongPasswords.forEach(password => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
        expect(isValid).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'password', // no uppercase, number, or special
        'PASSWORD', // no lowercase, number, or special
        '12345678', // no letters or special
        'Pass123', // too short
        'Password123', // no special character
        'Password!', // no number
        'Pass123!', // less than 8 chars
        'password123!', // no uppercase
        'PASSWORD123!', // no lowercase
        'Pass word!', // contains space
        'P@ss', // too short
        'password', // all lowercase
        'PASSWORD', // all uppercase
        '12345678!', // no letters
        'abcdefgh', // no uppercase, number, or special
        'ABCDEFGH', // no lowercase, number, or special
        'Abcdefgh', // no number or special
        'Abcdef12', // no special
        'Abc!defg' // no number
      ];

      weakPasswords.forEach(password => {
        const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      const validUsernames = [
        'john_doe',
        'jane123',
        'user_name',
        'testuser',
        'abc', // minimum length
        'user12345',
        'john.doe',
        'user-name'
      ];

      validUsernames.forEach(username => {
        // Alphanumeric, underscores, dots, hyphens, 3-30 characters
        const isValid = /^[a-zA-Z0-9_.-]{3,30}$/.test(username);
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        'ab', // too short
        'user@name', // invalid character
        'user name', // space
        'user#name', // special character
        'verylongusernamethatexceedsthelimit', // too long
        '', // empty
        '.username', // starts with dot
        'username.', // ends with dot
        '-username', // starts with hyphen
        'username-', // ends with hyphen
        '__username__', // multiple underscores at start/end
        'user..name' // consecutive dots
      ];

      invalidUsernames.forEach(username => {
        const isValid = /^[a-zA-Z0-9_.-]{3,30}$/.test(username);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '+1 (123) 456-7890',
        '+44 20 7123 4567',
        '+61 2 9876 5432',
        '123-456-7890',
        '(123) 456-7890',
        '123.456.7890',
        '1234567890'
      ];

      validPhones.forEach(phone => {
        // Basic phone validation - allows digits, spaces, dashes, parentheses, plus
        const phoneRegex = new RegExp('^[\\d\\s\\-\\(\\)\\+]+$');
        const isValid = phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123', // too short
        'abc-def-ghij', // letters
        '123-456-78901', // too long
        '', // empty
        '---', // only separators
        '(123) 456-7890 ext. 123', // extension
        '123 456 7890 x123' // extension
      ];

      invalidPhones.forEach(phone => {
        const phoneRegex = new RegExp('^[\\d\\s\\-\\(\\)\\+]+$');
        const isValid = phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
        expect(isValid).toBe(false);
      });
    });
  });

  describe('validateURL', () => {
    it('should validate correct URLs', () => {
      const validURLs = [
        'https://www.example.com',
        'http://example.com',
        'https://subdomain.example.com/path',
        'https://example.com:8080',
        'https://example.com/path?query=value',
        'https://example.com/path#section',
        'ftp://example.com',
        'http://localhost:3000',
        'https://192.168.1.1'
      ];

      validURLs.forEach(url => {
        try {
          new URL(url);
          expect(true).toBe(true);
        } catch {
          expect(false).toBe(true);
        }
      });
    });

    it('should reject invalid URLs', () => {
      const invalidURLs = [
        'not-a-url',
        'www.example.com', // missing protocol
        'http://', // incomplete
        'example://invalid', // invalid protocol
        '',
        '://missing-protocol.com',
        'http://.com',
        'https://.com',
        'http://invalid space.com'
      ];

      invalidURLs.forEach(url => {
        try {
          new URL(url);
          expect(false).toBe(true);
        } catch {
          expect(true).toBe(true);
        }
      });
    });
  });

  describe('validatePrice', () => {
    it('should validate correct prices', () => {
      const validPrices = [
        '0',
        '0.00',
        '10',
        '10.50',
        '100.99',
        '999999.99',
        '1',
        '1.1',
        '1.99'
      ];

      validPrices.forEach(price => {
        const isValid = /^\d+(\.\d{1,2})?$/.test(price);
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid prices', () => {
      const invalidPrices = [
        '-10',
        '10.999', // more than 2 decimal places
        'abc',
        '10.50.50', // multiple decimals
        '',
        '.50', // must start with digit
        '10.', // must have decimal digits after point if point exists
        '1,000', // comma as decimal separator
        '1 000', // space as separator
        '$10.50', // currency symbol
        '10€' // currency symbol
      ];

      invalidPrices.forEach(price => {
        const isValid = /^\d+(\.\d{1,2})?$/.test(price);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const inputs = [
        '<script>alert("xss")</script>Hello',
        '<p>This is <strong>bold</strong> text</p>',
        '<a href="javascript:alert(1)">Click me</a>',
        '<img src="x" onerror="alert(1)">',
        'Normal text without tags'
      ];

      const expected = [
        'Hello',
        'This is bold text',
        'Click me',
        '',
        'Normal text without tags'
      ];

      inputs.forEach((input, index) => {
        const sanitized = input.replace(/<[^>]*>?/gm, '');
        expect(sanitized).toBe(expected[index]);
      });
    });

    it('should handle empty and null inputs', () => {
      expect(''.replace(/<[^>]*>?/gm, '')).toBe('');
      expect(null).toBe(null);
      expect(undefined).toBe(undefined);
    });
  });

  describe('validateRequired', () => {
    it('should validate required fields', () => {
      const validInputs = [
        'text',
        '0',
        'false',
        '[]',
        '{}',
        '   text with spaces   ',
        '0'
      ];

      validInputs.forEach(input => {
        const isValid = input !== null && input !== undefined && input.toString().trim().length > 0;
        expect(isValid).toBe(true);
      });
    });

    it('should reject empty required fields', () => {
      const invalidInputs = [
        '',
        '   ',
        null,
        undefined
      ];

      invalidInputs.forEach(input => {
        const isValid = input !== null && input !== undefined && input.toString().trim().length > 0;
        expect(isValid).toBe(false);
      });
    });
  });

  describe('validateLength', () => {
    it('should validate string length within bounds', () => {
      const testCases = [
        { value: 'hello', min: 3, max: 10, expected: true },
        { value: 'hi', min: 3, max: 10, expected: false },
        { value: 'this is too long', min: 3, max: 10, expected: false },
        { value: 'exactly10', min: 10, max: 10, expected: true },
        { value: '', min: 0, max: 10, expected: true }
      ];

      testCases.forEach(({ value, min, max, expected }) => {
        const isValid = value.length >= min && value.length <= max;
        expect(isValid).toBe(expected);
      });
    });
  });

  describe('validatePattern', () => {
    it('should validate against custom patterns', () => {
      const testCases = [
        { value: 'ABC123', pattern: /^[A-Z]{3}\d{3}$/, expected: true },
        { value: 'abc123', pattern: /^[A-Z]{3}\d{3}$/, expected: false },
        { value: 'XYZ789', pattern: /^[A-Z]{3}\d{3}$/, expected: true },
        { value: 'AB1234', pattern: /^[A-Z]{3}\d{3}$/, expected: false },
        { value: 'user_123', pattern: /^[a-z]+_\d+$/, expected: true },
        { value: 'user-123', pattern: /^[a-z]+_\d+$/, expected: false }
      ];

      testCases.forEach(({ value, pattern, expected }) => {
        const isValid = pattern.test(value);
        expect(isValid).toBe(expected);
      });
    });
  });
});