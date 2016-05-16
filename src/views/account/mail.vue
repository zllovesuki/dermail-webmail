<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p1">
				<div class="clearfix" v-if="ready">
					<div class="left">
						<star-button :message-id="st.mail.messageId" :is-star.sync="st.mail.isStar"></star-button>
						<span class="btn h6 muted black not-clickable">
							{{ st.mail.date | moment "MMMM Do YYYY, h:mm:ss a"}}
						</span>
					</div>
					<div class="right">
						<mail-menu :context="st.mail"></mail-menu>
					</div>
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix x-scrollable">
					<span class="p2 bold h2 m0 black">
						{{ st.mail.subject }}
					</span>
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix" v-if="ready">
					<div class="left">
						<address-button origin-text="From" :origin="st.mail.from"></address-button>
					</div>
					<div class="right">
						<address-button origin-text="To" :origin="st.mail.to"></address-button>
					</div>
				</div>
			</div>
			<div class="m0 p2 border-top">
				<div v-show="containsStrangeTags">
					<span class="h6 muted black mb2 left">
						<a class="btn not-clickable">
							Mail body displayed in iframe.
						</a>
						<a class="btn btn-outline" @click="helpModal = true">
							Why?
						</a>
					</span>
					<iframe id="iframe-body"></iframe>
				</div>
				<div v-if="!containsStrangeTags" class="overflow-auto" id="html-body">
					{{{ st.mail.html }}}
				</div>
			</div>
			<div class="m0 p1 border-top">
				<div class="clearfix" v-if="ready">
					<div class="left">
						<a class="muted h6 btn {{ st.color }}" @click="reply">
							Reply
						</a>
						<a class="muted h6 btn {{ st.color }}">
							Forward
						</a>
					</div>
					<div class="right">
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
			normalized: 'html{font-family:sans-serif}body{margin:0}article,aside,details,figcaption,figure,footer,header,hgroup,main,menu,nav,section,summary{display:block}audio,canvas,progress,video{display:inline-block;vertical-align:baseline}audio:not([controls]){display:none;height:0}[hidden],template{display:none}a{background-color:transparent}a:active,a:hover{outline:0}abbr[title]{border-bottom:1px dotted}b,strong{font-weight:700}dfn{font-style:italic}h1{font-size:2em;margin:.67em 0}mark{background:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sup{top:-.5em}sub{bottom:-.25em}img{border:0}svg:not(:root){overflow:hidden}figure{margin:1em 40px}hr{box-sizing:content-box;height:0}pre{overflow:auto}code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}button,input,optgroup,select,textarea{color:inherit;font:inherit;margin:0}button{overflow:visible}button,select{text-transform:none}button,html input[type="button"],/* 1 */input[type="reset"],input[type="submit"]{cursor:pointer}button[disabled],html input[disabled]{cursor:default}button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}input{line-height:normal}input[type="checkbox"],input[type="radio"]{box-sizing:border-box;padding:0}input[type="number"]::-webkit-inner-spin-button,input[type="number"]::-webkit-outer-spin-button{height:auto}input[type="search"]{box-sizing:content-box}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{border:0;padding:0}textarea{overflow:auto}optgroup{font-weight:700}table{border-collapse:collapse;border-spacing:0}td,th{padding:0}',
			ready: false
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
				if (this.st.mail.html.match(/<style/)) { // Warning, it contains <style>
					return true;
				}
				if (this.st.mail.html.match(/<script/)) { // Warning, it contains <script>
					return true;
				}
				if (this.st.mail.html.match(/<img/)) { // Warning, it contains <img>
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
		HTMLInNewWindow: function(e) {
			var w = window.open();
			w.document.body.innerHTML = this.st.mail.html;
		},
		createNormalized: function() {
			style = document.createElement('style');
			style.type = 'text/css';
			if (style.styleSheet){
				style.styleSheet.cssText = this.normalized;
			} else {
				style.appendChild(document.createTextNode(this.normalized));
			}
			return style;
		},
		safeImage: function(html) {
			var imgTags = html.match(/<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/gi);
			if (imgTags) {
				imgTags.forEach(function(img) {
					var src = img.match(/<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/i)[1];
					if (src.substring(0, 3) === 'cid') {
						html = html.replace(src, api.inlineImage(src));
					}else{
						html = html.replace(src, api.safeImage(src));
					}
				})
			}
			var cssURL = html.match(/(?:\(['|"]?)(.*?)(?:['|"]?\))/gi);
			if (cssURL) {
				cssURL.forEach(function(img) {
					var src = img.match(/(?:\(['|"]?)(.*?)(?:['|"]?\))/i)[1];
					html = html.replace('url(' + src, 'url(' + api.safeImage(src));
					html = html.replace('url(\'' + src + '\'', 'url(' + api.safeImage(src));
					html = html.replace('url("' + src + '"', 'url(' + api.safeImage(src));
				})
			}
			return html;
		},
		safeLink: function(element) {
			var a = element.getElementsByTagName('a');
			var area = element.getElementsByTagName('area'); // DSW emails fix
			var hrefs = [];
			this.appendAll(hrefs, a);
			this.appendAll(hrefs, area);
			var that = this;
			for (var i = 0; i < hrefs.length; i++) {
				hrefs[i].onclick = function(e) {
					e.preventDefault();
					var href = e.target.href || e.target.parentElement.href;
					var href = api.safeLink(href);
					that.st.alert
					.okBtn("Yes")
					.cancelBtn("No")
					.confirm('Are you sure to leave?')
					.then(function(resolved) {
						resolved.event.preventDefault();

						if (resolved.buttonClicked !== 'ok') return;

						return window.open(href);
					});
				}
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
				iframe.head.appendChild(this.createNormalized());
				iframe.body.innerHTML = this.safeImage(this.st.mail.html);
				setTimeout(function() {
					frame.style.height = (iframe.body.scrollHeight) + 'px';
				}, 500);
				this.safeLink(iframe);
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
			this.st.compose.addSubject = {
				type: 'Re: ',
				subject: dedup
			};
			this.st.compose.addHTML = "<br /><small>Original Email:</small><hr /><br />" + this.st.mail.html;
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
		downloadMail: function() {
			var that = this;
			api.grabDependencies(3, this, function(data) {
				that.writeFrame();
				that.st.loading.go(100);
				that.ready = true;

				if (typeof data.isRead == 'undefined' || data.isRead === false) {
					api.updateMail(that, {
						accountId: that.$route.params.accountId,
						messageId: that.$route.params.messageId,
						action: 'read'
					}).then(function(res) {
						that.st.mail.isRead = true;
						var element = document.getElementsByClassName('mail-marker')[0];
						if (element) element.innerHTML = 'Mark Unread';
					}, function(res) {
						if (res.data.hasOwnProperty('message')) {
							that.st.alert.error(res.data.message);
						}else{
							that.st.alert.error(res.statusText);
						}
					});
				}
			});
		}
	},
	watch: {
		'$route.params': function(val, oldVal) {
			this.downloadMail();
		}
	},
	created: function() {

		this.st.setTitle('Mail');

		if (this.st._folders.length === 0) {
			this.$dispatch('getFoldersInAccount');
		}

		this.downloadMail();

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
