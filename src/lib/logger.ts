export interface Logger {
  log(message: unknown, ...args: unknown[]): void
  error(message: unknown, ...args: unknown[]): void
  warn(message: unknown, ...args: unknown[]): void
  info(message: unknown, ...args: unknown[]): void
}

class ConsoleLogger implements Logger {
  log(message: unknown, ...args: unknown[]): void {
    console.log('[LOG]', message, ...args)
  }

  error(message: unknown, ...args: unknown[]): void {
    console.error('[ERROR]', message, ...args)
  }

  warn(message: unknown, ...args: unknown[]): void {
    console.warn('[WARN]', message, ...args)
  }

  info(message: unknown, ...args: unknown[]): void {
    console.info('[INFO]', message, ...args)
  }
}

export const logger = new ConsoleLogger()
