// http://www.w3schools.com/jsref/jsref_obj_regexp.asp
var WHITE_LIST_REGEXS = [
// Google & co
new RegExp("^(.*\\.|)google\\.com$", "i"),
		new RegExp("^(.*\\.|)youtube\\.com$", "i"), ];

var utils = {
	addHtml : function(tag, text) {
		var new_elem = document.createElement(tag);
		new_elem.appendChild(document.createTextNode(text));
		document.body.appendChild(new_elem);
	},

	shouldKeep : function(a_cookie) {
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
		console.info("Removing cookie " + cookie);
		var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain
				+ cookie.path;
		chrome.cookies.remove({
			"url" : url,
			"name" : cookie.name,
			"storeId" : cookie.storeId,
		});
	},

};

var cookiesCleaner = {

	preview : function(do_cleanup) {
		//
		// do_cleanup == true -> do the cleanup
		// do_cleanup != true -> preview
		//
		if (localStorage.getItem('white_list') == null) {
			localStorage.setItem('white_list', JSON.stringify([ 'google.com',
					'youtube.com' ]));
		}
		chrome.cookies.getAll({}, function(all_the_cookies) {
			utils.addHtml('p', JSON.parse(localStorage.getItem('white_list')));
			if (do_cleanup == true) {
				console.info("Starting cleanup...");
				utils.addHtml('h2', 'Keeping...');
			} else {
				console.info("Starting preview...");
				utils.addHtml('h2', 'Will keep...');
			}
			var keeped_domains = [];
			var removed_domains = [];

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

	cleanup : function() {
		document.body.innerHTML = "";
		cookiesCleaner.preview(true);
	},

};

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function() {
	cookiesCleaner.preview(false);
});
