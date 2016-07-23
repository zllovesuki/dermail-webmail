<template>
	<span>
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
						<option v-for="f in flatFolders" v-if="hideInMoveOptions.indexOf(f.displayName.toLowerCase()) === -1" value="{{ f.folderId }}">{{ f.displayName }}</option>
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
			}
		}
	},
	methods: {
		flipReadAndChangeBody: function(e) {
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

				this.context.isRead = (newRead === 'read' ? true : false);
				this.setReadInMailArray(messageId, this.context.isRead);

				this.alert().success((newRead !== 'read' ? 'Unread' : 'Read') + ' : 👍');
			})
		},
		showMoveFolder: function(e) {
			this.folderModal = true;

			this.modal.oldFolder = this.modal.folderId;
			this.modal.action = 'folder';
		},
		doMoveToFolder: function(e) {

			this.folderModal = false;

			if (this.modal.oldFolder != this.modal.folderId) { // Not in this folder anymore
				this.buttonDisabled = true;
				return this.updateMail(this.modal)
				.then(function(res) {
					if (typeof res === 'undefined') return;
					this.resetLastFolderId();
					this.buttonDisabled = false;
					this.alert().success('Moved to a folder.');
					return this.mailHouseKeeping(this.modal.folderId, this.modal.messageId);
				})
			}

		},
		oneClickToTrash: function(e) {

			this.modal.action = 'trash';

			return this.updateMail(this.modal)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				var data = res.text();
				this.alert().success('Moved to Trash.');
				this.modal.folderId = data; // see line 96 in showMoveFolder()
				return this.mailHouseKeeping(data, this.modal.messageId);
			})
		},

	}
}
</script>
