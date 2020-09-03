import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { b64decode } from '../utils';
import { LangConfig, SUB_PATH } from '../configs';
import {
  Checker,
  CompileError,
  Submission,
  SubmissionType,
  Validator,
  Generator
} from '../core';

import { CompileDTO } from './types/polygon.dto';

@Injectable()
export class PolygonService {
  constructor(private readonly configService: ConfigService) {}

  async compile({ type, id, lang, code: b64Code }: CompileDTO) {
    const code = b64decode(b64Code);
    const sub =
      type === SubmissionType.CHK
        ? new Checker(id, lang)
        : type === SubmissionType.VAL
        ? new Validator(id, lang)
        : type === SubmissionType.GEN
        ? new Generator(id, lang)
        : new Submission(lang, type, {
            file: id + '.' + LangConfig[lang].compiledExtension,
            dir: SUB_PATH
          }); // SUB, INT
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
