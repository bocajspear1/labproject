var logger = require('./server/lib/server_log');


logger.log(logger.TYPES.WARNING,"Hi There");

logger.log(logger.TYPES.WARNING,{data: "Result"});
