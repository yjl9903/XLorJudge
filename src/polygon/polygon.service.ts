import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isDefined } from 'class-validator';

import { EMPTY, from, Observable, of } from 'rxjs';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/takeWhile';

import { b64decode, rimraf } from '../utils';
import {
  CHK_PATH,
  DATA_PATH,
  GEN_PATH,
  LangConfig,
  SUB_PATH,
  VAL_PATH
} from '../configs';
import {
  Checker,
  CompileError,
  Generator,
  Submission,
  SubmissionType,
  TestCase,
  Validator
} from '../core';

import { CompileDTO } from './types/polygon.dto';
import {
  BuildTaskDto,
  BuildTestcaseDto,
  CompileResult
} from './types/build-task.dto';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as path from 'path';

@Injectable()
export class PolygonService {
  private readonly serverName;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.serverName = this.configService.get<string>('SERVER_NAME');
  }

  compile({
    type,
    id,
    lang,
    code: b64Code
  }: CompileDTO): Observable<CompileResult> {
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
    return new Observable<CompileResult>(subscriber => {
      sub
        .compile(code)
        .then(() =>
          subscriber.next({
            id,
            lang,
            type,
            from: this.serverName,
            status: 'OK',
            timestamp: new Date().toISOString()
          })
        )
        .catch(err =>
          subscriber.next({
            // Return Bad Request?
            id,
            lang,
            type,
            from: this.serverName,
            status: 'Fail',
            timestamp: new Date().toISOString(),
            ...CompileError.toHttpException(err)
          })
        )
        .then(() => subscriber.complete());
    });
  }

  async clearOldVersion(prefix: string) {
    await Promise.all([
      rimraf(path.join(CHK_PATH, prefix + '*')),
      rimraf(path.join(VAL_PATH, prefix + '*')),
      rimraf(path.join(SUB_PATH, prefix + '*')),
      rimraf(path.join(GEN_PATH, prefix + '*')),
      rimraf(path.join(DATA_PATH, prefix + '*'))
    ]);
    return { status: 'OK', action: 'clear' };
  }

  build(buildTaskDto: BuildTaskDto): Observable<any> {
    const generatorMap = new Map<string, Generator>();
    let checker: Checker;
    let validator: Validator;

    const prefix = buildTaskDto.taskId + '-' + buildTaskDto.version + '-';
    const getId = (id: string) => prefix + id;

    const clearTask = from(this.clearOldVersion(prefix));

    const compileTask = EMPTY.concat(
      this.compile({
        type: SubmissionType.CHK,
        id: getId(buildTaskDto.checker.id),
        code: buildTaskDto.checker.code,
        lang: buildTaskDto.checker.lang
      })
    )
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
          type: SubmissionType.GEN,
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
      .map((result: CompileResult) => {
        if (result.type === SubmissionType.CHK) {
          checker = new Checker(result.id, result.lang);
        } else if (result.type === SubmissionType.VAL) {
          validator = new Validator(result.id, result.lang);
        } else if (result.type === SubmissionType.GEN) {
          generatorMap.set(result.id, new Generator(result.id, result.lang));
        }
        return {
          ...result,
          action: 'compile'
        };
      });

    // Warning: maybe some bugs in concurrent
    const testcaseTask = from(buildTaskDto.testcases).pipe(
      mergeMap((task: BuildTestcaseDto) => {
        const testcaseId = getId(task.id);
        const testcase = new TestCase(testcaseId);

        return ('generator' in task
          ? from(
              testcase.genIn(
                generatorMap.get(getId(task.generator)),
                task.args || []
              )
            ).pipe(
              map(result => {
                if ('message' in result) {
                  throw new Error(result.message);
                }
                return {
                  result,
                  action: 'generate'
                };
              })
            )
          : this.httpService.get(buildTaskDto.url + task.accessToken).pipe(
              mergeMap(({ data }) => {
                return from(testcase.writeIn(data));
              }),
              map(() => ({ action: 'download' }))
            )
        ).pipe(
          map(result => ({
            ...result,
            testcaseId,
            status: 'OK'
          })),
          catchError((err: any) => {
            return of({
              message: err.message,
              testcaseId,
              action: 'generator' in task ? 'generate' : 'download',
              status: 'Fail'
            });
          }),
          mergeMap(inputResult => {
            return of(inputResult).concat(
              validator
                ? from(validator.validate(testcaseId)).pipe(
                    map(result => {
                      if ('message' in result) {
                        throw new Error(result.message);
                      }
                      return {
                        result,
                        testcaseId,
                        action: 'validate',
                        status: 'OK'
                      };
                    }),
                    catchError((err: any) => {
                      return of({
                        message: err.message,
                        testcaseId,
                        action: 'validate',
                        status: 'Fail'
                      });
                    })
                  )
                : EMPTY,
              from(
                testcase.genAns(
                  generatorMap.get(getId(buildTaskDto.correctSolution.id))
                )
              ).pipe(
                map(result => {
                  if ('message' in result) {
                    throw new Error(result.message);
                  }
                  return {
                    result,
                    testcaseId,
                    action: 'answer',
                    status: 'OK'
                  };
                }),
                catchError((err: any) => {
                  return of({
                    message: err.message,
                    testcaseId,
                    action: 'answer',
                    status: 'Fail'
                  });
                })
              )
            );
          })
        );
      })
    );

    return clearTask
      .concat(compileTask)
      .concat(testcaseTask)
      .concat(
        of({
          status: 'OK',
          action: 'finish'
        })
      )
      .pipe(
        map(result => ({
          ...result,
          from: this.serverName,
          taskId: buildTaskDto.taskId,
          version: buildTaskDto.version
        }))
      );
  }
}
