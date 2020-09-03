import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isDefined } from 'class-validator';

import { EMPTY, Observable } from 'rxjs';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/takeWhile';

import { b64decode } from '../utils';
import { LangConfig, SUB_PATH } from '../configs';
import {
  Checker,
  CompileError,
  Generator,
  Submission,
  SubmissionType,
  Validator
} from '../core';

import { CompileDTO } from './types/polygon.dto';
import { BuildTaskDto } from './types/build-task.dto';

@Injectable()
export class PolygonService {
  constructor(private readonly configService: ConfigService) {}

  compile({ type, id, lang, code: b64Code }: CompileDTO) {
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
    return new Observable(subscriber => {
      sub
        .compile(code)
        .then(() =>
          subscriber.next({
            id,
            type,
            from: this.configService.get<string>('SERVER_NAME'),
            status: 'OK',
            timestamp: new Date().toISOString()
          })
        )
        .catch(err =>
          subscriber.next({
            // Return Bad Request?
            id,
            type,
            from: this.configService.get<string>('SERVER_NAME'),
            status: 'Fail',
            timestamp: new Date().toISOString(),
            ...CompileError.toHttpException(err)
          })
        )
        .then(() => subscriber.complete());
    });
  }

  build(buildTaskDto: BuildTaskDto) {
    const getId = (id: string) => id + '@' + buildTaskDto.taskId;
    let isError = false;

    const compileTask = this.compile({
      type: SubmissionType.CHK,
      id: getId(buildTaskDto.checker.id),
      code: buildTaskDto.checker.code,
      lang: buildTaskDto.checker.lang
    })
      .concat(
        isDefined(buildTaskDto.validator)
          ? this.compile({
              type: SubmissionType.VAL,
              id: getId(buildTaskDto.validator.id),
              code: buildTaskDto.validator.code,
              lang: buildTaskDto.validator.lang
            })
          : EMPTY
      )
      .concat(
        this.compile({
          type: SubmissionType.SUB,
          id: getId(buildTaskDto.correctSolution.id),
          code: buildTaskDto.correctSolution.code,
          lang: buildTaskDto.correctSolution.lang
        })
      )
      .concat(
        ...buildTaskDto.generators.map(generator =>
          this.compile({
            type: SubmissionType.GEN,
            id: getId(generator.id),
            code: generator.code,
            lang: generator.lang
          })
        )
      )
      .takeWhile((value: any) => {
        // If i is error, then i + 1 stop
        if (isError) {
          return false;
        } else if (value.status === 'OK') {
          return true;
        } else {
          isError = true;
          return true;
        }
      });
    // TODO: testcase download and so on.
    return compileTask;
  }
}
