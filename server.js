Function.prototype.bind = function(scope) {
	var _function = this;
	
	return function() {
		return _function.apply(scope, arguments);
	}
}
//mongodb://nodejitsu:02d59cebadc6b9cb0586687980dc5e6d@flame.mongohq.com:27076/nodejitsudb434323713702
var LIMIT = 5;
var express = require('express');
var connect = require('connect');
var fs = require('fs');
var crypto = require('crypto');
var gzippo = require('gzippo');
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var utils = require('./utils');
var app = express.createServer();
var MongoStore = require('connect-mongo')(express);

var conn = mongoose.createConnection('mongodb://nodejitsu:02d59cebadc6b9cb0586687980dc5e6d@flame.mongohq.com:27076/nodejitsudb434323713702');
//conn.on('error', function (e) {console.log('huh',e); });

var UserModel = conn.model('UserModel', new Schema({
	user: { type: String },
	password: { type: String },
	pretty: { type: String },
	desc: { type: String },
	config: {
		lang: { type: String, default: "en" }
	}
}));

var PeliModel = conn.model('PeliModel', new Schema({
	director: { type: String },
	titol: { type: String },
	tipus: { type: String }
}));

var ReviewModel = conn.model('ReviewModel', new Schema({
	peli: { type: Schema.ObjectId, ref: 'PeliModel' },
	valoracio: { type: Number },
	contingut: { type: String },
	user: { type: Schema.ObjectId, ref: 'UserModel' },
	marca: { type: Date }
}));

var FollowModel = conn.model('FollowModel', new Schema({
	from: { type: Schema.ObjectId, ref: 'UserModel' },
	to: { type: Schema.ObjectId, ref: 'UserModel' }
}));

//conn.on('open', function (e) {ReviewModel.find().populate('user').populate('peli').run(function (err,docs) { for (var i=0; i<docs.length; i++) { docs[i].remove(); } });});

var msg = require('./i18n').msg;

function getLang(req) {
	if (req.session.object) {
		return req.session.object.config.lang;
	} else {
		return 'en';
	}
}

