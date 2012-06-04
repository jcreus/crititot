Function.prototype.bind = function(scope) {
	var _function = this;
	
	return function() {
		return _function.apply(scope, arguments);
	}
}

var sqlite3 = require('./sqlite3/lib/sqlite3');
var express = require('express');
var fs = require('fs');
var crypto = require('crypto');
var gzippo = require('gzippo');
var app = express.createServer();

(function(){
	var cache = {};
 
	this.tmpl = function tmpl(str, data){
		// Figure out if we're getting a template, or if we need to
		// load the template - and be sure to cache the result.
		var fn = !/\W/.test(str) ?
			cache[str] = cache[str] ||
				tmpl(document.getElementById(str).innerHTML) :
		 
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

function getTemplate(url) {
	return fs.readFileSync(url, 'utf-8');
}
var basic = getTemplate("basic.html"), nologin = getTemplate("nologin.html"), login = getTemplate("login.html"), profile = getTemplate("profile.html"), mainpage = getTemplate("mainpage.html"), review = getTemplate("review.html");

var MemoryStore = express.session.MemoryStore,
		sessionStore = new MemoryStore();

function show_bar(arg, arg2) {
	if (arg) {
		return tmpl(login, {user: arg2});
	} else {
		return nologin;
	}
}
var db = new sqlite3.Database('users.sqlite');
var data = new sqlite3.Database('data.sqlite');
if (process.argv[2] == "yes") {
	db.run("CREATE TABLE users (user varchar, password varchar, pretty varchar, desc varchar)");
}
if (process.argv[3] == "yes") {
	data.run("CREATE TABLE reviews (id integer primary key, peli integer, valoracio double, contingut text, user varchar, marca timestamp)");
	data.run("CREATE TABLE pelis (id integer primary key, director varchar, titol varchar, altres varchar)");
	// (SELECT max(id) FROM autors)+1
}

app.configure(function() {
	app.use(express.cookieParser());
	app.use(express.session({ secret: "1337_314_l33t!$" }));
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
	app.use("/styles",gzippo.staticGzip(__dirname + '/styles'));
	app.use("/scripts",gzippo.staticGzip(__dirname + '/scripts'));
});

app.get('/', function(req, res){
	res.send(
	 tmpl(
		basic,
		{showBar:function () {
			var bar = "";
			if (!req.param("ep")) bar = show_bar(req.session.loggedIn,req.session.userName);
			return bar+mainpage;
		}}
));
});

app.post('/create', function (req, res) {
	var user = req.body.user;
	var password = req.body.password;
	var desc = req.body.desc;
	var bonic = req.body.bonic;
	db.all("SELECT COUNT(*) FROM users WHERE user=?",[user],function (err,rows) {
		if (rows[0]['COUNT(*)'] === 1) {
			res.redirect("/error/2");
		}
		else {
			password = crypto.createHash('md5').update("1337_314_l33t!$"+password).digest("hex");
			var query = db.prepare("INSERT INTO users VALUES (?,?,?,?)");
			query.run(user, password, bonic, desc);
			query.finalize();
			req.session.loggedIn = true;
			req.session.userName = user;
			res.redirect("/");
		}
	});
});

app.get('/error/:id', function (req, res) {
	res.send('Codi d\'error:'+req.params.id);
});

app.get('/profile/:nom', function (req, res) {
	var bar = "";
	if (!req.param("ep")) {
		bar = show_bar(req.session.loggedIn,req.session.userName);
	}
	db.all("SELECT user, pretty, desc FROM users WHERE user=?",[req.params.nom],function (err,rows) {
		var rl = rows.length;
		var u = (rows[0]) ? rows[0].user : "usuarinioinjklhjklfdsahfk313241sfdka";
		data.all("SELECT reviews.valoracio, reviews.contingut, reviews.marca, pelis.director, pelis.titol, reviews.id from reviews,pelis where pelis.id=reviews.peli and reviews.user=?",[u], function (err, r2) {
			var ctx = "Aquest usuari no existeix!";
			if (rl !== 0) {
				var str = "";
				for (var y=0; y<r2.length; y++) {
					var s = '<div id="stars" style="margin-top:7px;">';
					for (var z=0; z<r2[y].valoracio; z++) {
						s += '<div class="star-selected"></div>';
					}
					for (var z=0; z<(5-r2[y].valoracio); z++) {
						s += '<div class="star-noselected"></div>';
					}
					s += '</div>';
					str += '<div class="recind" data-id="'+r2[y].id+'"><div class="light">'+rows[0].pretty+' ha recomanat la pel·lícula <a href="/film/'+r2[y]["titol"]+'"><b>'+r2[y]["titol"]+'</b></a> de <a href="/director/'+r2[y]["director"]+'">'+r2[y]["director"]+'</a></div>'+r2[y].contingut+s+'</div>';
				}
				ctx = tmpl(profile,{pretty: rows[0].pretty, user: rows[0].user, desc: rows[0].desc, recs: str});
			}

			if(bar)res.write (tmpl(
				basic,
				{	showBar: function () { return bar+ctx; }}));
			else res.write(ctx);
			res.end();
		});
		
	});
});

app.get('/review/:id', function (req, res) {
	var bar = "";
	if (!req.param("ep")) {
		bar = show_bar(req.session.loggedIn,req.session.userName);
	}
	data.all("SELECT reviews.valoracio, reviews.contingut, reviews.marca, pelis.director, pelis.titol, reviews.id, reviews.user from reviews,pelis where pelis.id=reviews.peli and reviews.id=?",[req.params.id], function (err, r2) {
		var y = 0;
		var str = "";
		var s = '<div id="stars" style="margin-top:7px;">';
		for (var z=0; z<r2[y].valoracio; z++) {
			s += '<div class="star-selected"></div>';
		}
		for (var z=0; z<(5-r2[y].valoracio); z++) {
			s += '<div class="star-noselected"></div>';
		}
		s += '</div>';
		str += '<div class="recind" data-id="'+r2[y].id+'" style="cursor:auto;"><div class="light"><a href="/profile/'+r2[y]["user"]+'">'+r2[y]["user"]+'</a> ha recomanat la pel·lícula <b>'+r2[y]["titol"]+'</b> de '+r2[y]["director"]+'</div>'+r2[y].contingut+'</div>';
		
		ctx = tmpl(review,{recs: str, estrelles: s, titol: '<a href="/film/'+r2[y]["titol"]+'">'+r2[y]["titol"]+'</a>', director: '<a href="/director/'+r2[y]["director"]+'">'+r2[y]["director"]+'</a>'});
	

		if(bar)res.write (tmpl(
			basic,
			{	showBar: function () { return bar+ctx; }}));
		else res.write(ctx);
		res.end();
	});
});

app.post('/login', function (req, res) {
	var user = req.body.user;
	var password = req.body.password;
	password = crypto.createHash('md5').update("1337_314_l33t!$"+password).digest("hex");
	db.all("SELECT COUNT(*) FROM users WHERE user=? and password=?",[user, password],function (err,rows) {
		if (rows[0]['COUNT(*)'] === 1) {
			req.session.loggedIn = true;
			req.session.userName = user;
			res.redirect(req.header('Referrer') || "/");
		} else {
			res.redirect("/error/1");
		}
	});
	
});

app.post('/newfilm', function (req, res) {
	var titol = req.body.titol;
	var director = req.body.director;
	var review = req.body.review;
	var valoracio = parseFloat(req.body.valoracio);
	data.all("SELECT COUNT(*), id from pelis where titol=? and director=?",[titol, director], function (err,rows) {
		var id = false;
		if(rows) {
			id = rows[0]['id'];
		}
		data.serialize(function () {
			if (!id) {
				data.run("INSERT INTO pelis (director, titol, altres) values (?,?,?)",[director, titol, '{}']);
				id = "last_insert_rowid()";
			}
			data.run("INSERT INTO reviews (peli,valoracio,contingut,user,marca) values ("+id+",?,?,?,datetime('now'))",[valoracio,review,req.session.userName]);
			data.all("SELECT last_insert_rowid()",[], function (err,rows) {
				res.redirect("/review/"+rows[0]['last_insert_rowid()']);
			});
		});
	});
});

app.get('/logout', function (req, res) {
	req.session.destroy();
	res.redirect("/");
});

app.listen(16512);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
	socket.on('request', function (name) {
		var title = name.my; if (title == "") { socket.emit('ajax',[]); return; }
		data.all("SELECT titol, director from pelis where titol LIKE ?",[title+"%"], function (err,rows) {
			if (!rows) { socket.emit('ajax',[]); }
			var arr = [];
			for (var i=0; i<rows.length; i++) {
				arr[arr.length] = {titol: rows[i].titol, director: rows[i].director};
			}
			socket.emit('ajax',arr);
		});
	});
});
