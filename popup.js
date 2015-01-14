// http://www.w3schools.com/jsref/jsref_obj_regexp.asp

/**
 * Cookies from 'white list' are NEVER deleted.
 */
var INITIAL_WHITE_LIST = [ "google.com", "youtube.com" ];

/**
 * Cookies from 'gray list' are delete with 'FULL CLEAN', but not with 'QUICK
 * CLEAN'.
 */
var INITIAL_GRAY_LIST = [];

/*
 * Global variables
 */
var WHITE_LIST_REGEXS = [];
var GRAY_LIST_REGEXS = [];

var WHITE_DOMAINS = null;
var GRAY_DOMAINS = null;
var BLACK_DOMAINS = null;

var WHITE_COOKIES = null;
var GRAY_COOKIES = null;
var BLACK_COOKIES = null;

var COMPACT = true;
var DRY_RUN = true;

function reset() {
	WHITE_LIST_REGEXS = [];
	GRAY_LIST_REGEXS = [];
	WHITE_DOMAINS = null;
	GRAY_DOMAINS = null;
	BLACK_DOMAINS = null;
	WHITE_COOKIES = null;
	GRAY_COOKIES = null;
	BLACK_COOKIES = null;
	COMPACT = true;
	DRY_RUN = true;
}

/*
 * Constants and utilities
 */

var HEADER_TAG = 'h4';

