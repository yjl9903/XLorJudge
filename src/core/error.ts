class CompileError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export default CompileError;
