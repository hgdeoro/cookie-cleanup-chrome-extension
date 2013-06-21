// http://www.w3schools.com/jsref/jsref_obj_regexp.asp

var INITIAL_WHITE_LIST = [ "google.com", "youtube.com" ];

var WHITE_LIST_REGEXS = [];
var DOMAINS_TO_KEEP = null;
var DOMAINS_TO_REMOVE = null;
var COOKIES_TO_REMOVE = null;

var UI_UTILS = {
	cleanHtml : function() {
		/**
		 * Clean up the HTML (the UI)
		 */
		// document.body.innerHTML = "";
		var container = document.getElementById('container');
		container.innerHTML = "";
	},

	addHtml : function(tag, text) {
		/**
		 * Add an HTML element to the UI
		 */
		var new_elem = document.createElement(tag);
		new_elem.appendChild(document.createTextNode(text));
		// document.body.appendChild(new_elem);
		document.getElementById('container').appendChild(new_elem);
	},

	addItemToKeep : function(text) {
		var new_elem = document.createElement('div');
		new_elem.appendChild(document.createTextNode(text));
		new_elem.className = 'text-success';
		document.getElementById('container').appendChild(new_elem);
	},

	addItemToRemove : function(text) {
		var new_elem = document.createElement('div');
		new_elem.appendChild(document.createTextNode(text));
		new_elem.className = 'text-error';
		document.getElementById('container').appendChild(new_elem);
	},

};

function cleanDomainList(domain_list) {
	/**
	 * Return a sorted list of domains names.
	 */
	var _dict = {};
	domain_list.forEach(function(domain) {
		if (domain[0] == 'w' && domain[1] == 'w' && domain[2] == 'w')
			domain = domain.substring(3);
		if (domain[0] == '.')
			domain = domain.substring(1);
		_dict[domain] = 0;
	});
	var _list = Object.keys(_dict);
	_list.sort();
	return _list;
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

function removeCookie(cookie) {
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
	UI_UTILS.addItemToRemove(cookie.domain);
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

function initLocalStorage() {
	/**
	 * Initializes local storage with default values
	 */
	if (localStorage.getItem('white_list') != null)
		return;

	console.info("Creating initial white_list...");
	localStorage.setItem('white_list', JSON.stringify(INITIAL_WHITE_LIST));
}

function processCookies(callback) {
	/**
	 * Process the cookies, and run `callback()` when done.
	 */
	chrome.cookies.getAll({}, function(all_the_cookies) {
		var keeped_domains = [];
		var removed_domains = [];
		var cookies_to_remove = [];

		all_the_cookies.forEach(function(a_cookie) {
			if (shouldKeepCookie(a_cookie)) {
				if (keeped_domains.indexOf(a_cookie.domain) == -1)
					keeped_domains.push(a_cookie.domain);
			} else {
				if (removed_domains.indexOf(a_cookie.domain) == -1) {
					removed_domains.push(a_cookie.domain);
				}
				cookies_to_remove.push(a_cookie);
			}
		});

		DOMAINS_TO_KEEP = cleanDomainList(keeped_domains);
		DOMAINS_TO_REMOVE = cleanDomainList(removed_domains);
		COOKIES_TO_REMOVE = cookies_to_remove;

		callback();
	});
}

function remove_cookies() {
	/**
	 * Remove the cookies
	 */
	UI_UTILS.cleanHtml();
	UI_UTILS.addHtml('h1', 'Removed...');
	COOKIES_TO_REMOVE.forEach(function(a_cookie) {
		removeCookie(a_cookie);
	});
}

function show_preview() {
	/**
	 * Preview the cookies that will be kept and removed
	 */
	UI_UTILS.cleanHtml();

	console.info("Starting preview...");
	UI_UTILS.addHtml('h1', 'Will keep...');
	DOMAINS_TO_KEEP.forEach(function(item) {
		UI_UTILS.addItemToKeep(item);
	});
	UI_UTILS.addHtml('h1', 'Will remove...');
	DOMAINS_TO_REMOVE.forEach(function(item) {
		UI_UTILS.addItemToRemove(item);
	});

	// Add link to start actual removal...
	var new_elem = document.createElement('button');
	new_elem.id = 'cleanup_action';
	new_elem.type = 'button';
	new_elem.className = 'btn btn-danger btn-small';
	new_elem.appendChild(document.createTextNode('Clean up'));
	document.getElementById('container').appendChild(new_elem);
	document.querySelector('#cleanup_action').addEventListener('click',
			remove_cookies);

}

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function() {
	initLocalStorage();
	populateWhiteList();
	processCookies(show_preview);
});
