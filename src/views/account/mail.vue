<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="mxn1 p1">
				<div class="clearfix" v-if="ready">
					<div class="left">
						<star-button :context="mail"></star-button>
						<span class="mxn2 btn h6 muted black not-clickable">
							{{ mail.date | moment "MM/DD/YYYY, HH:mm:ss"}}
						</span>
					</div>
					<div class="right mr1">
						<mail-menu :context="mail"></mail-menu>
					</div>
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix x-scrollable">
					<span class="p2 bold h3 m0 black">
						{{ mail.subject }}
					</span>
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix" v-if="ready">
					<div class="left ml2">
						<address-button origin-text="From" :origin="mail.from"></address-button>
					</div>
					<div class="right mr1">
						<address-button origin-text="To" :origin="mail.to"></address-button>
						<a class="muted h6 bold btn mxn1 {{ color }}" @click="extraRecipients = true" v-if="(mail.cc && mail.cc.length > 0) || (mail.bcc && mail.bcc.length > 0)">...</a>
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
					{{{ mail.html }}}
				</div>
			</div>
			<div class="m0 p1 border-top">
				<div class="clearfix" v-if="ready">
					<div class="left" v-if="hideInMoveOptions.indexOf(mail.displayName.toLowerCase()) === -1">
						<a class="muted h6 btn {{ color }}" @click="reply">
							Reply
						</a>
						<a class="muted h6 btn {{ color }}" @click="forward">
							Forward
						</a>
					</div>
					<div class="right mr1">
						<a class="h6 mxn1 btn black" @click="showRaw">
							Raw
						</a>
						<spam :context="mail" v-if="hideSpamButton.indexOf(mail.displayName.toLowerCase()) === -1"></spam>
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
					<template v-for="attachment in mail.attachments" track-by="checksum">
						<a class="muted h6 ml1 mb1 bold btn btn-outline {{ color }}" href="{{ returnS3URL(attachment.checksum, attachment.generatedFileName) }}" target="_blank">
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
				<div v-if="mail.cc && mail.cc.length > 0"><address-button origin-text="CC" :origin="mail.cc"></address-button></div>
				<div v-if="mail.bcc && mail.bcc.length > 0"><address-button origin-text="BCC" :origin="mail.bcc"></address-button></div>
			</span>
		</modal>
	</div>
</template>
<script>

var getters = require('../../lib/vuex/getters.js')
var actions = require('../../lib/vuex/actions.js')

