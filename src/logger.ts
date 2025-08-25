export type LogLevel = "debug" | "error" | "silent";

const logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "error";

export const logger = {
  debug: (...args: unknown[]) => {
    if (logLevel === "debug") {
      console.debug(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (logLevel !== "silent") {
      console.error(...args);
    }
  },
};
