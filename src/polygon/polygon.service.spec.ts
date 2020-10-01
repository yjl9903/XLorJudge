import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/common';

import { PolygonService } from './polygon.service';

describe('PolygonService', () => {
  let service: PolygonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolygonService, ConfigService, HttpService]
    })
      .overrideProvider(HttpService)
      .useValue({})
      .compile();

    service = module.get<PolygonService>(PolygonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
