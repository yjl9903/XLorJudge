import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JudgeService } from './judge.service';

describe('JudgeService', () => {
  let service: JudgeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, JudgeService]
    }).compile();

    service = module.get<JudgeService>(JudgeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
