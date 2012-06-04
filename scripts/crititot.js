Function.prototype.bind = function(scope) {
	var _function = this;
	
	return function() {
		return _function.apply(scope, arguments);
	}
}

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

critiques.loadprofile = function () {
	var all = document.getElementsByClassName("recind");
	for (var i=0; i<all.length; i++) {
		all[i].onclick = function (e) {
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
		}
	}
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
			socket.emit('request',{my:this.value});
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
    if (location.pathname.indexOf("/profile") === 0) critiques.loadprofile();
    if (history.pushState) critiques.enllacos();
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
			if (u.indexOf("/profile") === 0) critiques.loadprofile();
		}
	};
	critiques.xhr.open("GET", u+"?ep=yes", true);
	critiques.xhr.send(null);
}

critiques.initial = location.pathname;

critiques.enllacos = function () {
	var all = document.getElementsByTagName("a");
	for (var i=0; i<all.length; i++) {
		all[i].addEventListener('click', function (e) {
			if (this.getAttribute("href") == "/logout") return;
			e.preventDefault();
			critiques.loadpage(this.getAttribute("href"));
			history.pushState({url: this.getAttribute("href")},this.getAttribute("href"), this.getAttribute("href"));
			var a = document.getElementsByClassName('box');
			$(a).slideUp();
			return false;
		});
	}
	window.onpopstate = function (e) {
		if (e.state) critiques.loadpage(e.state.url);
		else critiques.loadpage(critiques.initial);
	};
}

var socket = io.connect('http://portatil-acer:8888');
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
