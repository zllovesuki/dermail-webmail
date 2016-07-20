<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="mxn1 p1">
				<div class="clearfix" v-if="ready">
					<div class="left">
						<star-button :message-id="st.mail.messageId" :is-star.sync="st.mail.isStar"></star-button>
						<span class="mxn2 btn h6 muted black not-clickable">
							{{ st.mail.date | moment "MM/DD/YYYY, HH:mm:ss"}}
						</span>
					</div>
					<div class="right mr1">
						<mail-menu :context="st.mail"></mail-menu>
					</div>
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix x-scrollable">
					<span class="p2 bold h3 m0 black">
						{{ st.mail.subject }}
					</span>
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix" v-if="ready">
					<div class="left ml2">
						<address-button origin-text="From" :origin="st.mail.from"></address-button>
					</div>
					<div class="right mr1">
						<address-button origin-text="To" :origin="st.mail.to"></address-button>
						<a class="muted h6 bold btn mxn1 {{ st.color }}" @click="extraRecipients = true" v-if="(st.mail.cc && st.mail.cc.length > 0) || (st.mail.bcc && st.mail.bcc.length > 0)">...</a>
					</div>
				</div>
			</div>
			<div class="m0 p2 border-top">
				<div v-show="containsStrangeTags">
					<div class="h6 muted black mb2 left">
						<a class="btn not-clickable">
							Mail body displayed in iframe.
						</a>
						<a class="btn btn-outline" @click="helpModal = true">
							Why?
						</a>
					</div>
					<iframe id="iframe-body"></iframe>
				</div>
				<div v-if="!containsStrangeTags" class="overflow-auto" id="html-body">
					{{{ st.mail.html }}}
				</div>
			</div>
			<div class="m0 p1 border-top">
				<div class="clearfix" v-if="ready">
					<div class="left" v-if="st.hideInMoveOptions.indexOf(st.folder.displayName.toLowerCase()) === -1">
						<a class="muted h6 btn {{ st.color }}" @click="reply">
							Reply
						</a>
						<a class="muted h6 btn {{ st.color }}" @click="forward">
							Forward
						</a>
					</div>
					<div class="right mr1">
						<a class="h6 mxn1 btn black" @click="showRaw">
							Raw
						</a>
						<spam :folder-name="st.folder.displayName" :message-id="st.mail.messageId" :folder-id="st.mail.folderId" v-if="st.hideSpamButton.indexOf(st.folder.displayName.toLowerCase()) === -1"></spam>
					</div>
				</div>
			</div>
		</div>
		<div class="overflow-hidden bg-white rounded mb2" v-if="ready && hasAttachments">
			<div class="m0 p1">
				<div class="clearfix">
					<span class="btn black h5 muted not-clickable">Attachments: </span>
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix" v-if="ready">
					<template v-for="attachment in st.mail.attachments">
						<a class="muted h6 ml1 mb1 bold btn btn-outline {{ st.color }}" href="{{ st.returnS3URL(attachment.checksum, attachment.generatedFileName) }}" target="_blank">
							{{attachment.generatedFileName}}
						</a>
					</template>
				</div>
			</div>
		</div>
		<modal :show.sync="helpModal">
			<h4 slot="header">Why is my mail body in an iframe?</h4>
			<span slot="body">
				<span class="block h5">
					If the body contains page breaking tags like &lt;style>,
					then the mail body will be displayed in an iframe to preserve its style and
					maintain the style of the webapp.
				</span>
			</span>
		</modal>
		<modal :show.sync="extraRecipients">
			<h4 slot="header"></h4>
			<span slot="body">
				<div v-if="st.mail.cc && st.mail.cc.length > 0"><address-button origin-text="CC" :origin="st.mail.cc"></address-button></div>
				<div v-if="st.mail.bcc && st.mail.bcc.length > 0"><address-button origin-text="BCC" :origin="st.mail.bcc"></address-button></div>
			</span>
		</modal>
	</div>
</template>
<script>

var st = require('../../lib/st.js');
var api = require('../../lib/api.js');

