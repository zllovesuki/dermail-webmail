<template>
	<span>
		<div class="overflow-hidden bg-white rounded mb2 mail-{{ propMail.messageId }}">
			<div class="m0 p1 border-bottom">
				<div class="clearfix">
					<div class="left-{{ propMail.messageId }} left black">
						<star-button :context="propMail"></star-button>
						<span class="mxn2 btn h6 muted not-clickable">
							{{ propMail.date | moment "from"}}
						</span>
					</div>
					<div class="right">
						<span class="menu-{{ propMail.messageId }} hide">
							<mail-menu :context="propMail"></mail-menu>
							<spam :context="propMail" v-if="hideSpamButton.indexOf(propMail.displayName.toLowerCase()) === -1"></spam>
						</span>
						<span class="address-{{ propMail.messageId }}">
							<address-button origin-text="From" :origin="propMail.from" v-if="!atSentFolder"></address-button>
							<address-button origin-text="To" :origin="propMail.to" v-if="atSentFolder"></address-button>
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
							{{ propMail.subject | excerpt 50 }}
						</a>
					</div>
					<div class="clickable bodyblock right{{ propMail.isRead === true ? ' muted' : ''}}" v-link="{ name: 'mail', params: { accountId: propMail.accountId, folderId: propMail.folderId, messageId: propMail.messageId } }">
						<span class="btn h5 m0 black">
							{{ propMail.text | excerpt 75 }}
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
		propMail: {
			type: Object,
			required: true
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
			return this.propMail.displayName.toLowerCase() === 'sent';
		}
	},
	methods: {
		flipMenu: function() {
			var messageId = this.propMail.messageId;
			var menuVisible = this.menuVisible;
			var menuBlock = document.getElementsByClassName('menu-' + messageId)[0];
			var leftBlock = document.getElementsByClassName('left-' + messageId)[0];
			var addressBlock = document.getElementsByClassName('address-' + messageId)[0];
			var currentRead = this.propMail.isRead;

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
