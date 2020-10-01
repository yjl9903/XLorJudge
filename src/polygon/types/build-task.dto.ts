import {
  isDefined,
  IsDefined,
  IsHexadecimal,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

import { SubmissionType } from '../../core';

export class BuildCodeDto {
  @IsNotEmpty()
  @IsString()
  @IsHexadecimal()
  id: string;

  @IsNotEmpty()
  @IsString()
  lang: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}

export class BuildTestcaseDto {
  @IsNotEmpty()
  @IsString()
  @IsHexadecimal()
  id: string;

  @ValidateIf(o => isDefined(o.accessToken))
  @IsNotEmpty()
  @IsString()
  accessToken?: string;

  @ValidateIf(o => isDefined(o.generator))
  @IsNotEmpty()
  @IsString()
  generator?: string;

  @ValidateIf(o => isDefined(o.args))
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @Type(() => String)
  args?: string[];
}

export class BuildTaskDto {
  @IsNotEmpty()
  @IsString()
  taskId: string;

  @IsNumber()
  version: number;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNumber()
  timeLimit: number;

  @IsNumber()
  memoryLimit: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => BuildCodeDto)
  checker: BuildCodeDto;

  @ValidateIf(o => isDefined(o.validator))
  @ValidateNested()
  @Type(() => BuildCodeDto)
  validator: BuildCodeDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => BuildCodeDto)
  correctSolution: BuildCodeDto;

  @ValidateIf(o => isDefined(o.generators))
  @ValidateNested({ each: true })
  @Type(() => BuildCodeDto)
  generators: BuildCodeDto[];

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BuildTestcaseDto)
  testcases: BuildTestcaseDto[];
}

export interface CompileResult {
  id: string;
  lang: string;
  type: SubmissionType;
  from: string;
  status: string; // OK or Fail
  timestamp: string;
}
