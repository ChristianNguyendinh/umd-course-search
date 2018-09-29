import winston from 'winston';
import path from 'path';

const { logging: LOGGER_CONFIG } = require('@root/config.json');

type LogType = 'file' | 'console';

interface ILogConfig {
    level: string;
    filename?: string;
}

function createTransport(logType: LogType, logConfig: ILogConfig) {
    // check for node env var to avoid writing logs during tests?
    if (logType === 'file') {
        // put file in root - kinda ugly...
        const filename = path.join(__dirname + '../../../../logs/' + logConfig.filename);
        return new winston.transports.File({
            level: logConfig.level,
            filename
        });
    } else {
        return new winston.transports.Console(logConfig);
    }
}

function initializeTransports() {
    const transports = [];
    for (const logType in LOGGER_CONFIG) {
        if (LOGGER_CONFIG.hasOwnProperty(logType)) {
            const transport = createTransport(logType as LogType, LOGGER_CONFIG[logType]);
            if (transport) {
                transports.push(transport);
            }
        }
    }

    return transports;
}

/** singleton winston logger */
const logger = winston.createLogger({
    transports: initializeTransports()
});

/**
 * Returns a logging object that prefixes log messages with a parameter tag.
 * Logging object supports error(), warn(), info(), verbose(), debug(), silly(), log() methods that
 * log based on the corresponding npm logging level. log() uses level 'info'. Uses transports and
 * level filtering based on 'logging' object in config.json
 *
 * @param tag - prefix tag
 * @returns - logging object described above
 */
export default (tag: string) => {
    const _log = (level: string, ...args: string[]) => {
        logger.log({
            level,
            message: `${tag}: ${args.join(' ')}`
        });
    };

    const loggingObj: any = {
        log: (...args: string[]) => {
            _log('info', ...args);
        }
    };
    const LEVELS = [ 'error', 'warn', 'info', 'verbose', 'debug', 'silly' ];

    for (const level of LEVELS) {
        loggingObj[level] = (...args: string[]) => {
            _log(level, ...args);
        };
    }

    return loggingObj;
};
