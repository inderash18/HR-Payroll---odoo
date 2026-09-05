import { PipeTransform, ArgumentMetadata, Injectable } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/app-error';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema?: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // If a schema was provided directly in constructor, use it
    if (this.schema) {
      return this.validate(value, this.schema);
    }

    // If the metatype itself has a zod schema static property or is a zod schema
    const metatype = metadata.metatype as { schema?: ZodSchema; parse?: unknown } | undefined;
    if (metatype?.schema && typeof metatype.schema.safeParse === 'function') {
      return this.validate(value, metatype.schema);
    }

    return value;
  }

  private validate(value: unknown, schema: ZodSchema) {
    const result = schema.safeParse(value);
    if (!result.success) {
      const formattedErrors = (result.error as ZodError).issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));
      throw new ValidationError('Input validation failed', formattedErrors);
    }
    return result.data;
  }
}
