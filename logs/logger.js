const winston = require('winston');
require('winston-daily-rotate-file');

const { combine, timestamp, printf } = winston.format;

const myFormat = printf(info => {
  if(info instanceof Error) {
    return `${info.timestamp} ${info.level}: ${info.message} ${info.stack} \n`;
  }
  return `${info.timestamp} ${info.level}: ${info.message} \n`;
});

const logger = winston.createLogger({
  level: 'error',
  format: combine(
    winston.format.splat(),
    timestamp(),
    myFormat,
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' }),
  ],
});

module.exports = {
  logger: logger
};