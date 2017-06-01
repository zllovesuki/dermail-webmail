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
        <a class="h6 bold mxn1 btn red" @click.prevent="showDeleteModal" v-if="folder.displayName.toLowerCase() === 'trash'">
			> Delete Permanently
		</a>
		<modal :show.sync="folderModal">
			<h4 slot="header">Move to a Folder</h4>
			<span slot="body">
				<form v-on:submit.prevent="doMoveToFolder" class="h5">
					<label for="folder">Move to:</label>
					<select class="block col-12 mb2 field" v-model="modal.folderId">
						<option v-for="f in flatFolders" track-by="folderId" v-show="hideInMoveOptions.indexOf(f.displayName.toLowerCase()) === -1" value="{{ f.folderId }}">{{ f.displayName }}</option>
					</select>
					<button :disabled="buttonDisabled" class="btn btn-primary">Move</button>
				</form>
			</span>
		</modal>
        <modal :show.sync="deleteModal">
			<h4 slot="header">Delete a message permanently</h4>
			<span slot="body">
				<form v-on:submit.prevent="removeOnePermanently" class="h5">
					<label for="displayName" class="mb2">Are you sure to delete message with:
    					<span class="block mb1">Subject: <span class="bold">{{ context.subject }}</span></span>
                        <span class="block mb2">Body: <span class="bold">{{ context.text }}</span></span>
                    </label>
					<button :disabled="buttonDisabled" type="submit" class="block btn btn-outline red">Yes, I'm sure</button>
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
            deleteModal: false,
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
			var changeReadTo = (newRead === 'read' ? true : false);

			this.updateMailRead(accountId, messageId, changeReadTo, function() {
				this.alert().success((newRead !== 'read' ? 'Unread' : 'Read') + ' : 👍');

				this.hide = false;
			}.bind(this));
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
                return res.text();
            })
            .then(function(data) {
				return this.mailHouseKeeping(data, this.modal.messageId)
				.then(function() {
					this.modal.folderId = data; // see line 96 in showMoveFolder()
					this.alert().success('Moved to Trash.');
				}.bind(this))
			}.bind(this))
			.finally(function() {
				this.hide = false;
			}.bind(this))
		},
        showDeleteModal: function(e) {
            this.deleteModal = true;
            this.modal.action = 'delete';
        },
        removeOnePermanently: function(e) {
            this.alert()
			.okBtn("Yes")
			.cancelBtn("No")
			.confirm('Are you sure to delete the message?')
			.then(function(resolved) {
				resolved.event.preventDefault();

				if (resolved.buttonClicked !== 'ok') return;

				this.buttonDisabled = true;

                return this.updateMail(this.modal)
                .then(function(res) {
                    if (typeof res === 'undefined') return;
                    this.deleteModal = false;
                    return this.mailHouseKeeping(this.modal.folderId, this.modal.messageId)
                    .then(function() {
                        this.alert().success('Deleting message queued.');
                    }.bind(this))
                })
                .then(function() {
                    this.buttonDisabled = false;
                }.bind(this))
			}.bind(this))
        }

	}
}
</script>
