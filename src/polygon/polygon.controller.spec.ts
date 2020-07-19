import { Test, TestingModule } from '@nestjs/testing';
import { PolygonController } from './polygon.controller';
import { ConfigService } from '@nestjs/config';
import { PolygonService } from './polygon.service';

describe('Polygon Controller', () => {
  let controller: PolygonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, PolygonService],
      controllers: [PolygonController]
    }).compile();

    controller = module.get<PolygonController>(PolygonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
