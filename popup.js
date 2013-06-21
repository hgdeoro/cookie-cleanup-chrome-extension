// http://www.w3schools.com/jsref/jsref_obj_regexp.asp

/**
 * Cookies from 'white list' are NEVER deleted.
 */
var INITIAL_WHITE_LIST = [ "google.com", "youtube.com" ];

/**
 * Cookies from 'gray list' are delete with 'FULL CLEAN', but not with 'FAST
 * CLEAN'.
 */
var INITIAL_GRAY_LIST = [];

var WHITE_LIST_REGEXS = [];
var GRAY_LIST_REGEXS = [];

var WHITE_DOMAINS = null;
var GRAY_DOMAINS = null;
var BLACK_DOMAINS = null;

var WHITE_COOKIES = null;
var GRAY_COOKIES = null;
var BLACK_COOKIES = null;

var HEADER_TAG = 'h3';

var UI_UTILS = {
	cleanHtml : function() {
		/**
		 * Clean up the HTML (the UI)
		 */
		// document.body.innerHTML = "";
		var container = document.getElementById('container');
		container.innerHTML = "";
	},

	addElement : function(tag, text) {
		/**
		 * Add an HTML element to the UI
		 */
		var new_elem = document.createElement(tag);
		new_elem.appendChild(document.createTextNode(text));
		// document.body.appendChild(new_elem);
		document.getElementById('container').appendChild(new_elem);
	},

	addSmallText : function(text, className) {
		var new_elem = document.createElement('div');
		var small_elem = document.createElement('small');
		small_elem.appendChild(document.createTextNode(text));
		new_elem.appendChild(small_elem);
		new_elem.className = className;
		document.getElementById('container').appendChild(new_elem);
	},

	addItemToKeep : function(text) {
		var new_elem = document.createElement('div');
		var small_elem = document.createElement('small');
		small_elem.appendChild(document.createTextNode(text));
		new_elem.appendChild(small_elem);
		new_elem.className = 'text-success';
		document.getElementById('container').appendChild(new_elem);
	},

	addItemToRemove : function(text) {
		var new_elem = document.createElement('div');
		var small_elem = document.createElement('small');
		small_elem.appendChild(document.createTextNode(text));
		new_elem.appendChild(small_elem);
		new_elem.className = 'text-error';
		document.getElementById('container').appendChild(new_elem);
	},

	addHr : function() {
		document.getElementById('container').appendChild(
				document.createElement('hr'));
	},

	addBr : function() {
		document.getElementById('container').appendChild(
				document.createElement('br'));
	},

	addBadge : function(badge_type, text) {
		// <span class="badge badge-success">2</span>
		new_elem = document.createElement('span');
		new_elem.className = 'badge ' + badge_type;
		new_elem.appendChild(document.createTextNode(text));
		document.getElementById('container').appendChild(new_elem);
	},

};

function cleanDomain(domain) {
	if (domain[0] == 'w' && domain[1] == 'w' && domain[2] == 'w')
		domain = domain.substring(3);
	if (domain[0] == '.')
		domain = domain.substring(1);
	return domain;
}

function cleanDomainList(domain_list) {
	/**
	 * Return a sorted list of domains names.
	 */
	var _dict = {};
	domain_list.forEach(function(domain) {
		_dict[cleanDomain(domain)] = 0;
	});
	var _list = Object.keys(_dict);
	_list.sort();
	return _list;
}

var COOKIE_COLOR_WHITE = 1; // Always keep
var COOKIE_COLOR_GRAY = 2; // From gray list
var COOKIE_COLOR_BLACK = 3; // Always remove

function getCookieColor(a_cookie) {
	/**
	 * Return true|false, if the cookie should be keeped or not
	 */
	// a_cookie.name,
	// a_cookie.value,
	// a_cookie.domain;
	for ( var i = 0; i < WHITE_LIST_REGEXS.length; i++) {
		if (WHITE_LIST_REGEXS[i].test(a_cookie.domain))
			return COOKIE_COLOR_WHITE;
	}
	for ( var i = 0; i < GRAY_LIST_REGEXS.length; i++) {
		if (GRAY_LIST_REGEXS[i].test(a_cookie.domain))
			return COOKIE_COLOR_GRAY;
	}
	return COOKIE_COLOR_BLACK;
}

