import { Submission } from './submission';
import { Result, ResultWithReport } from './result';

export enum ProblemType {
  CLASSIC = 'classic'
}

export enum SubmissionType {
  SUB = 'Submission',
  CHK = 'Checker',
  GEN = 'Generator',
  VAL = 'Validator',
  INT = 'Interactor'
}

export interface IFileBinding {
  src: string;
  dst: string;
  mode: '-R' | '-B';
}

export interface ISubmissionRunParam {
  workDir: string;
  fileBindings?: IFileBinding[];
  trusted?: boolean;

  executeCommand?: string;
  executeArgs?: string[];

  maxTime: number;
  maxMemory: number;

  stdinFile?: string;
  stdoutFile?: string;
  stderrFile?: string;
}

export interface RunOptions {
  returnReport?: boolean;
}

export interface IRunner {
  submission: Submission;
  maxTime: number;
  maxMemory: number;

  run(
    testcaseId: string,
    runOptions?: RunOptions
  ): Promise<Result | ResultWithReport>;
}
