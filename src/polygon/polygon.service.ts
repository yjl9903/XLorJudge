import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import { CompileDTO } from './types/polygon.dto';

import { b64decode } from '../utils';
import { LangConfig, SUB_PATH } from '../configs';
import {
  SubmissionType,
  Submission,
  Checker,
  CompileError,
  Validator
} from '../core';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PolygonService {
  constructor(private readonly configService: ConfigService) {}

  async compile({ type, id, lang, code: b64Code }: CompileDTO) {
    const code = b64decode(b64Code);
    // TODO
    const sub =
      type === SubmissionType.CHK
        ? new Checker(id, lang)
        : type === SubmissionType.VAL
        ? new Validator(id, lang)
        : new Submission(lang, type, {
            file: id + '.' + LangConfig[lang].compiledExtension,
            dir: SUB_PATH
          }); // SUB, GEN, INT
    try {
      await sub.compile(code);
      return {
        id,
        type,
        from: this.configService.get<string>('SERVER_NAME'),
        status: 'OK',
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      throw new HttpException(
        {
          id,
          type,
          from: this.configService.get<string>('SERVER_NAME'),
          timestamp: new Date().toISOString(),
          ...CompileError.toHttpException(err)
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
