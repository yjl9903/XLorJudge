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
