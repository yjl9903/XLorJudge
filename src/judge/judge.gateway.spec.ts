import { Test, TestingModule } from '@nestjs/testing';
import { JudgeGateway } from './judge.gateway';

describe('JudgeGateway', () => {
  let gateway: JudgeGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JudgeGateway]
    }).compile();

    gateway = module.get<JudgeGateway>(JudgeGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
