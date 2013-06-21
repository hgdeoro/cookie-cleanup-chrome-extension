// http://www.w3schools.com/jsref/jsref_obj_regexp.asp
var WHITE_LIST_REGEXS = [];

var INITIAL_WHITE_LIST = [ "google.com", "youtube.com" ];

var utils = {
	cleanHtml : function(tag, text) {
		/**
		 * Clean up the HTML (the UI)
		 */
		document.body.innerHTML = "";
	},

	addHtml : function(tag, text) {
		/**
		 * Add an HTML element to the UI
		 */
		var new_elem = document.createElement(tag);
		new_elem.appendChild(document.createTextNode(text));
		document.body.appendChild(new_elem);
	},

	shouldKeep : function(a_cookie) {
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
	},

	removeCookie : function(cookie) {
		/**
		 * Removes a cookie.
		 */
		console.info("Removing cookie " + cookie);
		var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain
				+ cookie.path;
		chrome.cookies.remove({
			"url" : url,
			"name" : cookie.name,
			"storeId" : cookie.storeId,
		});
	},

	populateWhiteList : function() {
		/**
		 * Populate the WHITE_LIST_REGEXS with RegExp objects from the
		 * configuration
		 */
		if (WHITE_LIST_REGEXS.length != 0)
			return;

		var white_list = JSON.parse(localStorage.getItem('white_list'));
		console.info("Loaded `white_list` = " + white_list);

		WHITE_LIST_REGEXS = white_list.map(function(wl_item) {
			var regex_item_string = '^(.*\\.|)'
					+ wl_item.split('.').join('\\.') + '$';
			return new RegExp(regex_item_string, "i");
		});
	},

	initLocalStorage : function() {
		/**
		 * Initializes local storage with default values
		 */
		if (localStorage.getItem('white_list') != null)
			return;

		console.info("Creating initial white_list...");
		localStorage.setItem('white_list', JSON.stringify(INITIAL_WHITE_LIST));
	},

};

var cookiesCleaner = {

	_preview_or_cleanup : function(do_cleanup) {
		/**
		 * Preview or cleanup the cookies.
		 * 
		 * do_cleanup == true -> CLEANUP
		 * 
		 * do_cleanup != true -> PREVIEW
		 */
		chrome.cookies.getAll({}, function(all_the_cookies) {

			/*
			 * Header
			 */

			if (do_cleanup == true) {
				console.info("Starting cleanup...");
				utils.addHtml('h2', 'Keeping...');
			} else {
				console.info("Starting preview...");
				utils.addHtml('h2', 'Will keep...');
			}
			var keeped_domains = [];
			var removed_domains = [];

			/*
			 * List cookies to keep/kept
			 */

			for ( var i = 0; i < all_the_cookies.length; i++) {
				var a_cookie = all_the_cookies[i];
				if (utils.shouldKeep(a_cookie)) {
					//
					// Keep this cookie...
					//
					if (keeped_domains.indexOf(a_cookie.domain) == -1) {
						utils.addHtml('div', "Keep: " + a_cookie.domain);
						keeped_domains.push(a_cookie.domain);
					}
				}
			}

			/*
			 * List cookies to remove/removed
			 */

			if (do_cleanup == true) {
				utils.addHtml('h2', 'Removing...');
			} else {
				utils.addHtml('h2', 'Will remove...');
			}
			for ( var i = 0; i < all_the_cookies.length; i++) {
				var a_cookie = all_the_cookies[i];
				if (!utils.shouldKeep(a_cookie)) {
					//
					// REMOVE this cookie...
					//
					if (removed_domains.indexOf(a_cookie.domain) == -1) {
						utils.addHtml('div', "Remove: " + a_cookie.domain);
						removed_domains.push(a_cookie.domain);
					}
					if (do_cleanup == true) {
						utils.removeCookie(a_cookie);
					}
				}
			}

			/*
			 * Add the footer with buttons
			 */

			if (do_cleanup == true) {
				utils.addHtml('h1', 'Cleanup DONE!');
			} else {
				// Add link to start actual removal...
				var new_elem = document.createElement('a');
				new_elem.href = '#';
				new_elem.id = 'cleanup_action';
				new_elem.appendChild(document.createTextNode('Clean up'));
				document.body.appendChild(new_elem);
				document.querySelector('#cleanup_action').addEventListener(
						'click', cookiesCleaner.cleanup);
			}
		});
	},

	preview : function() {
		/**
		 * Preview
		 */
		utils.initLocalStorage();
		utils.populateWhiteList();
		document.body.innerHTML = "";
		cookiesCleaner._preview_or_cleanup(false); // do_cleanup: false
	},

	cleanup : function() {
		/**
		 * Clean Up
		 */
		document.body.innerHTML = "";
		cookiesCleaner._preview_or_cleanup(true); // do_cleanup: true
	},

};

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function() {
	cookiesCleaner.preview();
});
