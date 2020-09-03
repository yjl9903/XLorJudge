import { Test, TestingModule } from '@nestjs/testing';
import { PolygonService } from './polygon.service';
import { ConfigService } from '@nestjs/config';

describe('PolygonService', () => {
  let service: PolygonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolygonService, ConfigService]
    }).compile();

    service = module.get<PolygonService>(PolygonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