function shouldKeepCookie(a_cookie) {
	/**
	 * Return true|false, if the cookie should be keeped or not
	 */
	// a_cookie.name,
	// a_cookie.value,
	// a_cookie.domain;
	for ( var i = 0; i < WHITE_LIST_REGEXS.length; i++) {
		if (WHITE_LIST_REGEXS[i].test(a_cookie.domain)) {
			return true;
		}
	}
	return false;
}

function removeCookie(cookie, informed) {
	/**
	 * Removes a cookie.
	 */
	console.info("Removing cookie " + cookie);
	var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain
			+ cookie.path;
	// chrome.cookies.remove({
	// "url" : url,
	// "name" : cookie.name,
	// "storeId" : cookie.storeId,
	// });
	var cleaned_domain = cleanDomain(cookie.domain);
	if (!(informed[cleaned_domain] == 1)) {
		informed[cleaned_domain] = 1;
		UI_UTILS.addItemToRemove(cleaned_domain);
	}
}

function populateWhiteList() {
	/**
	 * Populate the WHITE_LIST_REGEXS with RegExp objects from the configuration
	 */
	if (WHITE_LIST_REGEXS.length != 0)
		return;

	var white_list = JSON.parse(localStorage.getItem('white_list'));
	console.info("Loaded `white_list` = " + white_list);

	WHITE_LIST_REGEXS = white_list.map(function(wl_item) {
		var regex_item_string = '^(.*\\.|)' + wl_item.split('.').join('\\.')
				+ '$';
		return new RegExp(regex_item_string, "i");
	});
}

function populateGrayList() {
	/**
	 * Populate the GRAY_LIST_REGEXS with RegExp objects from the configuration
	 */
	if (GRAY_LIST_REGEXS.length != 0)
		return;

	var gray_list = JSON.parse(localStorage.getItem('gray_list'));
	console.info("Loaded `gray_list` = " + gray_list);

	GRAY_LIST_REGEXS = gray_list.map(function(gl_item) {
		var regex_item_string = '^(.*\\.|)' + gl_item.split('.').join('\\.')
				+ '$';
		return new RegExp(regex_item_string, "i");
	});
}

function initLocalStorage() {
	/**
	 * Initializes local storage with default values
	 */
	if (localStorage.getItem('white_list') == null) {
		console.info("Creating initial 'white_list'...");
		localStorage.setItem('white_list', JSON.stringify(INITIAL_WHITE_LIST));
	}
	if (localStorage.getItem('gray_list') == null) {
		console.info("Creating initial 'gray_list'...");
		localStorage.setItem('gray_list', JSON.stringify(INITIAL_GRAY_LIST));
	}
}

function filterCookies(callback) {
	/**
	 * Process the cookies, and run `callback()` when done.
	 */
	chrome.cookies.getAll({}, function(all_the_cookies) {
		var white_domains = []; /* from white list */
		var gray_domains = []; /* from gray list */
		var black_domains = [];
		var white_cookies = [];
		var gray_cookies = [];
		var black_cookies = [];

		all_the_cookies.forEach(function(a_cookie) {
			var cookieColor = getCookieColor(a_cookie);
			switch (cookieColor) {

			case COOKIE_COLOR_WHITE:
				if (white_domains.indexOf(a_cookie.domain) == -1)
					white_domains.push(a_cookie.domain);
				white_cookies.push(a_cookie);
				break;

			case COOKIE_COLOR_GRAY:
				if (gray_domains.indexOf(a_cookie.domain) == -1)
					gray_domains.push(a_cookie.domain);
				gray_cookies.push(a_cookie);
				break;

			case COOKIE_COLOR_BLACK:
				if (black_domains.indexOf(a_cookie.domain) == -1)
					black_domains.push(a_cookie.domain);
				black_cookies.push(a_cookie);
				break;

			}

		});

		WHITE_DOMAINS = cleanDomainList(white_domains);
		GRAY_DOMAINS = cleanDomainList(gray_domains);
		BLACK_DOMAINS = cleanDomainList(black_domains);

		BLACK_COOKIES = black_cookies;
		GRAY_COOKIES = gray_cookies;
		WHITE_COOKIES = white_cookies;

		callback();
	});
}

