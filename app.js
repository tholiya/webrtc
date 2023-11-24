if (process.version !== 'v18.18.1') {
  console.log('Node version must be v18.18.1');
  process.exit(1);
}
import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
import dBConnection from "./models/index.js";

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

const app = express();

dotenv.config();
await dBConnection();

// View engine setup
app.set('views', `${process.cwd()}/views`);
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(`${process.cwd()}/public`));
app.use('/bcss', express.static(`${process.cwd()}/node_modules/bootstrap/dist`));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/favicon.ico', function (req, res, next) {
  res.send('ok')
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
