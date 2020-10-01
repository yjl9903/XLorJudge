import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/common';

import { PolygonController } from './polygon.controller';
import { PolygonService } from './polygon.service';

describe('Polygon Controller', () => {
  let controller: PolygonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, PolygonService, HttpService],
      controllers: [PolygonController]
    })
      .overrideProvider(HttpService)
      .useValue({})
      .compile();

    controller = module.get<PolygonController>(PolygonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