module.exports = {
	data: function() {
		return {
			st: st,
			helpModal: false,
			extraRecipients: false,
			iframeFix: 'self!==top&&(max=' + st.zoomFactor + ',myRedraw="width",b=document.getElementsByTagName("body")[0],zW=(b.clientWidth-5)/b.scrollWidth,"both"===myRedraw?(zH=b.clientHeight/b.scrollHeight,zH<zW&&zH<1?z=zH:z=zW):z=zW,z>1+max?z=1+max:z<1-max&&(z=1-max),s="zoom:"+z+"; -moz-transform: scale("+z+"); -moz-transform-origin: 0 0;","function"==typeof b.setAttribute?b.setAttribute("style",s):"object"==typeof b.style.setAttribute&&b.style.setAttribute("cssText",s));',
			ready: false,
			encodingMap: [
				{
					from: '&#58;',
					to: ':'
				},
				{
					from: '&#x2F;',
					to: '/'
				}
			]
		}
	},
	computed: {
		hasAttachments: function() {
			if (this.st.mail.hasOwnProperty('attachments')) {
				if (this.st.mail.attachments.length > 0) {
					return true;
				}
			}
			return false;
		},
		containsStrangeTags: function() {
			if (this.st.mail.hasOwnProperty('html')) {
				if (this.st.mail.html.toLowerCase().match(/<style/)) { // Warning, it contains <style>
					return true;
				}
				if (this.st.mail.html.toLowerCase().match(/<script/)) { // Warning, it contains <script>
					return true;
				}
				if (this.st.mail.html.toLowerCase().match(/<img/)) { // Warning, it contains <img>
					return true;
				}
				if (this.st.mail.html.toLowerCase().replace(/ /g,'').match('position:absolute')) { // Warning, it contains absoulte
					return true;
				}
			}
			return false;
		}
	},
	methods: {
		replaceall: function(replaceThis, withThis, inThis) {
			withThis = withThis.replace(/\$/g,"$$$$");
			return inThis.replace(new RegExp(replaceThis.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&])/g,"\\$&"),"g"), withThis);
		}, // https://github.com/leecrossley/replaceall/blob/master/replaceall.js
		replaceMap: function(src) {
			this.encodingMap.forEach(function(single) {
				src = this.replaceall(single.from, single.to, src);
			}.bind(this));
			return src;
		},
		HTMLInNewWindow: function(e) {
			var w = window.open();
			w.document.body.innerHTML = this.st.mail.html;
		},
		createiFrameFix: function() {
			var script = document.createElement("script");
			script.innerHTML = this.iframeFix;
			return script;
		},
		safeImage: function(html) {
			return new Promise(function(resolve) {

				if (html.indexOf('http://fonts.googleapis.com') !== -1) {
					html = this.replaceall('http://fonts.googleapis.com', 'https://fonts.googleapis.com', html);
				}

				var replaceImg = function(img, src) {
					if (src.substring(0, 3) === 'cid') {
						html = this.replaceall(img, this.replaceall(src, api.inlineImage(src), img), html);
					}else{
						var before = src;
						var after = this.replaceMap(before);
						html = this.replaceall(img, this.replaceall(before, api.safeImage(after), img), html);
					}
				}.bind(this);

				var imgTags = html.match(/<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/gi);
				if (imgTags) {
					imgTags.forEach(function(img) {
						var src = img.match(/<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/i)[1];
						replaceImg(img, src);
					}.bind(this))
				}
				// This will do before I figure out a better regex
				var noQuoteImgTags = html.match(/<img\s[^>]*?src(?:=)([^'\"]*?)(?:\s)[^>]*?>/gi);
				if (noQuoteImgTags) {
					noQuoteImgTags.forEach(function(img) {
						var src = img.match(/<img\s[^>]*?src(?:=)([^'\"]*?)(?:\s)[^>]*?>/i)[1];
						replaceImg(img, src);
					}.bind(this))
				}
				var bgTags = html.match(/background\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/gi);
				if (bgTags) {
					bgTags.forEach(function(img) {
						var src = img.match(/background\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/i)[1];
						var before = src;
						var after = this.replaceMap(before);
						html = this.replaceall(img, this.replaceall(before, api.safeImage(after), img), html);
					}.bind(this))
				}
				var cssURL = html.match(/(?:\(['|"]?)(.*?)(?:['|"]?\))/gi);
				if (cssURL) {
					cssURL.forEach(function(img) {
						var src = img.match(/(?:\(['|"]?)(.*?)(?:['|"]?\))/i)[1];
						html = this.replaceall('url(' + src, 'url(' + api.safeImage(src), html);
						html = this.replaceall('url(\'' + src + '\'', 'url(' + api.safeImage(src), html);
						html = this.replaceall('url("' + src + '"', 'url(' + api.safeImage(src), html);
					}.bind(this))
				}

				return resolve(html);
			}.bind(this))
		},
		safeLink: function(element) {
			var a = element.getElementsByTagName('a');
			var area = element.getElementsByTagName('area'); // DSW emails fix
			var hrefs = [];
			this.appendAll(hrefs, a);
			this.appendAll(hrefs, area);
			for (var i = 0; i < hrefs.length; i++) {
				hrefs[i].onclick = function(e) {
					e.preventDefault();
					var href = e.target.href || e.target.parentElement.href;
					var href = api.safeLink(href);
					this.st.alert
					.okBtn("Yes")
					.cancelBtn("No")
					.confirm('Are you sure to leave?')
					.then(function(resolved) {
						resolved.event.preventDefault();

						if (resolved.buttonClicked !== 'ok') return;

						return window.open(href);
					});
				}.bind(this)
			}
		},
		appendAll: function(dest, src) {
			var n;

			for (n = 0; n < src.length; ++n) {
				dest.push(src[n]);
			}
			return dest;
		},
		writeFrame: function() {
			if (this.containsStrangeTags) {
				var frame = document.getElementById('iframe-body');
				var iframe = frame.contentWindow.document;
				iframe.head.appendChild(this.createiFrameFix());
				this.safeImage(this.st.mail.html).then(function(html) {
					iframe.body.innerHTML = html;
					setTimeout(function() {
						frame.style.height = (iframe.body.scrollHeight) + 'px';
					}, 500);
					this.safeLink(iframe);
				}.bind(this))
			}else{
				this.$nextTick(function() {
					var body = document.getElementById('html-body');
					this.safeLink(body);
				})
			}
		},
		emailToObject: function(email) {
			return {
				account: email.address.substring(0, email.address.lastIndexOf("@")).toLowerCase(),
				domain: email.address.substring(email.address.lastIndexOf("@") +1).toLowerCase(),
				friendlyName: email.name
			}
		},
		reply: function() {
			var obj;
			if (typeof this.st.mail.replyTo !== 'undefined') {
				obj = this.emailToObject(this.st.mail.replyTo[0]);
			}else{
				obj = this.st.mail.from[0];
			}
			this.st.compose.addTo.push(obj);
			var dedup = this.st.mail.subject;
			while (dedup.toLowerCase().trimLeft().indexOf('re:') === 0) {
				dedup = dedup.slice(3)
			}
			if (typeof this.st.mail._messageId === 'undefined') this.st.mail._messageId = this.st.mail.messageId;
			this.st.compose.inReplyTo = this.st.mail._messageId;
			if (typeof this.st.mail.references === 'object') {
				this.st.compose.references = this.st.mail.references;
			}
			this.st.compose.addSubject = {
				type: 'Re: ',
				subject: dedup
			};
			this.st.compose.type = 'reply';
			if (this.st.mail.attachments.length > 0) {
				// Check if we have inline images, then we need to append them to reply
				for (var i = 0; i < this.st.mail.attachments.length; i++) {
					if (this.st.mail.attachments[i].contentDisposition === 'inline') {
						this.st.compose.addAttachments.push({
							mutable: false,
							filename: this.st.mail.attachments[i].generatedFileName,
							cid: this.st.mail.attachments[i].contentId,
							path: api.inlineImage('cid:' + this.st.mail.attachments[i].contentId)
						});
					}
				}
			}
			return this.$route.router.go({ name: 'compose', params: { accountId: this.$route.params.accountId } })
		},
		forward: function() {
			if (typeof this.st.mail._messageId === 'undefined') this.st.mail._messageId = this.st.mail.messageId;
			this.st.compose.inReplyTo = this.st.mail._messageId;
			if (typeof this.st.mail.references === 'object') {
				this.st.compose.references = this.st.mail.references;
			}
			this.st.compose.addSubject = {
				type: 'Fwd: ',
				subject: this.st.mail.subject
			};
			this.st.compose.type = 'forward';
			if (this.st.mail.attachments.length > 0) {
				// Check if we have inline images, then we need to append them to reply
				for (var i = 0; i < this.st.mail.attachments.length; i++) {
					this.st.compose.addAttachments.push({
						mutable: false,
						filename: this.st.mail.attachments[i].generatedFileName,
						cid: this.st.mail.attachments[i].contentId,
						path: api.inlineImage('cid:' + this.st.mail.attachments[i].contentId)
					});
				}
			}
			return this.$route.router.go({ name: 'compose', params: { accountId: this.$route.params.accountId } })
		},
		downloadMail: function() {
			this.st.loading.go(70);
			api.grabDependencies(3, this)
			.then(function(data) {
				if (typeof data === 'undefined') return;
				this.writeFrame();
				this.st.loading.go(100);
				this.ready = true;

				if (typeof data.isRead == 'undefined' || data.isRead === false) {
					api.updateMail(this, {
						accountId: this.$route.params.accountId,
						messageId: this.$route.params.messageId,
						action: 'read'
					})
					.then(function(res) {
						this.st.mail.isRead = true;
						this.$dispatch('setReadInMailArray', this.$route.params.messageId, this.st.mail.isRead);
					});
				}
			}.bind(this))
		},
		showRaw: function() {
			window.open(api.safeRaw(this.$route.params));
		}
	},
	watch: {
		'$route.params': function(val, oldVal) {
			this.ready = false;
			this.st.mail = {};
			this.downloadMail();
		}
	},
	created: function() {
		this.st.mail = {};
	},
	compiled: function() {

		this.st.setTitle('Mail');

		this.st.loading.go(50);

		if (this.st._folders.length === 0) {
			this.$dispatch('getFoldersInAccount', function() {
				this.downloadMail();
			}.bind(this))
		}else{
			this.downloadMail();
		}

	}
}
</script>

<style>
iframe {
	display: block;
	width: 100%;
	border: none;
}
</style>
