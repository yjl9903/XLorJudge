import { Verdict, JudgeVerdict } from '../../verdict';

export interface WaitingMessage {
  verdict: Verdict.Waiting;
}

export interface CompilingMessage {
  verdict: Verdict.Compiling;
}

export interface ErrorMessage {
  verdict:
    | Verdict.CompileError
    | Verdict.TestCaseError
    | Verdict.JudgeError
    | Verdict.SystemError;
  message: string;
}

export interface JudgingMessage {
  verdict: JudgeVerdict;
  testcaseId: string;
  time: number;
  memory: number;
  output?: string;
  checkerOutput?: string;
}

export type ResultMessage =
  | WaitingMessage
  | CompilingMessage
  | JudgingMessage
  | ErrorMessage;
