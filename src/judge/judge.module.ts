import { Module } from '@nestjs/common';
import { JudgeService } from './judge.service';
import { JudgeController } from './judge.controller';
import { JudgeGateway } from './judge.gateway';

@Module({
  providers: [JudgeService, JudgeGateway],
  controllers: [JudgeController]
})
export class JudgeModule {}
