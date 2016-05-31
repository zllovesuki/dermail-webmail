<template>
	<span>
		<div class="overflow-hidden bg-white rounded mb2 mail-{{ mail.messageId }}">
			<div class="m0 p1 border-bottom">
				<div class="clearfix">
					<div class="left black">
						<star-button :message-id="mail.messageId" :is-star.sync="mail.isStar"></star-button>
						<span class="btn h6 muted not-clickable">
							{{ mail.date | moment "from"}}
						</span>
					</div>
					<div class="right">
						<address-button origin-text="From" :origin="mail.from" v-if="!atSentFolder"></address-button>
						<address-button origin-text="To" :origin="mail.to" v-if="atSentFolder"></address-button>
						<a class="btn h3 gray" @click="flipMenuAndBody">
							&#8942;
						</a>
					</div>
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix">
					<div class="left">
						<a class="subject-{{ mail.messageId }} btn h5 m0 black not-clickable">
							{{ mail.subject | excerpt 50 }}
						</a>
					</div>
					<div class="body-{{ mail.messageId }} clickable bodyblock right{{ mail.isRead === true ? ' muted' : ''}}" v-link="{ name: 'mail', params: { accountId: st.folder.accountId, folderId: st.folder.folderId, messageId: mail.messageId } }">
						<span class="btn h5 m0 black" style="word-wrap: break-word;">
							{{ mail.text | excerpt 75 }}
						</span>
					</div>
					<div class="menu-{{ mail.messageId }} right hide">
						<mail-menu :context="mail"></mail-menu>
						<spam :folder-name="st.folder.displayName" :message-id="mail.messageId" :folder-id="mail.folderId" v-if="st.hideSpamButton.indexOf(st.folder.displayName.toLowerCase()) === -1"></spam>
					</div>
				</div>
			</div>
		</div>
	</span>
</template>

<script>

var st = require('../lib/st.js');

module.exports = {
	props: {
		mail: {
			type: Object,
			required: true,
			twoWay: true
		}
	},
	data: function() {
		return {
			st: st,
			folderModal: false,
			menuVisible: false
		}
	},
	computed: {
		atSentFolder: function() {
			return this.st.folder.displayName.toLowerCase() === 'sent';
		}
	},
	methods: {
		flipMenuAndBody: function() {
			var messageId = this.mail.messageId;
			var menuVisible = this.menuVisible;
			var menuBlock = document.getElementsByClassName('menu-' + messageId)[0];
			var subjectBlock = document.getElementsByClassName('subject-' + messageId)[0];
			var bodyBlock = document.getElementsByClassName('body-' + messageId)[0];
			var currentRead = this.mail.isRead;

			var menuClass = 'menu-' + messageId + ' right';
			var subjectClass = 'subject-' + messageId + ' btn h5 m0 black not-clickable';
			var bodyClass = 'body-' + messageId + ' clickable bodyblock right';

			if (currentRead) {
				bodyClass += ' muted';
			}

			if (menuVisible === false) {
				subjectClass += ' hide';
				bodyClass += ' hide';
				this.menuVisible = true;
			}else{
				menuClass += ' hide';
				this.menuVisible = false;
			}

			menuBlock.className = menuClass;
			subjectBlock.className = subjectClass;
			bodyBlock.className = bodyClass;
		}
	}
}
</script>
