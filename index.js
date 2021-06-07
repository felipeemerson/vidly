const express = require('express');
const app = express();

const logger = require('./startup/logger');
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

const port = process.env.PORT || 3001;
const server = app.listen(port, () => logger.info(`Listening on port ${port}...`));

module.exports = server;