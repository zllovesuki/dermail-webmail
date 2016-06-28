<template>
	<span>
		<a class="muted h6 mxn1 btn {{ st.color }} mail-marker" @click="flipReadAndChangeBody" v-if="st.hideReadUnread.indexOf(st.folder.displayName.toLowerCase()) === -1">
			{{ context.isRead === true ? '> Unread': '> Read' }}
		</a>
		<a class="muted h6 mxn1 btn {{ st.color }}" @click="showMoveFolder" v-if="st.hideMoveToFolder.indexOf(st.folder.displayName.toLowerCase()) === -1">
			> Folder
		</a>
		<a class="h6 bold mxn1 btn red" @click.prevent="oneClickToTrash" v-if="st.hideMoveToTrash.indexOf(st.folder.displayName.toLowerCase()) === -1">
			> Trash
		</a>
		<modal :show.sync="folderModal">
			<h4 slot="header">Move to a Folder</h4>
			<span slot="body">
				<form v-on:submit.prevent="doMoveToFolder" class="h5">
					<label for="folder">Move to:</label>
					<select class="block col-12 mb2 field" v-model="modal.folderId">
						<option v-for="f in st._folders" v-if="st.hideInMoveOptions.indexOf(f.displayName.toLowerCase()) === -1" value="{{ f.folderId }}">{{ f.displayName }}</option>
					</select>
					<button class="btn btn-primary">Move</button>
				</form>
			</span>
		</modal>
	</span>
</template>

<script>
var st = require('../lib/st.js');
var api = require('../lib/api.js');

module.exports = {
	props: {
		context: {
			type: Object,
			required: true
		}
	},
	data: function() {
		return {
			st: st,
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

			api.updateMail(this, {
				accountId: accountId,
				messageId: messageId,
				action: newRead
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;

				this.st.alert.success((newRead !== 'read' ? 'Unread' : 'Read') + ' : 👍');

				e.target.innerHTML = '> ' + (newRead === 'read' ? 'Unread' : 'Read');
				this.context.isRead = (newRead === 'read' ? true : false);
			})
		},
		showMoveFolder: function(e) {
			this.folderModal = true;

			this.modal.oldFolder = this.modal.folderId;
			this.modal.action = 'folder';
		},
		doMoveToFolder: function(e) {

			if (this.modal.oldFolder != this.modal.folderId) { // Not in this folder anymore
				api.updateMail(this, this.modal)
				.then(function(res) {
					if (typeof res === 'undefined') return;
					this.st.alert.success('Moved to a folder.');
					this.houseKeeping(this.modal.folderId);
				})
			}
			this.folderModal = false;
		},
		oneClickToTrash: function(e) {

			this.modal.action = 'trash';

			api.updateMail(this, this.modal)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.st.alert.success('Moved to Trash.');
				this.modal.folderId = res.data; // see line 96 in showMoveFolder()
				this.houseKeeping(res.data);
			})
		},
		houseKeeping: function(folderId) {
			var messageId = this.modal.messageId
			var message = document.getElementsByClassName('mail-' + messageId)[0];

			if (typeof message !== 'undefined') { // We are in folder view
				this.st.mails = this.st.mails.filter(function(e) {
					return e.messageId !== messageId; // remove by value
				})
				if (this.st.mails.length === 0) { // We just removed the last one!
					this.$parent.noMailsLeft = true;
				}
			}else{ // We are in mail view
				this.$route.router.go({ name: 'mail', params: { accountId: this.st.mail.accountId, folderId: folderId, messageId: this.st.mail.messageId } })
			}
		}
	}
}
</script>
