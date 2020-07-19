import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import { CompileDTO } from './types/polygon.dto';

import { b64decode } from '../utils';
import { LangConfig, SUB_PATH } from '../configs';
import { SubmissionType, Submission, Checker, CompileError } from '../core';

@Injectable()
export class PolygonService {
  async compile({ type, id, lang, code: b64Code }: CompileDTO) {
    const code = b64decode(b64Code);
    // TODO
    const sub =
      type === SubmissionType.SUB
        ? new Submission(lang, type, {
            file: id + '.' + LangConfig[lang].compiledExtension,
            dir: SUB_PATH
          })
        : type === SubmissionType.CHK
        ? new Checker(id, lang)
        : type === SubmissionType.VAL
        ? new Checker(id, lang)
        : type === SubmissionType.INT
        ? new Checker(id, lang)
        : new Checker(id, lang); // GEN
    try {
      await sub.compile(code);
      return {
        id,
        type,
        lang,
        status: 'OK',
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      if (err instanceof CompileError) {
        throw new HttpException(
          {
            id,
            type,
            lang,
            status: 'COMPILE_ERROR',
            error: err.message,
            timestamp: new Date().toISOString()
          },
          HttpStatus.BAD_REQUEST
        );
      } else {
        throw new HttpException(
          {
            id,
            type,
            lang,
            status: 'SYSTEM_ERROR',
            error: err.message,
            timestamp: new Date().toISOString()
          },
          HttpStatus.BAD_REQUEST
        );
      }
    }
  }
}
