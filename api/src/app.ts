import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import { Routes } from './routes';
import logger from './helpers/logger';

// Set up the express app
const app = express();

// Prevent CORS errors
app.use(cors());

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/', [Routes]);

const port = 5000;
app.listen(port, () => {
  logger.info(`API service is listening on port ${port}.`);
});