function _remove_cookies(cookies_list, domain_list) {
	UI_UTILS.cleanHtml();
	UI_UTILS.addElement(HEADER_TAG, 'Removed...');
	var informed_cookies = {};
	cookies_list.forEach(function(a_cookie) {
		removeCookie(a_cookie, informed_cookies);
	});

	UI_UTILS.addHr(); // ---------- <hr> ----------

	UI_UTILS.addBadge('badge-success', 'Finished!');

	document.getElementById('container').appendChild(
			document.createTextNode(' '));

	UI_UTILS.addBadge('badge-important', 'Removed ' + cookies_list.length
			+ ' cookies from ' + domain_list.length + ' domains');
}

function quick_remove_cookies() {
	/**
	 * Remove the BLACK-LISTED cookies
	 */
	_remove_cookies(BLACK_COOKIES, BLACK_DOMAINS);
}

function full_remove_cookies() {
	/**
	 * Remove booth GRAY and BLACK-LISTED cookies
	 */
	var cookies_array = [];
	BLACK_COOKIES.forEach(function(item) {
		cookies_array.push(item);
	});
	GRAY_COOKIES.forEach(function(item) {
		cookies_array.push(item);
	});

	var domains_array = [];
	BLACK_DOMAINS.forEach(function(item) {
		domains_array.push(item);
	});
	GRAY_DOMAINS.forEach(function(item) {
		domains_array.push(item);
	});

	_remove_cookies(cookies_array, domains_array);
}

function show_preview() {
	/**
	 * Preview the cookies that will be kept and removed
	 */
	UI_UTILS.cleanHtml();

	UI_UTILS.addElement(HEADER_TAG, 'Will keep cookies for domains:');
	WHITE_DOMAINS.forEach(function(item) {
		UI_UTILS.addItemToKeep(item);
	});

	UI_UTILS.addHr(); // ---------- <hr> ----------

	UI_UTILS.addElement(HEADER_TAG, 'Gray list domains:');
	GRAY_DOMAINS.forEach(function(item) {
		UI_UTILS.addSmallText(item, 'text-warning');
	});

	UI_UTILS.addHr(); // ---------- <hr> ----------

	UI_UTILS.addElement(HEADER_TAG, 'Will remove cookies for domains:');
	BLACK_DOMAINS.forEach(function(item) {
		UI_UTILS.addItemToRemove(item);
	});

	// Add link to start actual removal...

	UI_UTILS.addHr(); // ---------- <hr> ----------

	var new_elem = document.createElement('button');
	new_elem.id = 'quick_cleanup_action';
	new_elem.type = 'button';
	new_elem.className = 'btn btn-success btn-small';
	new_elem.appendChild(document.createTextNode('Fast clean up'));
	document.getElementById('container').appendChild(new_elem);
	document.querySelector('#quick_cleanup_action').addEventListener('click',
			quick_remove_cookies);

	UI_UTILS
			.addElement('p', 'Remove cookies from black-listed domains only...');

	UI_UTILS.addHr(); // ---------- <hr> ----------

	var new_elem = document.createElement('button');
	new_elem.id = 'full_cleanup_action';
	new_elem.type = 'button';
	new_elem.className = 'btn btn-danger btn-small';
	new_elem.appendChild(document.createTextNode('FULL clean up'));
	document.getElementById('container').appendChild(new_elem);
	document.querySelector('#full_cleanup_action').addEventListener('click',
			full_remove_cookies);

	UI_UTILS.addElement('p',
			'Remove all the cookies (included that from gray-list domains)');

	UI_UTILS.addHr(); // ---------- <hr> ----------

	UI_UTILS
			.addBadge('badge-success', '' + WHITE_COOKIES.length
					+ ' cookies from ' + WHITE_DOMAINS.length
					+ ' domains will be kept');

	UI_UTILS.addBr(); // <br>

	UI_UTILS.addBadge('badge-warning', '' + GRAY_COOKIES.length
			+ ' cookies from ' + GRAY_DOMAINS.length
			+ ' domains are gray-listed');

	UI_UTILS.addBr(); // <br>

	UI_UTILS.addBadge('badge-important', '' + BLACK_COOKIES.length
			+ ' cookies from ' + BLACK_DOMAINS.length
			+ ' domains will be removed');

}

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function() {
	console.info("Will initLocalStorage()");
	initLocalStorage();
	console.info("Will populateWhiteList()");
	populateWhiteList();
	console.info("Will populateGrayList()");
	populateGrayList();
	console.info("Will filterCookies()");
	filterCookies(show_preview);
});
