import { AuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';

describe('AuthGuard', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
  });

  it('should be defined', () => {
    expect(new AuthGuard(configService)).toBeDefined();
  });
});