(function(){
	var cache = {};
 
	this.tmpl2 = function tmpl2(str, data){
		// Figure out if we're getting a template, or if we need to
		// load the template - and be sure to cache the result.
		var fn = !/\W/.test(str) ?
			cache[str] = cache[str] ||
				tmpl2(document.getElementById(str).innerHTML) :
		 
			// Generate a reusable function that will serve as a template
			// generator (and which will be cached).
			new Function("obj",
				"var p=[],print=function(){p.push.apply(p,arguments);};" +
			 
				// Introduce the data as local variables using with(){}
				"with(obj){p.push('" +
			 
				// Convert the template into pure JavaScript
				str.replace(/[\r\t\n]/g, " ") .replace(/'(?=[^%]*%>)/g,"\t") .split("'").join("\\'") .split("\t").join("'") .replace(/<%=(.+?)%>/g, "',$1,'") .split("<%").join("');") .split("%>").join("p.push('") + "');}return p.join('');");
	 
		// Provide some basic currying to the user
		return data ? fn( data ) : fn;
	};
})(); 

function tmpl(lang, temp, data) {
	return tmpl2(temp[lang], data);
}

function rep(txt, lang) {
	return txt.replace(/<<(.*?)>>/gi, function (a,b,c,d) {
		return msg(lang, b);
	});
}

function getTemplate(url) {
	var t = fs.readFileSync(url, 'utf-8');
	return {
		en: rep(t,'en'),
		ca: rep(t,'ca')
	}
}
var basic = getTemplate("basic.html"), nologin = getTemplate("nologin.html"), login = getTemplate("login.html"), profile = getTemplate("profile.html"), mainpage = getTemplate("mainpage.html"), review = getTemplate("review.html"), inbox = getTemplate("inbox.html"), film = getTemplate("film.html"), director = getTemplate("director.html"), error = getTemplate("error.html"), config = getTemplate("config.html");

//var MemoryStore = express.session.MemoryStore,
//		sessionStore = new RedisStore(//MemoryStore();

function show_bar(req, arg, arg2) {
	if (arg) {
		return tmpl(getLang(req),login, {user: arg2});
	} else {
		return nologin[getLang(req)];
	}
}

var conf = {
  db: {
    db: 'nodejitsudb578416885593',
    host: 'flame.mongohq.com',
    port: 27043,  // optional, default: 27017
    username: 'nodejitsu', // optional
    password: '013061071576af128a007beda0733536', // optional
    collection: 'sessions' // optional, default: sessions
  },
  secret: '395022070E6257624fc4Dc0a942ded26!!!!$·"$"!;.df,csa'
};

app.configure(function() {
	app.use(express.cookieParser());
	app.use(express.session({
		secret: conf.secret,
		maxAge: new Date(Date.now() + 3600000),
		store: new MongoStore(conf.db)
	}));
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
	app.use("/styles",gzippo.staticGzip(__dirname + '/styles'));
	app.use("/scripts",gzippo.staticGzip(__dirname + '/scripts'));
});

app.get('/', function(req, res){
	res.send(
	 tmpl(getLang(req),
		basic,
		{showBar:function () {
			var bar = "";
			if (!req.param("ep")) bar = show_bar(req, req.session.loggedIn,req.session.userName);
			return bar+mainpage[getLang(req)];
		}}
));
});

app.post('/create', function (req, res) {
	var user = req.body.user;
	var password = req.body.password;
	var desc = req.body.desc;
	var bonic = req.body.bonic;
	UserModel.find({user: user}, function (err, docs) {
		if (docs.length === 0) {
			var u = new UserModel;
			u.user = user;
			u.password = utils.hash(password);
			u.desc = desc;
			u.pretty = bonic;
			u.save();
			req.session.loggedIn = true;
			req.session.userName = user;
			req.session.object = u;
			res.redirect("/");
		} else {
			res.redirect("/error/2");
		}
	});
});

app.get('/error/:id', function (req, res) {
	var bar = "";
	if (!req.param("ep")) {
		bar = show_bar(req,req.session.loggedIn,req.session.userName);
	}
	var l = getLang(req);
	var tots = [msg(l,'error-1'),msg(l,'error-2'),msg(l,'error-3'),msg(l,'error-4')];
	res.send (tmpl(getLang(req),
		basic,
		{ showBar: function () { return bar+tmpl(getLang(req),error,{ctx:'<h2>'+msg(l,'error-code')+': '+req.params.id+'</h2><p>'+tots[parseInt(req.params.id)-1]+'</p>'}); }}));
});

app.get('/inbox', function (req, res) {
	if (req.session.userName) {
		FollowModel.find({from: req.session.object._id}, function (err, d) {
			var a = [];
			for (var i=0; i<d.length; i++) { a[i] = d[i].to; }
			ReviewModel.find({user: {$in: a }}).limit(LIMIT).populate('user').populate('peli').sort('marca',-1).run(function (err, docs) {
				var ctx = tmpl(getLang(req),inbox,{ctx: utils.createBoxes(docs, req, msg)});
				send_contents(req, res, ctx);
			});
		});
	} else {
		res.redirect('/error/3');
	}
});

app.get('/config', function (req, res) {
	if (req.session.userName) {
		UserModel.find({_id: req.session.object._id}, function (err, d) {
			var ctx = tmpl(getLang(req),config,{selected: function (l) {
				return this.config.lang == l ? "selected" : "";
			}.bind(d[0])});
			send_contents(req, res, ctx);
		});
	} else {
		res.redirect('/error/3');
	}
});

app.post('/newconfig', function (req, res) {
	if (!req.session.loggedIn) { res.send('notok'); return; }
	UserModel.find({_id: req.session.object._id}, function (err, d) {
		d[0].config.lang = req.body.lang;
		req.session.object.config.lang = req.body.lang;
		d[0].save();
		res.redirect(req.header('Referrer'));
	});
});

app.post('/unfollow', function (req, res) {
	if (!req.session.loggedIn) { res.send('notok'); return; }
	var user = req.body.user;
	UserModel.find({ user: user }, function (err, rows) {
		FollowModel.find({ from: req.session.object._id, to: rows[0]._id }, function (err, rows2) {
			if (rows2) {
				for (var i=0; i<rows2.length; i++) { rows2[i].remove(); }
			}
			res.send('ok');
		});
	});
});

app.post('/dofollow', function (req, res) {
	if (!req.session.loggedIn) { res.send('notok'); return; }
	var user = req.body.user;
	UserModel.find({ user: user }, function (err, rows) {
		FollowModel.find({ from: req.session.object._id, to: rows[0]._id }, function (err, rows2) {
			if (rows2) {
				for (var i=0; i<rows2.length; i++) { rows2[i].remove(); }
			}
			var f2 = new FollowModel;
			f2.from = req.session.object._id;
			f2.to = rows[0]._id;
			f2.save();
			res.send('ok');
		});
	});
});

function send_contents(req, res, ctx) {
	var bar = "";
	if (!req.param("ep")) {
		bar = show_bar(req,req.session.loggedIn,req.session.userName);
	}
	if (bar) {
		res.send(
			tmpl(getLang(req),
				basic,
				{ showBar: function () { return bar+ctx; } }
			)
		);
	} else {
		res.send(ctx);
	}
}

app.get('/more/:nom/:from', function (req, res) {
	var l = getLang(req);
	UserModel.find({user: req.params.nom}, function (err, user) {
		ReviewModel.find({user: user[0]}).sort('marca',-1).limit(LIMIT).skip(parseInt(req.params.from)).populate('user').populate('peli').run(function (err, docs) {
			var ctx = utils.createBoxes(docs, req, msg);
			res.send(ctx);
		
		});
	});
});

app.get('/moreinbox/:from', function (req, res) {
	if (req.session.userName) {
		FollowModel.find({from: req.session.object._id}, function (err, d) {
			var a = [];
			for (var i=0; i<d.length; i++) { a[i] = d[i].to; }
			ReviewModel.find({user: {$in: a }}).limit(LIMIT).skip(parseInt(req.params.from)).populate('user').populate('peli').sort('marca',-1).run(function (err, docs) {
				var ctx = utils.createBoxes(docs, req, msg);
				res.send(ctx);
			});
		});
	} else {
		res.redirect('/error/3');
	}
});

app.get('/profile/:nom', function (req, res) {
	var l = getLang(req);
	UserModel.find({user: req.params.nom}, function (err, user) {
		ReviewModel.find({user: user[0]}).limit(LIMIT).populate('user').populate('peli').sort('marca',-1).run(function (err, docs) {
			if (user.length !== 0) {
				FollowModel.find({from: user[0]}, function (err, r) { // following
					var following = r.length;
					FollowModel.find({to: user[0]}, function (err, r2) {
						var followers = r2.length;
						FollowModel.find({from: (req.session.object != undefined) ? req.session.object._id : undefined, to: user[0]}, function (err, r3) {
							var button;
							if (r3 && r3.length !== 0) {
								button = '<button data-user="'+req.params.nom+'" id="unfollow">'+msg(l,'profile-unfollow')+'</button>';
							} else {
								button = '<button data-user="'+req.params.nom+'" id="dofollow">'+msg(l,'profile-follow')+'</button>';
							}
							var ctx = tmpl(getLang(req),profile,{pretty: user[0].pretty, user: user[0].user, desc: user[0].desc, recs: utils.createBoxes(docs, req, msg), button: button, following: following, followers: followers});
							send_contents(req, res, ctx);
						});
					});
				});
			} else {
				res.redirect("/error/4");
			}
		
		});
	});
});

app.get('/review/:id', function (req, res) {
	ReviewModel.find({_id:req.params.id}).populate('user').populate('peli').run(function (err, docs) {
		if (!docs || (docs && docs.length == 0)) { send_contents(req, res, 'This review has not been found.'); return; }
		ctx = tmpl(getLang(req),review,{recs: utils.createBox(docs[0], req, msg), titol: '<a href="/film/'+docs[0].peli._id+'">'+docs[0].peli.titol+'</a>',director: docs[0].peli.director});
	
		send_contents(req, res, ctx);
	});
});

app.get('/film/:id', function (req, res) {
	PeliModel.find({_id:req.params.id}).run(function (err, p) {
		if (!p || (p && p.length == 0)) { send_contents(req, res, 'This film has not been found.'); return; }
		var peli = p[0];
		ReviewModel.find({peli: peli}).populate('user').populate('peli').sort('marca',-1).run(function (err, docs) {
			ctx = tmpl(getLang(req),film,{recs: utils.createBoxes(docs, req, msg), titol: '<a href="/film/'+peli._id+'">'+peli.titol+'</a>',director: peli.director});
	
			send_contents(req, res, ctx);
		});
	});
});

app.post('/login', function (req, res) {
	var user = req.body.user;
	var password = req.body.password;
	UserModel.find({user: user, password: utils.hash(password)}, function (err, docs) {
		if (docs.length === 0) {
			res.redirect("/error/1");
		} else {
			req.session.loggedIn = true;
			req.session.userName = user;
			req.session.object = docs[0];
			res.redirect(req.header('Referrer'));
		}
	});
	
});

app.post('/newfilm', function (req, res) {
	var titol = req.body.titol;
	var director = req.body.director;
	var rev = req.body.review;
	var tipus = req.body.tip;
	var valoracio = parseFloat(req.body.valoracio);
	PeliModel.find({titol: titol, director: director}, function (err, docs) {
		var peli;
		if (docs.length === 0) {
			peli = new PeliModel;
			peli.titol = titol;
			peli.director = director;
			peli.tipus = tipus;
			peli.save();
		} else {
			peli = docs[0];
		}
		var review = new ReviewModel;
		review.peli = peli;
		review.user = req.session.object._id;
		review.valoracio = valoracio;
		review.marca = new Date();
		review.contingut = rev;
		review.save();
		res.redirect("/review/"+review.id);
	});
});

app.get('/logout', function (req, res) {
	req.session.destroy();
	res.redirect("/");
});

app.listen(16512);

var io = require('socket.io').listen(app, {log:false});

io.sockets.on('connection', function (socket) {
	socket.on('request', function (name) {
		var title = name.my; if (title == "") { socket.emit('ajax',[]); return; }
		PeliModel.find({tipus: name.tip, titol: {$regex: new RegExp(title,"i")}}, function (err, docs) {
			if (!docs || docs.length === 0) { socket.emit('ajax',[]); }
			var arr = [];
			for (var i=0; i<docs.length; i++) {
				arr[arr.length] = {titol: docs[i].titol, director: docs[i].director};
			}
			socket.emit('ajax',arr);
		});
	});
});
