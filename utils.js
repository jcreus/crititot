var crypto = require('crypto');
var lib = require("html-truncate"), truncate = lib.truncate;

exports.hash = function (pass) {
	return crypto.createHash('md5').update("1337_314_l33t!$"+pass).digest("hex");
};

var createBox = exports.createBox = function (row, req, msg, short) {
	var str = "";
	var d = new Date(new Date(row.marca).getTime()+60000*120);
	var s = '<div id="stars" style="margin-top:7px;">';
	for (var z=0; z<row.valoracio; z++) {
		s += '<div class="star-selected"></div>';
	}
	for (var z=0; z<(5-row.valoracio); z++) {
		s += '<div class="star-noselected"></div>';
	}
	s += '</div>';
	var m = (d.getMonth()+1);
	var contents = row.contingut.replace(/<.*?>(.*?)<\/?.*?>/gi,"$1");
	if (contents.length > 400) {
		contents = truncate(contents, 400, {ellipsis:'... <a href="/review/'+row._id+'">['+msg(getLang(req), 'box-more')+']</a>'});
	}

	str += '<div class="recind" data-id="'+row._id+'"><div class="light"><a href="/profile/'+row.user.user+'">'+row.user.pretty+'</a> '+msg(getLang(req),'box-hasrecommended')+' <a href="/film/'+row.peli._id+'"><b>'+row.peli.titol+'</b></a> '+msg(getLang(req),'box-by')+' '+row.peli["director"]+' '+msg(getLang(req),'box-when')+' '+d.getDate()+"-"+m+"-"+d.getFullYear()+'</div>'+contents+s+'</div>';
	return str;
}

function getLang(req) {
	if (req.session.object) {
		return req.session.object.config.lang;
	} else {
		return 'en';
	}
}

exports.createBoxes = function (rows, req, msg) {
	if (!rows || rows.length === 0) return msg(getLang(req), "box-noresults");
	var str = "";	
	for (var i=0; i<rows.length; i++) {
		str += createBox(rows[i], req, msg, true);
	}
	return str;
}
