import { Module } from '@nestjs/common';
import { JudgeService } from './judge.service';
import { JudgeController } from './judge.controller';

@Module({
  providers: [JudgeService],
  controllers: [JudgeController]
})
export class JudgeModule {}
