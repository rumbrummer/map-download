// Download kurviger maps - 2nd step

var cookie_list = new GetCookieList(); // global list of cookies

function GetCookieList() {
	var doc_cookie = document.cookie, cookie_equs, cookie_equ, name, value, i;
	
	if (!doc_cookie) {
		return;
	}
	cookie_equs = doc_cookie.split(';');
	
	for ( i = 0; i < cookie_equs.length; i++) {
		cookie_equ = cookie_equs[i].split('=');
		name = cookie_equ[0];
		value = cookie_equ[1];
		while (name.charAt(0)==' ') { 
			name = name.substring(1,name.length);
		}
		this[name] = value;
	}
}

function setCookie( name, value, duration ) {
	var d = new Date(), timeout, cookie_txt, domain;
	if (typeof duration == 'undefined') { 
		duration = 365;
	}
	
	// domain = '.xyz.abc.de';
	domain = window.location.hostname;
	if( domain.slice(0,4) == 'www.' ) {
		domain = domain.slice(3);
	} else {
		domain = '.' + domain;
	}
	
	timeout = new Date(d.getTime() + 1000 * 60 * 60 * 24 * duration);
	cookie_txt = name + "=" + value + "; expires=" + timeout.toGMTString() + 
	"; domain=" + domain + "; path=/";
	
	document.cookie = cookie_txt;
	if( typeof cookie_list != 'undefined' ) {
		if (duration > 0) {
			cookie_list[name] = value;
		} else {
			if( typeof cookie_list[name] != 'undefined' ) {
				delete(cookie_list[name]); 
			}
		}
	}
}

function getCookie(cName) {
	var doc_cookie = document.cookie, cookie_equs = doc_cookie.split(";"), cookie_equ, i, name;
	
	if (!doc_cookie) {
		return '';
	}
	
	for ( i = 0; i < cookie_equs.length; i++) {
		cookie_equ = cookie_equs[i].split("=");
		name = cookie_equ[0];
		while (name.charAt(0)==' ') { 
			name = name.slice(1);
		}
		
		if(cName == name) {
			return cookie_equ[1]; //cookie found -> return it
		}
	}
	return ''; //cookie not found -> return empty string
}


function updateCookie( name, duration ) {
	if( cookieExist( name ) ) {
		setCookie( name, getCookie(name), duration );
	}
}

function delCookie( name ) {
	setCookie( name, '', 0 );
}

function cookieExist(name) {
	return ( getCookie(name).length > 0 );
}

function cookieSwi(name, lv_default) {
	if ( cookieExist(name) ) {
		return ( getCookie(name) == true || getCookie(name) == 'true'); // not 'true', because falsen when cookie = 1
	} else {
		if(  typeof lv_default != 'undefined' ) {
			return lv_default; 
		} else {
			return false;
		}
	}
}