var COOKIE_COLOR_WHITE = 1; // Always keep
var COOKIE_COLOR_GRAY = 2; // From gray list
var COOKIE_COLOR_BLACK = 3; // Always remove

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

	addItemFromWhiteList : function(text) {
		// Green
		if (COMPACT) {
			var label_elem = document.createElement('span');
			label_elem.appendChild(document.createTextNode(text));
			label_elem.className = 'label label-success';
			document.getElementById('container').appendChild(label_elem);
			document.getElementById('container').appendChild(
					document.createTextNode(' '));
		} else {
			var new_elem = document.createElement('div');
			var small_elem = document.createElement('small');
			small_elem.appendChild(document.createTextNode(text));
			new_elem.appendChild(small_elem);
			new_elem.className = 'text-success';
			document.getElementById('container').appendChild(new_elem);
		}
	},

	addItemFromBlackList : function(text) {
		// Red
		if (COMPACT) {
			var label_elem = document.createElement('span');
			label_elem.appendChild(document.createTextNode(text));
			label_elem.className = 'label label-important';
			document.getElementById('container').appendChild(label_elem);
			document.getElementById('container').appendChild(
					document.createTextNode(' '));
		} else {
			var new_elem = document.createElement('div');
			var small_elem = document.createElement('small');
			small_elem.appendChild(document.createTextNode(text));
			new_elem.appendChild(small_elem);
			new_elem.className = 'text-error';
			document.getElementById('container').appendChild(new_elem);
		}
	},

	addItemFromGreyList : function(text) {
		// Gray
		if (COMPACT) {
			var label_elem = document.createElement('span');
			label_elem.appendChild(document.createTextNode(text));
			label_elem.className = 'label';
			document.getElementById('container').appendChild(label_elem);
			document.getElementById('container').appendChild(
					document.createTextNode(' '));
		} else {
			var new_elem = document.createElement('div');
			var small_elem = document.createElement('small');
			small_elem.appendChild(document.createTextNode(text));
			new_elem.appendChild(small_elem);
			new_elem.className = 'muted';
			document.getElementById('container').appendChild(new_elem);
		}
	},

	addRemovedItem : function(text) {
		// Blue
		if (COMPACT) {
			var label_elem = document.createElement('span');
			label_elem.appendChild(document.createTextNode(text));
			label_elem.className = 'label label-info';
			document.getElementById('container').appendChild(label_elem);
			document.getElementById('container').appendChild(
					document.createTextNode(' '));
		} else {
			var new_elem = document.createElement('div');
			var small_elem = document.createElement('small');
			small_elem.appendChild(document.createTextNode(text));
			new_elem.appendChild(small_elem);
			new_elem.className = 'text-info';
			document.getElementById('container').appendChild(new_elem);
		}
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

	addBadgeAndText : function(badge_type, badge_text, text) {
		// <span class="badge badge-success">2</span>
		var badge_elem = document.createElement('span');
		badge_elem.className = 'badge ' + badge_type;
		badge_elem.appendChild(document.createTextNode(badge_text));

		var outer_elem = document.createElement('small');
		outer_elem.appendChild(badge_elem);
		outer_elem.appendChild(document.createTextNode(text));

		document.getElementById('container').appendChild(outer_elem);
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

function removeCookie(cookie, informed) {
	/**
	 * Removes a cookie.
	 */
	console.info("Removing cookie " + cookie);
	var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain
			+ cookie.path;
	if (!DRY_RUN) {
		chrome.cookies.remove({
			"url" : url,
			"name" : cookie.name,
			"storeId" : cookie.storeId,
		});
	}
	var cleaned_domain = cleanDomain(cookie.domain);
	if (!(informed[cleaned_domain] == 1)) {
		informed[cleaned_domain] = 1;
		UI_UTILS.addRemovedItem(cleaned_domain);
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

function populateSettings() {
	/**
	 * Populate settings from localStorage (except white/gray list).
	 */
	COMPACT = JSON.parse(localStorage.getItem('compact_mode'));
	DRY_RUN = JSON.parse(localStorage.getItem('dry_run'));
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
	if (localStorage.getItem('compact_mode') == null) {
		console.info("Creating initial 'compact_mode'...");
		localStorage.setItem('compact_mode', JSON.stringify(false));
	}
	if (localStorage.getItem('dry_run') == null) {
		console.info("Creating initial 'dry_run'...");
		localStorage.setItem('dry_run', JSON.stringify(false));
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

	console.info("show_preview()");

	/**
	 * Preview the cookies that will be kept and removed
	 */

	UI_UTILS.cleanHtml();

	/*
	 * Show cookies from white/gray/black list.
	 */

	UI_UTILS.addElement(HEADER_TAG, 'Trusted cookies (from white list)');
	UI_UTILS.addSmallText('These cookies are never removed.', '');
	WHITE_DOMAINS.forEach(function(item) {
		UI_UTILS.addItemFromWhiteList(item);
	});

	UI_UTILS.addHr(); // ---------- <hr> ----------

	UI_UTILS.addElement(HEADER_TAG, 'Cookies from gray list:');
	UI_UTILS.addSmallText(
			"These cookies are removed when using 'Full Cleanup'.", '');
	GRAY_DOMAINS.forEach(function(item) {
		UI_UTILS.addItemFromGreyList(item);
	});

	UI_UTILS.addHr(); // ---------- <hr> ----------

	UI_UTILS.addElement(HEADER_TAG, 'Untrusted cookies:');
	UI_UTILS.addSmallText("These cookies are always removed, "
			+ "when using 'Quick Cleanup' or 'Full Cleanup'.", '');
	BLACK_DOMAINS.forEach(function(item) {
		UI_UTILS.addItemFromBlackList(item);
	});

	UI_UTILS.addHr(); // ---------- <hr> ----------

	/*
	 * QUICK cleanup
	 */

	var new_elem = document.createElement('button');
	new_elem.id = 'quick_cleanup_action';
	new_elem.type = 'button';
	new_elem.className = 'btn btn-primary btn-small';
	new_elem.appendChild(document.createTextNode('Quick clean up'));
	document.getElementById('container').appendChild(new_elem);
	document.querySelector('#quick_cleanup_action').addEventListener('click',
			quick_remove_cookies);

	UI_UTILS.addElement('span', ' ');

	UI_UTILS.addElement('small', "Remove UNTRUSTED cookies only.");

	UI_UTILS.addBr(); // <br>

	UI_UTILS.addBadgeAndText('badge-success', "" + WHITE_COOKIES.length,
			" cookies from " + WHITE_DOMAINS.length
			+ " TRUSTED domains won't be removed.");

	UI_UTILS.addBr(); // <br>

	UI_UTILS.addBadgeAndText('badge-important', "" + BLACK_COOKIES.length,
			' cookies from ' + BLACK_DOMAINS.length
			+ ' domains from BLACK LIST will be removed.');

	UI_UTILS.addHr(); // ---------- <hr> ----------

	/*
	 * FULL cleanup
	 */

	var new_elem = document.createElement('button');
	new_elem.id = 'full_cleanup_action';
	new_elem.type = 'button';
	new_elem.className = 'btn btn-danger btn-small';
	new_elem.appendChild(document.createTextNode('FULL cleanup'));
	document.getElementById('container').appendChild(new_elem);
	document.querySelector('#full_cleanup_action').addEventListener('click',
			full_remove_cookies);

	UI_UTILS.addElement('span', ' ');

	UI_UTILS.addElement('small', "Remove UNTRUSTED and GRAY LIST cookies.");

	UI_UTILS.addBr(); // <br>

	UI_UTILS.addBadgeAndText('badge-success', "" + WHITE_COOKIES.length,
			" cookies from " + WHITE_DOMAINS.length
			+ " TRUSTED domains won't be removed.");

	UI_UTILS.addBr(); // <br>

	UI_UTILS.addBadgeAndText('', '' + GRAY_COOKIES.length,
			' cookies from ' + GRAY_DOMAINS.length +
			' domains from GRAY LIST will be removed.');

	UI_UTILS.addBr(); // <br>

	UI_UTILS.addBadgeAndText('badge-important', '' + BLACK_COOKIES.length,
			' cookies from ' + BLACK_DOMAINS.length
			+ ' UNTRUSTED domains  will be removed.');

	UI_UTILS.addHr(); // ---------- <hr> ----------

	var new_elem = document.createElement('button');
	new_elem.id = 'show_settings_action';
	new_elem.type = 'button';
	new_elem.className = 'btn btn-small';
	new_elem.appendChild(document.createTextNode('Settings...'));
	document.getElementById('container').appendChild(new_elem);
	document.querySelector('#show_settings_action').addEventListener('click',
			show_settings);

	UI_UTILS.addHr(); // ---------- <hr> ----------

}

/*
 * ----------
 */

function load_settings_items(localStorageKey, htmlContainerId, inputClassName) {
	console.info("load_settings_items(" + localStorageKey + ")");
	document.getElementById(htmlContainerId).innerHTML = '';
	console.info(" + JSON: " + localStorage.getItem(localStorageKey));
	var white_list = JSON.parse(localStorage.getItem(localStorageKey));
	white_list.forEach(function(item) {
		console.info(" + item: " + item);
		var textBox = document.createElement('input');
		textBox.type = "text";
		// textBox.setAttribute("value", item);
		textBox.value = item;
		textBox.className = inputClassName;
		document.getElementById(htmlContainerId).appendChild(textBox);
		document.getElementById(htmlContainerId).appendChild(
				document.createElement('br'));
	});
}

function save_settings_items(localStorageKey, inputClassName) {
	console.info("save_settings_items(" + localStorageKey + ")");
	var input_list = Array.prototype.slice.call(document
			.getElementsByClassName(inputClassName));
	var values = input_list.map(function(item) {
		return item.value.trim();
	});
	values = values.filter(function(val) {
		return val.length > 0;
	});
	var json_value = JSON.stringify(values);
	console.info("JSON to save: '" + localStorageKey + "' -> '" + json_value
			+ "'");
	localStorage.setItem(localStorageKey, json_value);
}

function load_settings_boolean(localStorageKey, checkboxId) {
	console.info("load_settings_boolean(" + localStorageKey + ")");
	var value = JSON.parse(localStorage.getItem(localStorageKey));
	console.info(" + loaded value: " + value);
	if (value == true) {
		document.getElementById(checkboxId).checked = true;
	} else {
		document.getElementById(checkboxId).checked = false;
	}
}

function save_settings_boolean(localStorageKey, checkboxId) {
	console.info("save_settings_boolean(" + localStorageKey + ")");
	var value = document.getElementById(checkboxId).checked;
	console.info(" + value to save: " + value);
	if (value == true)
		localStorage.setItem(localStorageKey, JSON.stringify(true));
	else
		localStorage.setItem(localStorageKey, JSON.stringify(false));
}

function show_settings() {
	console.info("show_settings()");

	document.getElementById('container').className = 'container hidden';
	document.getElementById('config').className = 'container';

	load_settings_items('white_list', 'white_list_domains',
			'input_white_list_item');

	load_settings_items('gray_list', 'gray_list_domains',
			'input_gray_list_item');

	load_settings_boolean('compact_mode', 'checkbox_compact_mode');
	load_settings_boolean('dry_run', 'checkbox_dry_run');
}

function save_settings() {
	save_settings_items('white_list', 'input_white_list_item');
	save_settings_items('gray_list', 'input_gray_list_item');
	save_settings_boolean('compact_mode', 'checkbox_compact_mode');
	save_settings_boolean('dry_run', 'checkbox_dry_run');

	/*
	 * set UI
	 */
	reset();
	UI_UTILS.cleanHtml();
	document.getElementById('container').className = 'container';
	document.getElementById('config').className = 'container hidden';
	main();
}

function add_empty_trusted_domain_textbox() {
	var htmlContainerId = 'white_list_domains';
	var inputClassName = 'input_white_list_item';
	var textBox = document.createElement('input');
	textBox.type = "text";
	textBox.value = '';
	textBox.className = inputClassName;
	document.getElementById(htmlContainerId).appendChild(textBox);
	document.getElementById(htmlContainerId).appendChild(
			document.createElement('br'));
}

function add_empty_grey_domain_textbox() {
	var htmlContainerId = 'gray_list_domains';
	var inputClassName = 'input_gray_list_item';
	var textBox = document.createElement('input');
	textBox.type = "text";
	textBox.value = '';
	textBox.className = inputClassName;
	document.getElementById(htmlContainerId).appendChild(textBox);
	document.getElementById(htmlContainerId).appendChild(
			document.createElement('br'));
}

function main() {
	console.info("Will initLocalStorage()");
	initLocalStorage();
	console.info("Will populateWhiteList()");
	populateWhiteList();
	console.info("Will populateGrayList()");
	populateGrayList();
	console.info("Will populateSettings()");
	populateSettings();
	console.info("Will filterCookies()");
	filterCookies(show_preview);
}

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function() {
	// Add event listeners
	document.getElementById('settings_save_action').addEventListener('click',
			save_settings);

	document.getElementById('add_new_trusted_domain_action').addEventListener(
			'click', add_empty_trusted_domain_textbox);

	document.getElementById('add_new_gray_domain_action').addEventListener(
			'click', add_empty_grey_domain_textbox);

	window.setTimeout(main, 5);
});
