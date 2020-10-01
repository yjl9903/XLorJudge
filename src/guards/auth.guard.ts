import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as basicAuth from 'basic-auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  static getAuth(
    context: ExecutionContext
  ): { name: string; pass: string } | undefined {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      return basicAuth.parse(request.headers.authorization);
    }
    return undefined;
  }

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() === 'rpc') {
      // Skip when use Rabbit MQ
      return true;
    }
    const auth = AuthGuard.getAuth(context);
    if (
      auth &&
      auth.name === this.configService.get<string>('USERNAME') &&
      auth.pass === this.configService.get<string>('PASSWORD')
    ) {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
