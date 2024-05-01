import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import {
  CannotCreateEntityIdMapError,
  EntityNotFoundError,
  QueryFailedError,
  TypeORMError,
} from 'typeorm';

@Catch(TypeORMError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: TypeORMError, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let statusCode = 500;

    if (exception instanceof EntityNotFoundError) {
      statusCode = 404;
    } else if (exception instanceof CannotCreateEntityIdMapError) {
      statusCode = 400;
    } else if (exception instanceof QueryFailedError) {
      statusCode = 400;
    }

    response.status(statusCode).json({
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
