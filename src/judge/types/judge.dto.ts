import {
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsBase64,
  IsBoolean,
  IsEnum
} from 'class-validator';

import { ProblemType } from '../../core';

export class JudgeSubmissionDTO {
  @IsEnum(ProblemType)
  type: ProblemType = ProblemType.CLASSIC;

  @IsNotEmpty()
  id: string;

  @Min(1)
  @Max(16)
  @IsNumber()
  @IsNotEmpty()
  maxTime: number; // seconds

  @Min(64)
  @Max(1024)
  @IsNumber()
  @IsNotEmpty()
  maxMemory: number; // mega bytes

  @IsNotEmpty()
  cases: string[];

  @IsNotEmpty()
  lang: string;

  @IsBase64()
  @IsNotEmpty()
  code: string;

  returnReport = false;
}

export interface HTTPJudgeSubmissionOptions {
  isSync?: boolean;

  isTestAllCases?: boolean;
}

export class HTTPJudgeSubmissionDTO extends JudgeSubmissionDTO {
  @IsBoolean()
  isSync: boolean = false;

  @IsBoolean()
  isTestAllCases: boolean = false;
}
