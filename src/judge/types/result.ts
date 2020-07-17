import { Verdict } from '../../verdict';

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

export type ResultMessage = { id: string } & (
  | WaitingMessage
  | CompilingMessage
  | Error
);
