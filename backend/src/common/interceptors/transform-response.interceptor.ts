import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../response/api-response.interface';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpCtx = context.switchToHttp();
    const response = httpCtx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // Skip binary, stream, or buffer responses (e.g. PDF generation)
        if (
          data instanceof StreamableFile ||
          Buffer.isBuffer(data) ||
          (data && typeof data === 'object' && (data.pipe || data._readableState))
        ) {
          return data;
        }

        // Skip direct HTML strings (e.g. payslip HTML preview)
        const contentType = response.getHeader ? response.getHeader('content-type') : null;
        if (typeof data === 'string' && contentType && String(contentType).includes('text/html')) {
          return data;
        }

        // Standardize pagination list responses
        const isListObject =
          data &&
          typeof data === 'object' &&
          (Array.isArray(data.items) || Array.isArray(data.data)) &&
          (data.pagination !== undefined || typeof data.total === 'number');

        if (isListObject) {
          const list = Array.isArray(data.items) ? data.items : data.data;
          const paginationObj = data.pagination || {};
          const total = Number(paginationObj.total ?? data.total) || (Array.isArray(list) ? list.length : 0);
          const page = Number(paginationObj.page ?? data.page) || 1;
          const limit = Number(paginationObj.limit ?? data.limit) || 50;
          const pages = Number(paginationObj.totalPages ?? data.totalPages) || Math.ceil(total / (limit || 1)) || (total === 0 ? 0 : 1);

          return {
            success: true,
            data: list,
            pagination: {
              page,
              limit,
              total,
              pages,
              hasNext: page < pages,
              hasPrevious: page > 1,
            },
          };
        }

        // Standardize plain array responses
        if (Array.isArray(data)) {
          return {
            success: true,
            data,
          };
        }

        // If response is already in standard { success: true, ... } format
        if (data && typeof data === 'object' && data.success === true) {
          // If it has data field already, preserve it
          if ('data' in data) {
            return data;
          }

          // If it has tokens / auth payload, standardize
          const { success, message, ...rest } = data;
          return {
            success: true,
            ...(message ? { message } : {}),
            data: Object.keys(rest).length > 0 ? rest : undefined,
            ...rest,
          };
        }

        // Standardize single object / resource response
        if (data && typeof data === 'object') {
          const { message, ...restData } = data;
          const hasOnlyMessage = Object.keys(restData).length === 0;

          return {
            success: true,
            ...(message ? { message } : {}),
            data: hasOnlyMessage ? undefined : (Object.keys(restData).length > 0 ? restData : data),
          };
        }

        // Primitive values (string, boolean, number)
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
