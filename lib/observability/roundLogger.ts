type LogLevel = "info" | "warn" | "error";

interface RoundLogEvent {
  action: string;
  roundId?: string;
  userId?: string;
  durationMs?: number;
  message?: string;
  meta?: Record<string, unknown>;
}

function emit(level: LogLevel, event: RoundLogEvent) {
  const payload = {
    level,
    timestamp: new Date().toISOString(),
    ...event,
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const roundLogger = {
  info: (event: RoundLogEvent) => emit("info", event),
  warn: (event: RoundLogEvent) => emit("warn", event),
  error: (event: RoundLogEvent) => emit("error", event),
};
