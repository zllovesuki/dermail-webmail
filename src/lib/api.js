var config = require('../../config.js');
var VERSION = '/v' + config.apiVersion;
var API_ROOT = config.apiEndpoint;
var API_ENDPOINT = API_ROOT + VERSION;
var LOGIN_ENDPOINT = API_ENDPOINT + '/login'
var PING_ENDPOINT = API_ENDPOINT + '/read/ping'
var S3_ENDPOINT = API_ENDPOINT + '/read/s3'
var GETACCOUNTS_ENDPOINT = API_ENDPOINT + '/read/getAccounts'
var GETACCOUNT_ENDPOINT = API_ENDPOINT + '/read/getAccount'
var GETFOLDERS_ENDPOINT = API_ENDPOINT + '/read/getFoldersInAccount'
var GETFOLDER_ENDPOINT = API_ENDPOINT + '/read/getFolder'
var GETMAILSINFOLDER_ENDPOINT = API_ENDPOINT + '/read/getMailsInFolder'
var GETMAIL_ENDPOINT = API_ENDPOINT + '/read/getMail'
var GETADDRESS_ENDPOINT = API_ENDPOINT + '/read/getAddress'
var GETFILTERS_ENDPOINT = API_ENDPOINT + '/read/getFilters'
var SEARCHWITHFILTER_ENDPOINT = API_ENDPOINT + '/read/searchWithFilter'
var SEARCHMAILSINACCOUNT_ENDPOINT = API_ENDPOINT + '/read/searchMailsInAccount'
var MODIFYFILTER_ENDPOINT = API_ENDPOINT + '/write/modifyFilter'
var UPDATEMAIL_ENDPOINT = API_ENDPOINT + '/write/updateMail'
var UPDATEFOLDER_ENDPOINT = API_ENDPOINT + '/write/updateFolder'
var PUSHSUB_ENDPOINT = API_ENDPOINT + '/write/pushSubscriptions'
var SENDMAIL_ENDPOINT = API_ENDPOINT + '/relay/sendMail'
var UPLOADS3STREAM_ENDPOINT = API_ENDPOINT + '/upload/s3Stream'

var queue = require('./socket.js');

