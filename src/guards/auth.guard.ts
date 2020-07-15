import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import * as basicAuth from 'basic-auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = basicAuth.parse(request.headers.authorization) as {
      name: string;
      pass: string;
    };
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
