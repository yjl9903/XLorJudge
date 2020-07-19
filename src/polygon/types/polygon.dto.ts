import { IsNotEmpty, IsBase64, IsEnum } from 'class-validator';

import { SubmissionType } from '../../core';

export class CompileDTO {
  @IsNotEmpty()
  @IsEnum(SubmissionType, { message: 'Unsupport submission type' })
  type: SubmissionType;

  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  lang: string;

  @IsBase64()
  @IsNotEmpty()
  code: string;
}
