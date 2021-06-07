const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

process.on('unhandledRejection', (ex) => {
    throw ex;
});
 
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.timestamp({
            format: 'DD-MM-YYYY HH:mm:ss'
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'logfile.log' }),
        new winston.transports.MongoDB({
            level: 'error',
            db : 'mongodb://localhost/vidly',
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true
            },
            format: winston.format.combine(
                winston.format.errors({ stack: true }),
                winston.format.timestamp(),
                winston.format.json())
        })
    ],
    exceptionHandlers: [
        new winston.transports.Console({
            format: winston.format.simple()
        }),
        new winston.transports.File({ filename: 'uncaughtExceptions.log' })
    ]
});
 
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
        level: 'info'
    }));
}
 
module.exports = logger;