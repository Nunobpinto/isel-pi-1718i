const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const hbs = require('hbs')
const bodyParser = require('body-parser')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const index = require('./routes/index')
const movies = require('./routes/movies')
const actors = require('./routes/actors')
const users = require('./routes/users')
const configurehbs = require('./service/viewService')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
configurehbs(hbs)

// uncomment after placing your favicon in /public
app.use(bodyParser.urlencoded({ extended: false }))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())

app.use('/', index)
app.use('/movie', movies)
app.use('/actor', actors)
app.use('/users', users)

// catch 404 and forward to error handler

app.use(function(req, res, next) {
	let err = new Error('Not Found')
	err.status = 404
	next(err)
})


// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})

module.exports = app

