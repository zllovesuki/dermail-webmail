<template>
	<span>
		<div class="overflow-hidden bg-white rounded mb2 mail-{{ mail.messageId }}">
			<div class="m0 p1 border-bottom">
				<div class="clearfix">
					<div class="left-{{ mail.messageId }} left black">
						<star-button :message-id="mail.messageId" :is-star.sync="mail.isStar"></star-button>
						<span class="mxn2 btn h6 muted not-clickable">
							{{ mail.date | moment "from"}}
						</span>
					</div>
					<div class="right">
						<span class="menu-{{ mail.messageId }} hide">
							<mail-menu :context="mail"></mail-menu>
							<spam :folder-name="folder.displayName" :message-id="mail.messageId" :folder-id="mail.folderId" v-if="hideSpamButton.indexOf(folder.displayName.toLowerCase()) === -1"></spam>
						</span>
						<span class="address-{{ mail.messageId }}">
							<address-button origin-text="From" :origin="mail.from" v-if="!atSentFolder"></address-button>
							<address-button origin-text="To" :origin="mail.to" v-if="atSentFolder"></address-button>
						</span>
						<a class="btn h3 gray" @click="flipMenu">
							&#8942;
						</a>
					</div>
				</div>
			</div>
			<div class="m0 p1">
				<div class="clearfix">
					<div class="left">
						<a class="btn h5 m0 black not-clickable">
							{{ mail.subject | excerpt 50 }}
						</a>
					</div>
					<div class="clickable bodyblock right{{ mail.isRead === true ? ' muted' : ''}}" v-link="{ name: 'mail', params: { accountId: folder.accountId, folderId: folder.folderId, messageId: mail.messageId } }">
						<span class="btn h5 m0 black">
							{{ mail.text | excerpt 75 }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</span>
</template>

<script>

var getters = require('../lib/vuex/getters.js')
var actions = require('../lib/vuex/actions.js')

module.exports = {
	vuex: {
		getters: getters,
		actions: actions
	},
	props: {
		mail: {
			type: Object,
			required: true,
			twoWay: true
		}
	},
	data: function() {
		return {
			folderModal: false,
			menuVisible: false
		}
	},
	computed: {
		atSentFolder: function() {
			return this.folder.displayName.toLowerCase() === 'sent';
		}
	},
	methods: {
		flipMenu: function() {
			var messageId = this.mail.messageId;
			var menuVisible = this.menuVisible;
			var menuBlock = document.getElementsByClassName('menu-' + messageId)[0];
			var leftBlock = document.getElementsByClassName('left-' + messageId)[0];
			var addressBlock = document.getElementsByClassName('address-' + messageId)[0];
			var currentRead = this.mail.isRead;

			var menuClass = 'menu-' + messageId;
			var leftClass = 'left-' + messageId + ' left black';
			var addressClass = 'address-' + messageId;

			if (menuVisible === false) {
				leftClass += ' hide';
				addressClass += ' hide';
				this.menuVisible = true;
			}else{
				menuClass += ' hide';
				this.menuVisible = false;
			}

			menuBlock.className = menuClass;
			leftBlock.className = leftClass;
			addressBlock.className = addressClass;
		}
	}
}
</script>
