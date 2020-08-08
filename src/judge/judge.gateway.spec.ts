import { Test, TestingModule } from '@nestjs/testing';
import { JudgeGateway } from './judge.gateway';
import { ConfigService } from '@nestjs/config';
import { JudgeService } from './judge.service';

describe('JudgeGateway', () => {
  let gateway: JudgeGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JudgeGateway, ConfigService, JudgeService]
    }).compile();

    gateway = module.get<JudgeGateway>(JudgeGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
