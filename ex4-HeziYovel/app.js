const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');

const functions = require('./appFunctions');
const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const authRouter = require('./routes/authenticate');
const registerRouter = require('./routes/register');
const apiRouter = require('./routes/api/api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

const Sequelize = require('sequelize');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sequelize = new Sequelize({
    "dialect": "sqlite",
    "storage": "./database.sqlite3"
});

const myStore = new SequelizeStore({db: sequelize});

app.use(session({
    secret: "klogfewhj4liyeworfty4o8rvkjusghyfoegawbtgfc",
    store: myStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60,
    },
}));

myStore.sync();

app.use(/\/|\/logout/, functions.assertLogin);
app.use(/\/login|\/register|\/authenticate/, functions.assertUnsigned);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/authenticate', authRouter);
app.use('/register', registerRouter);
app.use('/api', apiRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.log(`couldn't find ${req.url}`);
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
