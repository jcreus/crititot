Function.prototype.bind = function(scope) {
	var _function = this;
	
	return function() {
		return _function.apply(scope, arguments);
	}
}

var LIMIT = 5;

critiques = {};

critiques.toggleLogin = function (p) {
	var a = document.getElementsByClassName('box');
	for (var i=0; i<a.length; i++) {
		if (a[i].id != p) $(a[i]).slideUp();
		else $(a[i]).slideToggle();
	}
}
critiques.rem = function (el) {
	el.parentNode.getElementsByTagName("span")[0].style.display = 'none';
	el.parentNode.getElementsByTagName("input")[0].focus();
}
critiques.check = function (el) {
	if (el.value == "") {
		el.parentNode.getElementsByTagName("span")[0].style.display = 'inline';
	}
}
critiques.current = 0;
critiques.loadprofile = function (is) {
	critiques.current = 0;
	$(".recind").live('click', function (e) {
		if (e.target.nodeName.toLowerCase() != "a" && e.target.parentNode.nodeName.toLowerCase() != "a") {
			e.preventDefault();
			if (history.pushState) {
				critiques.loadpage('/review/'+this.getAttribute("data-id"));
				history.pushState({url: '/review/'+this.getAttribute("data-id")},'/review/'+this.getAttribute("data-id"), '/review/'+this.getAttribute("data-id"));
			} else {
				location.href = '/review/'+this.getAttribute("data-id");
			}
			return false;
		}
	});
	if ($(".recind").length != LIMIT) {
		$("#bmore").hide();
	}
	if (!is) return;
	$("#dofollow").click( function () {
		var page = location.pathname;
		$.post("/dofollow", {user:$(this).attr("data-user")}, function (data) {
			if (data == "notok") { alert('Si us plau, entra al compte!'); return; }
			if (history.pushState) critiques.loadpage(page);
			else location.pathname = page;
		});
	});
	$("#unfollow").click( function () {
		var page = location.pathname;
		$.post("/unfollow", {user:$(this).attr("data-user")}, function (data) {
			if (data == "notok") { alert('Si us plau, entra al compte!'); return; }
			else { 
				if (history.pushState) critiques.loadpage(page);
				else location.pathname = page;
			}
		});
	});
}
critiques.load = function () {
	/*var tots = document.getElementsByClassName("combose");
	for (var i=0; i<tots.length; i++) {
		tots[i].onclick = function (ev) {
			this.parentNode.getElementsByClassName("combohi")[0].style.display = (this.parentNode.getElementsByClassName("combohi")[0].style.display == 'block') ? 'none' : 'block';
		}.bind(tots[i]);
	}*/
	var el = document.getElementById("filmtitle");
	if (el) {
		el.onkeyup = function () {
			socket.emit('request',{my:this.value, tip:$('input:radio[name=tip]:checked').val()});
		};
		document.getElementsByClassName("bottom")[0].onclick = function () {
			this.parentNode.style.display = 'none';
		};
		var stars = document.getElementById("stars").getElementsByTagName("div");
		for (var i=0; i<stars.length; i++) {
			stars[i].onclick = function () {
				var stars = document.getElementById("stars").getElementsByTagName("div");
				var mode = "selected"
				for (var y=0; y<stars.length; y++) {
					stars[y].className = "star-"+mode;
					if (stars[y] == this) {
						document.getElementById("valoracio").value = (y+1);
						mode = "noselected";
					}
				}
			};
		}
	}
	if (location.pathname.indexOf("/profile") === 0) critiques.loadprofile(true);
	if (location.pathname.indexOf("/inbox") === 0) critiques.loadprofile();
	if (location.pathname.indexOf("/director") === 0) critiques.loadprofile();
	if (location.pathname.indexOf("/film") === 0) critiques.loadprofile();
	if (history.pushState) critiques.enllacos();
	$("#bmore").live('click', function (e) {
		critiques.current += LIMIT;
		$.get($(this).attr("data-path")+"/"+critiques.current, function (t) {
			var $m = $(t);
			var keep = false;
			if ($m.length == LIMIT) {
				keep = true;
			}
			$(".recs").append($m);
			if (!keep) { $("#bmore").fadeOut(); }
		});
	});
}
critiques.clearChildren = function (a) {
	if (a.hasChildNodes()) {
		while (a.childNodes.length >= 1) {
			a.removeChild(a.firstChild);			 
		} 
	}
}

critiques.xhr = new XMLHttpRequest();

critiques.loadpage = function (u,p) {
	critiques.xhr.onreadystatechange = function () {
		if (critiques.xhr.readyState == 4 && critiques.xhr.status == 200) {
			document.getElementById("realcontent").innerHTML = critiques.xhr.responseText;
			if (u.indexOf("/profile") === 0) critiques.loadprofile(true);
			if (u.indexOf("/inbox") === 0) critiques.loadprofile();
			if (u.indexOf("/director") === 0) critiques.loadprofile();
			if (u.indexOf("/film") === 0) critiques.loadprofile();
		}
	};
	critiques.xhr.open("GET", u+"?ep=yes", true);
	critiques.xhr.send(null);
}

critiques.initial = location.pathname;

critiques.enllacos = function () {
	$("a").live('click', function (e) {
		if (this.getAttribute("href") == "/logout") return;
		e.preventDefault();
		critiques.loadpage($(this).attr("href"));
		history.pushState({url: $(this).attr("href")},$(this).attr("href"), $(this).attr("href"));
		var a = document.getElementsByClassName('box');
		$(a).slideUp();
		return false;
	});
	window.onpopstate = function (e) {
		if (e.state) critiques.loadpage(e.state.url);
		else critiques.loadpage(critiques.initial);
	};
}

var socket = io.connect(location.protocol+'//'+location.host);
socket.on('ajax', function (data) {
	var el = document.getElementById("_filmsuggest");
	critiques.clearChildren(el);
	for (var i=0; i<data.length; i++) {
		var a = document.createElement("div");
		a.className = "suggested";
		a.setAttribute("data-director",data[i].director);
		a.setAttribute("data-titol",data[i].titol);
		a.onclick = function () {
			var director = this.getAttribute("data-director"), titol = this.getAttribute("data-titol");
			document.getElementById("filmdirector").value = director;
			document.getElementById("filmtitle").value = titol;
			document.getElementById("filmsuggest").style.display = 'none';
		};
		a.appendChild(document.createTextNode(data[i].titol));
		el.appendChild(a);
	}
	var el = document.getElementById("filmsuggest");
	if (data.length == 0) {
		el.style.display='none';
	} else {
		el.style.display='block';
	}
});
window.onload = critiques.load;
