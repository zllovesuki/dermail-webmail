<template>
	<span v-show="!hide">
		<a class="muted h6 mxn1 btn {{ color }}" @click="flipReadAndChangeBody" v-if="hideReadUnread.indexOf(folder.displayName.toLowerCase()) === -1">
			{{ context.isRead === true ? '> Unread': '> Read' }}
		</a>
		<a class="muted h6 mxn1 btn {{ color }}" @click="showMoveFolder" v-if="hideMoveToFolder.indexOf(folder.displayName.toLowerCase()) === -1">
			> Folder
		</a>
		<a class="h6 bold mxn1 btn red" @click.prevent="oneClickToTrash" v-if="hideMoveToTrash.indexOf(folder.displayName.toLowerCase()) === -1">
			> Trash
		</a>
		<modal :show.sync="folderModal">
			<h4 slot="header">Move to a Folder</h4>
			<span slot="body">
				<form v-on:submit.prevent="doMoveToFolder" class="h5">
					<label for="folder">Move to:</label>
					<select class="block col-12 mb2 field" v-model="modal.folderId">
						<option v-for="f in flatFolders" track-by="folderId" v-if="hideInMoveOptions.indexOf(f.displayName.toLowerCase()) === -1" value="{{ f.folderId }}">{{ f.displayName }}</option>
					</select>
					<button :disabled="buttonDisabled" class="btn btn-primary">Move</button>
				</form>
			</span>
		</modal>
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
		context: {
			type: Object,
			required: true
		}
	},
	data: function() {
		return {
			buttonDisabled: false,
			folderModal: false,
			modal: {
				accountId: this.context.accountId,
				folderId: this.context.folderId,
				messageId: this.context.messageId,
				oldFolder: ''
			},
			hide: false
		}
	},
	methods: {
		flipReadAndChangeBody: function(e) {
			this.hide = true;
			var messageId = this.modal.messageId;
			var accountId = this.modal.accountId;
			var currentRead = this.context.isRead;
			var newRead = (currentRead ? 'unread' : 'read');

			this.updateMail({
				accountId: accountId,
				messageId: messageId,
				action: newRead
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;

				this.setReadInMailArray(messageId, (newRead === 'read' ? true : false));

				this.alert().success((newRead !== 'read' ? 'Unread' : 'Read') + ' : 👍');

				this.hide = false;
			})
		},
		showMoveFolder: function(e) {
			this.folderModal = true;

			this.modal.oldFolder = this.modal.folderId;
			this.modal.action = 'folder';
		},
		doMoveToFolder: function(e) {

			this.hide = true;
			this.folderModal = false;

			if (this.modal.oldFolder != this.modal.folderId) { // Not in this folder anymore
				this.buttonDisabled = true;
				return this.updateMail(this.modal)
				.then(function(res) {
					if (typeof res === 'undefined') return;
					return this.mailHouseKeeping(this.modal.folderId, this.modal.messageId)
					.then(function() {
						this.resetLastFolderId();
						this.buttonDisabled = false;
						this.alert().success('Moved to a folder.');
					}.bind(this))
				})
				.finally(function() {
					this.hide = false;
				}.bind(this))
			}

		},
		oneClickToTrash: function(e) {

			this.hide = true;
			this.modal.action = 'trash';

			return this.updateMail(this.modal)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				var data = res.text();
				return this.mailHouseKeeping(data, this.modal.messageId)
				.then(function() {
					this.modal.folderId = data; // see line 96 in showMoveFolder()
					this.alert().success('Moved to Trash.');
				}.bind(this))
			})
			.finally(function() {
				this.hide = false;
			}.bind(this))
		},

	}
}
</script>
