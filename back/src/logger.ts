const { createLogger, transports, format } = require('winston');
const { combine, timestamp, printf } = format;

type p = {level: any, message: any, timestamp: any}
const logFormat = printf(({ level, message, timestamp }:p) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.File({ filename: 'combined.log' }), // Файл для всех логов
    new transports.File({ filename: 'errors.log', level: 'error' }) // Файл только для ошибок
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.colorize(),
      logFormat
    )
  }));
}

export { logger };
