import winston from "winston"



// error: 0    ← Always logged
// warn: 1     ← Logged if level is 'warn' or below  
// info: 2     ← Logged if level is 'info' or below
// http: 3     ← Logged if level is 'http' or below
// verbose: 4  ← Logged if level is 'verbose' or below
// debug: 5    ← Logged if level is 'debug' or below
// silly: 6    ← Logged if level is 'silly' or below


const logger = winston.createLogger({
  level: "http",
  format: winston.format.combine(
    winston.format.colorize({colors:{info:"blue",http:"yellow",error:"red",warning:"orange"}}),
    winston.format.json(),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.Http({
      host: 'localHost',
      port: 3000,
      path: '/logs'
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error', 
      format: winston.format.combine(
        winston.format.colorize({colors:{info:"blue",http:"yellow",error:"red",warning:"orange"}})
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log', 
      format: winston.format.combine(
        winston.format.colorize({colors:{info:"blue",http:"yellow",error:"red",warning:"orange"}})
      )
    })
  ],  
});


export default logger;