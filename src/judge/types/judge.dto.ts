import {
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsBase64,
  IsBoolean
} from 'class-validator';

export class JudgeSubmissionDTO {
  type: string = 'classic';

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
}

export class HTTPJudgeSubmissionDTO extends JudgeSubmissionDTO {
  @IsBoolean()
  isSync: boolean = false;
}