module.exports = {


	getRoot: function() {
		return API_ROOT;
	},
	getEndpoint: function() {
		return API_ENDPOINT
	},

	ping: function(ct) {
		return ct.$http.get(PING_ENDPOINT, {}, {
			headers: ct.st.getHeader()
		})
	},
	s3: function(ct) {
		return ct.$http.get(S3_ENDPOINT, {}, {
			headers: ct.st.getHeader()
		})
	},
	getAccounts: function(ct) {
		return ct.$http.get(GETACCOUNTS_ENDPOINT, {}, {
			headers: ct.st.getHeader()
		})
	},
	login: function(ct, data) {
		return ct.$http.post(LOGIN_ENDPOINT, data);
	},
	getAccount: function(ct) {
		return ct.$http.post(GETACCOUNT_ENDPOINT, ct.$route.params, {
			headers: ct.st.getHeader()
		})
	},
	getFoldersInAccount: function(ct) {
		return ct.$http.post(GETFOLDERS_ENDPOINT, ct.$route.params, {
			headers: ct.st.getHeader()
		})
	},
	getFolder: function(ct) {
		return ct.$http.post(GETFOLDER_ENDPOINT, ct.$route.params, {
			headers: ct.st.getHeader()
		})
	},
	getMailsInFolder: function(ct, additional) {
		var data = Object.assign(ct.$route.params, additional)
		return ct.$http.post(GETMAILSINFOLDER_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	getMail: function(ct) {
		return ct.$http.post(GETMAIL_ENDPOINT, ct.$route.params, {
			headers: ct.st.getHeader()
		})
	},
	getAddress: function(ct, data) {
		return ct.$http.post(GETADDRESS_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	getFilters: function(ct) {
		return ct.$http.post(GETFILTERS_ENDPOINT, ct.$route.params, {
			headers: ct.st.getHeader()
		})
	},
	modifyFilter: function(ct, data) {
		return ct.$http.post(MODIFYFILTER_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	searchWithFilter: function(ct, data) {
		return ct.$http.post(SEARCHWITHFILTER_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	searchMailsInAccount: function(ct, data) {
		return ct.$http.post(SEARCHMAILSINACCOUNT_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	updateMail: function(ct, data) {
		return ct.$http.post(UPDATEMAIL_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	updateFolder: function(ct, data) {
		return ct.$http.post(UPDATEFOLDER_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	sendMail: function(ct, data) {
		return ct.$http.post(SENDMAIL_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	UploadS3Stream: function(ct, data) {
		return ct.$http.post(UPLOADS3STREAM_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},
	pushNotification: function(ct, data) {
		return ct.$http.post(PUSHSUB_ENDPOINT, data, {
			headers: ct.st.getHeader()
		})
	},

	queue: function() {
		return queue;
	},

	grabFilters: function(ct) {
		this.getFilters(ct).then(function(res) {
			ct.st.putFilters(res.data);
			ct.st.loading.go(100);
		}, function(res) {
			if (res.data.hasOwnProperty('message')) {
				ct.st.alert.error(res.data.message);
			}
			ct.st.loading.go(100);
		});
	},

	grabDependencies: function(priority, ct, cb) {
		switch(priority) {
			case 3: //mail.vue
			this.getMail(ct).then(function(res) {
				ct.st.putMail(res.data);
				if (cb && priority === 3) {
					cb(res.data);
				}
			}, function(res) {
				if (res.data.hasOwnProperty('message')) {
					ct.st.alert.error(res.data.message);
				}else{
					ct.st.alert.error(res.statusText);
				}
			});
			case 2: //folder.vue
			this.getFolder(ct).then(function(res) {
				ct.st.putFolder(res.data);
				if (cb && priority === 2) {
					cb(res.data);
				}
			}, function(res) {
				if (res.data.hasOwnProperty('message')) {
					ct.st.alert.error(res.data.message);
				}else{
					ct.st.alert.error(res.statusText);
				}
			});
			case 1: //account.vue
			if (Object.keys(ct.st.account).length === 0 || priority === 1) {
				this.getAccount(ct).then(function(res) {
					res.data.displayName = res.data['account'] + '@' + res.data['domain'];
					ct.st.putAccount(res.data);
					if (cb && priority === 1) {
						cb(res.data);
					}
				}, function(res) {
					if (res.data.hasOwnProperty('message')) {
						ct.st.alert.error(res.data.message);
					}else{
						ct.st.alert.error(res.statusText);
					}
				});
			}
		}
	},
	inlineImage: function(src) {
		return API_ENDPOINT + '/safe/inline/?s=' + this.Base64.encode(src);
	},
	safeImage: function(src) {
		return API_ENDPOINT + '/safe/image/?s=' + this.Base64.encode(src);
	},
	safeLink: function(src) {
		return API_ENDPOINT + '/safe/href/?s=' + this.Base64.encode(src);
	},
	Base64: {
		// private property
		_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		// public method for encoding
		encode: function(input) {

			var output = "";
			var chr1, chr2, chr3, enc1, enc2,
				enc3, enc4;
			var i = 0;

			input = this._utf8_encode(input);

			while (i < input.length) {

				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >>
					4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >>
					6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output +
					this._keyStr.charAt(enc1) + this._keyStr
					.charAt(enc2) +
					this._keyStr.charAt(enc3) + this._keyStr
					.charAt(enc4);

			}

			return output;
		},

		// public method for decoding
		decode: function(input) {

			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;

			input = input.replace(
				/[^A-Za-z0-9\+\/\=]/g, "");

			while (i < input.length) {

				enc1 = this._keyStr.indexOf(input.charAt(
					i++));
				enc2 = this._keyStr.indexOf(input.charAt(
					i++));
				enc3 = this._keyStr.indexOf(input.charAt(
					i++));
				enc4 = this._keyStr.indexOf(input.charAt(
					i++));

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >>
					2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				output = output + String.fromCharCode(
					chr1);

				if (enc3 != 64) {
					output = output + String.fromCharCode(
						chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(
						chr3);
				}

			}

			output = this._utf8_decode(output);

			return output;

		},

		// private method for UTF-8 encoding
		_utf8_encode: function(string) {
			string = string.replace(/\r\n/g,
				"\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128) {
					utftext += String.fromCharCode(c);
				} else if ((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >>
						6) | 192);
					utftext += String.fromCharCode((c &
						63) | 128);
				} else {
					utftext += String.fromCharCode((c >>
						12) | 224);
					utftext += String.fromCharCode(((
						c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c &
						63) | 128);
				}

			}

			return utftext;
		},

		// private method for UTF-8 decoding
		_utf8_decode: function(utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;

			while (i < utftext.length) {

				c = utftext.charCodeAt(i);

				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if ((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c &
						31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c &
							15) << 12) | ((c2 & 63) << 6) |
						(c3 & 63));
					i += 3;
				}

			}

			return string;
		}
	}
}
