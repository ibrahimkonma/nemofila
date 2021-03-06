const compression = require('compression');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sessions = require('client-sessions');
const passport = require('passport');
const i18n = require('i18n');

//dotnev
require('dotenv').config();

// models
const User = require('./models/users');

//Routes
const index = require('./routes/index');
const search = require('./routes/search');
const newAd = require('./routes/newAd');
const events = require('./routes/events');
const detail = require('./routes/detail');
const profile = require('./routes/profile/profile');
const account = require('./routes/account');
const myAds = require('./routes/profile/myAds');
const buyPower = require('./routes/profile/buyPower');
const myFavourites = require('./routes/profile/myFavourites');
const myMessages = require('./routes/profile/myMessages');
const countries = require('./routes/countries');
const categories = require('./routes/categories');
const auth = require('./routes/auth');
const services = require('./routes/services');
const contact = require('./routes/contact');
const terms = require('./routes/terms');
const privacyPolicy = require('./routes/privacy-policy');

// Admin Routes
const manage = require('./routes/manage/index');
const general = require('./routes/manage/general');
const ads = require('./routes/manage/ads');
const eventsManage = require('./routes/manage/events');
const users = require('./routes/manage/users');
const manage_countries = require('./routes/manage/countries');
const manage_categories = require('./routes/manage/categories');
const manage_event_categories = require('./routes/manage/event-categories');
const reports = require('./routes/manage/reports');

// Mongo connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
	useMongoClient: true,
});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('view cache', process.env.VIEW_CACHE);

i18n.configure({
	locales:['en', 'es', 'tr'],
	directory: __dirname + '/locales',
	defaultLocale: 'tr',
	cookie: 'locale',
});

app.use(favicon(path.join(__dirname, '/public/img', 'logo-invert.png')));
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('i18n_localization'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use(sessions({
	secret: 'i18n_localization',
	resave: true,
	saveUninitialized: true,
	cookie: { maxAge: 60000 }
}));

app.use(i18n.init);

// Login sessions
app.use(sessions({
	cookieName: 'session',
	secret: 'asdasjdh19e1djdalsdjasdljDJALSJDLASJDLJSAdkljaslkdj',
	maxAge: 14 * 24 * 3600000, // 2 weeks
}));
app.use(passport.initialize());

// global variables
app.use((req, res, next) => {
	res.locals = {
		recaptcha_site_key: process.env.RECAPTCHA_SITE_KEY,
		locale: req.cookies.locale || 'en',
		i18n: res,
		user: req.session.user,
		amazon_base_url: process.env.AMAZON_S3_PHOTO_BASE_URL,
	};

	try{
		req.isAdmin = req.session.user.isAdmin ? true : false;
	} catch (e){
		req.isAdmin = false;
	}

	next();
});

app.use((req,res,next) => {
	if(req.session && (req.session.user || req.session.passport)){
		let findObj;
		if (req.session.user){
			findObj = { email: req.session.user.email };
		}else{
			findObj = { _id:  req.session.passport.user.doc._id };
		}
		User.findOne(findObj,(err,user) => {
			if(user){
				req.user = user;
				delete req.user.password;
				req.session.user = req.user;
				res.locals.user = req.user;
			}
			next();
		}).select({ name: 1, surname:1, _id: 1, isAdmin: true, email: 1, profilePictureUrl: 1 });
	}else{
		next();
	}
});

app.use('/manage/', manage);
app.use('/manage/general', general);
app.use('/manage/ads', ads);
app.use('/manage/events', eventsManage);
app.use('/manage/users', users);
app.use('/manage/countries', manage_countries);
app.use('/manage/categories', manage_categories);
app.use('/manage/event-categories', manage_event_categories);
app.use('/manage/reports', reports);

app.use('/', index);
app.use('/search', search);
app.use('/auth', auth);
app.use('/newAd', newAd);
app.use('/events', events);
app.use('/detail', detail);
app.use('/profile', profile);
app.use('/profile/adsMy', myAds);
app.use('/profile/buyPower', buyPower);
app.use('/profile/myFavourites', myFavourites);
app.use('/profile/myMessages', myMessages);
app.use('/account', account);
app.use('/countries', countries);
app.use('/categories', categories);
app.use('/services', services);
app.use('/contact', contact);
app.use('/termofuse', terms);
app.use('/privacy-policy', privacyPolicy);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use((err, req, res) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
