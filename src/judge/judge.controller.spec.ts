import { Test, TestingModule } from '@nestjs/testing';
import { JudgeController } from './judge.controller';
import { ConfigService } from '@nestjs/config';
import { JudgeService } from './judge.service';

describe('Judge Controller', () => {
  let controller: JudgeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, JudgeService],
      controllers: [JudgeController]
    }).compile();

    controller = module.get<JudgeController>(JudgeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});