module.exports = {
	vuex: {
		getters: getters,
		actions: actions
	},
	data: function() {
		return {
			helpModal: false,
			extraRecipients: false,
			iframeFix: 'self!==top&&(max=' + this.zoomFactor + ',myRedraw="width",b=document.getElementsByTagName("body")[0],zW=(b.clientWidth-5)/b.scrollWidth,"both"===myRedraw?(zH=b.clientHeight/b.scrollHeight,zH<zW&&zH<1?z=zH:z=zW):z=zW,z>1+max?z=1+max:z<1-max&&(z=1-max),s="zoom:"+z+"; -moz-transform: scale("+z+"); -moz-transform-origin: 0 0;","function"==typeof b.setAttribute?b.setAttribute("style",s):"object"==typeof b.style.setAttribute&&b.style.setAttribute("cssText",s));',
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
			if (this.mail.hasOwnProperty('attachments')) {
				if (this.mail.attachments.length > 0) {
					return true;
				}
			}
			return false;
		},
		containsStrangeTags: function() {
			if (this.mail.hasOwnProperty('html')) {
				if (this.mail.html.toLowerCase().match(/<style/)) { // Warning, it contains <style>
					return true;
				}
				if (this.mail.html.toLowerCase().match(/<script/)) { // Warning, it contains <script>
					return true;
				}
				if (this.mail.html.toLowerCase().match(/<img/)) { // Warning, it contains <img>
					return true;
				}
				if (this.mail.html.toLowerCase().replace(/ /g,'').match('position:absolute')) { // Warning, it contains absoulte
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
			w.document.body.innerHTML = this.mail.html;
		},
		createiFrameFix: function() {
			var script = document.createElement("script");
			script.innerHTML = this.iframeFix;
			return script;
		},
		reaplceWithSafeImage: function(html) {

			if (html.indexOf('http://fonts.googleapis.com') !== -1) {
				html = this.replaceall('http://fonts.googleapis.com', 'https://fonts.googleapis.com', html);
			}

			var replaceImg = function(img, src) {
				if (src.substring(0, 3) === 'cid') {
					html = this.replaceall(img, this.replaceall(src, this.inlineImage(src), img), html);
				}else{
					var before = src;
					var after = this.replaceMap(before);
					html = this.replaceall(img, this.replaceall(before, this.safeImage(after), img), html);
				}
			}.bind(this);

			var imgTags = html.match(/<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/gi);
			if (imgTags) {
				imgTags.forEach(function(img) {
					var src = img.match(/<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/i)[1];
					// 'http'.length > 3
					if (src.length > 3) replaceImg(img, src);
				}.bind(this))
			}
			// This will do before I figure out a better regex
			var noQuoteImgTags = html.match(/<img\s[^>]*?src(?:=)([^'\"]*?)(?:\s)[^>]*?>/gi);
			if (noQuoteImgTags) {
				noQuoteImgTags.forEach(function(img) {
					var src = img.match(/<img\s[^>]*?src(?:=)([^'\"]*?)(?:\s)[^>]*?>/i)[1];
					// 'http'.length > 3
					if (src.length > 3) replaceImg(img, src);
				}.bind(this))
			}
			var bgTags = html.match(/background\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/gi);
			if (bgTags) {
				bgTags.forEach(function(img) {
					var src = img.match(/background\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/i)[1];
					// 'http'.length > 3
					if (src.length > 3) replaceImg(img, src);
				}.bind(this))
			}
			var cssURL = html.match(/(?:\(['|"]?)(.*?)(?:['|"]?\))/gi);
			if (cssURL) {
				cssURL.forEach(function(img) {
					var src = img.match(/(?:\(['|"]?)(.*?)(?:['|"]?\))/i)[1];
					html = this.replaceall('url(' + src, 'url(' + this.safeImage(src), html);
					html = this.replaceall('url(\'' + src + '\'', 'url(' + this.safeImage(src), html);
					html = this.replaceall('url("' + src + '"', 'url(' + this.safeImage(src), html);
				}.bind(this))
			}

			return html;
		},
		replaceWithSafeLink: function(element) {
			var a = element.getElementsByTagName('a');
			var area = element.getElementsByTagName('area'); // DSW emails fix
			var hrefs = [];
			this.appendAll(hrefs, a);
			this.appendAll(hrefs, area);
			for (var i = 0; i < hrefs.length; i++) {
				hrefs[i].onclick = function(e) {
					e.preventDefault();
					var href = e.target.href || e.target.parentElement.href;
					var href = this.safeLink(href);
					this.alert()
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
                iframe.head = '';
				iframe.head.appendChild(this.createiFrameFix());
				iframe.body.innerHTML = this.reaplceWithSafeImage(this.mail.html);
				setTimeout(function() {
					frame.style.height = (iframe.body.scrollHeight) + 'px';
				}, 500);
				this.replaceWithSafeLink(iframe);
			}else{
				this.$nextTick(function() {
					var body = document.getElementById('html-body');
					this.replaceWithSafeLink(body);
				})
			}
		},
		emailToObject: function(email) {
			return {
                address: email.address.toLowerCase(),
                name: email.name
			}
		},
		appendToCompose: function() {
			if (typeof this.mail._messageId === 'undefined') this.updateComposeInReplyTo(this.mail.messageId);
			else this.updateComposeInReplyTo(this.mail._messageId);
			if (typeof this.mail.references === 'object') {
				this.updateComposeReferences(this.mail.references);
			}

			if (this.mail.attachments.length > 0) {
				for (var i = 0; i < this.mail.attachments.length; i++) {
                    // Check if we have inline images, then we need to append them to reply
					if (this.mail.attachments[i].contentDisposition === 'inline') {
						this.appendComposeAddAttachmens({
							mutable: false,
							filename: this.mail.attachments[i].generatedFileName,
							cid: this.mail.attachments[i].contentId,
							path: this.inlineImage('cid:' + this.mail.attachments[i].contentId)
						})
					}else{
                        // for non-inline images, we will keep them but set to mutable
                        this.appendComposeAddAttachmens({
							mutable: true,
							filename: this.mail.attachments[i].generatedFileName,
							path: this.inlineImage('cid:' + this.mail.attachments[i].contentId)
						})
                    }
				}
			}
		},
		reply: function() {
			var obj;
			var dedup = this.mail.subject || '';

			if (typeof this.mail.replyTo !== 'undefined') {
				obj = this.emailToObject(this.mail.replyTo[0]);
			}else{
				obj = this.emailToObject(this.mail.from[0]);
			}
			this.appendComposeAddTo(obj);

			while (dedup.toLowerCase().trimLeft().indexOf('re:') === 0) {
				dedup = dedup.slice(3)
			}
			this.updateComposeAddSubject({
				type: 'Re: ',
				subject: dedup
			});
			this.updateComposeType('reply');

			this.appendToCompose();

			return this.$route.router.go({ name: 'compose', params: { accountId: this.route.params.accountId } })
		},
		forward: function() {
			this.updateComposeAddSubject({
				type: 'Fwd: ',
				subject: this.mail.subject || ''
			});
			this.updateComposeType('forward');

			this.appendToCompose();

			return this.$route.router.go({ name: 'compose', params: { accountId: this.$route.params.accountId } })
		},
		downloadMail: function() {
			this.loading().go(70);
			this.grabDependencies(3)
			.then(function(data) {
				if (typeof data === 'undefined') return;
				this.writeFrame();
				this.loading().go(100);
				this.ready = true;

				if (typeof data.isRead == 'undefined' || data.isRead === false) {
					this.updateMailRead(this.route.params.accountId, this.route.params.messageId, true);
				}
			}.bind(this))
		},
		showRaw: function() {
			window.open(this.safeRaw(this.route.params));
		}
	},
	watch: {
		'$route.params': function(val, oldVal) {
			this.ready = false;
			this.removeMail();
			this.downloadMail();
		}
	},
	created: function() {
		this.removeMail();
	},
	compiled: function() {

		this.setTitle('Mail');

		this.loading().go(50);

		if (this.flatFolders.length === 0) {
			this.getFoldersInAccount()
			.then(function() {
				this.downloadMail();
			});
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
