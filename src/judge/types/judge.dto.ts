import {
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsBase64,
  IsBoolean,
  IsEnum,
  ValidateNested
} from 'class-validator';

import { ProblemType } from '../../core';

export class SubmissionInfoDTO {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  lang: string;
}

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

  @ValidateNested()
  checker: SubmissionInfoDTO;

  @IsNotEmpty()
  cases: string[];

  @IsNotEmpty()
  lang: string;

  @IsBase64()
  @IsNotEmpty()
  code: string;

  @IsBoolean()
  returnReport = true;

  @IsBoolean()
  isSync: boolean = true;

  @IsBoolean()
  isTestAllCases: boolean = false;
}
