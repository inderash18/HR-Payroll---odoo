import { describe, it, expect } from 'vitest';
import { ZodValidationPipe } from './zod-validation.pipe';
import { z } from 'zod';
import { ValidationError } from '../errors/app-error';

describe('ZodValidationPipe', () => {
  const testSchema = z.object({
    email: z.string().email(),
    age: z.number().min(18),
  });

  const pipe = new ZodValidationPipe(testSchema);

  it('should successfully pass valid data', () => {
    const validData = { email: 'test@example.com', age: 25 };
    const result = pipe.transform(validData, { type: 'body' });
    expect(result).toEqual(validData);
  });

  it('should throw ValidationError on invalid email format', () => {
    const invalidData = { email: 'not-an-email', age: 25 };
    expect(() => pipe.transform(invalidData, { type: 'body' })).toThrowError(
      ValidationError,
    );
  });

  it('should throw ValidationError on underage age', () => {
    const invalidData = { email: 'test@example.com', age: 16 };
    expect(() => pipe.transform(invalidData, { type: 'body' })).toThrowError(
      ValidationError,
    );
  });
});
