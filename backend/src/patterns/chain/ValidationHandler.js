export class ValidationHandler {
  nextHandler = null;
  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }
  async handle(context) {
    const result = await this.validate(context);
    if (!result.allowed) {
      return result;
    }
    if (this.nextHandler) {
      return this.nextHandler.handle(context);
    }
    return { allowed: true };
  }
}
