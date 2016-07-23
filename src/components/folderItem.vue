<template>
	<span>
		<div class="m0 p0" v-bind:class="{ 'border-top': index > 0 }">
			<div class="clearfix">
				<div class="left black">
					<a v-link="{ name: 'folder', params: { accountId: propFolder.accountId, folderId: propFolder.folderId } }" class="btn h5">
						{{ propFolder.displayName }}
						<span v-if="propFolder.count">({{ propFolder.count }})</span>
						-
						<span class="desc-{{ propFolder.folderId }} h5 muted black">
							 {{ propFolder.description }}
						</span>
					</a>
					<span class="edit-group-{{ propFolder.folderId }} hide">
						<a class="btn h3" @click="showDeleteFolder" v-if="propFolder.mutable">
							&times;
						</a>
						<a class="btn h3" @click="showEditFolder" v-if="propFolder.mutable">
							&#9998;
						</a>
						<a class="btn h3" @click="showAddFolder" v-if="propFolder.displayName != 'Trash'">
							&#43;
						</a>
					</span>
				</div>
				<div class="right">
					<a class="btn gray h3" @click="flipMenuAndDescription" v-if="propFolder.mutable || propFolder.displayName.toLowerCase() == 'inbox'">
						&#8942;
					</a>
					<a class="btn gray h4" @click="showTruncateFolder" v-if="hideInMoveOptions.indexOf(propFolder.displayName.toLowerCase()) !== -1">
						&#8709;
					</a>
				</div>
			</div>
		</div>
		<ol class="m0" v-if="propFolder.child.length > 0"><folder-item v-for="folder in propFolder.child" :prop-folder="folder" keep-alive></folder-item></ol>
		<modal :show.sync="truncateModal">
			<h4 slot="header">Truncate a Folder</h4>
			<span slot="body">
				<form v-on:submit.prevent="doTruncateFolder" class="h5">
					<label for="displayName">Are you sure to truncate the folder <span class="bold">{{ propFolder.displayName }}</span>?</label>
					<hr />
					<span class="block mb2">All mails under this folder will be <span class="bold">deleted</span>.</span>
					<button :disabled="buttonDisabled" type="submit" class="block btn btn-outline red">Truncate</button>
				</form>
			</span>
		</modal>
		<modal :show.sync="deleteModal">
			<h4 slot="header">Delete a Folder</h4>
			<span slot="body">
				<form v-on:submit.prevent="doDeleteFolder" class="h5">
					<label for="displayName">Are you sure to delete folder <span class="bold">{{ propFolder.displayName }}</span>?</label>
					<hr />
					<span class="block mb1">All mails under this folder will be moved to "Trash".</span>
					<span class="block mb2">If this folder is a parent folder, you need to delete the children folders first.</span>
					<button :disabled="buttonDisabled" type="submit" class="block btn btn-outline red">Delete</button>
				</form>
			</span>
		</modal>
		<modal :show.sync="editModal">
			<h4 slot="header">Edit a Folder</h4>
			<span slot="body">
				<form v-on:submit.prevent="doEditFolder" class="h5">
					<label for="displayName">Display Name: </label>
					<input type="text" class="field block col-12 mb1" v-model="modal.displayName">
					<label for="Description">Description: </label>
					<input type="text" class="field block col-12 mb1" v-model="modal.description">
					<label for="parentFolder">Nested Under:</label>
					<select class="block col-12 mb2 field" v-model="modal.parent">
						<option value="/root">(Root)</option>
						<option v-for="f in flatFolders" v-if="f.displayName != 'Trash' && f.folderId != propFolder.folderId" value="{{ f.folderId }}">{{ f.displayName }}</option>
					</select>
					<button :disabled="buttonDisabled" type="submit" class="btn btn-primary">Edit</button>
				</form>
			</span>
		</modal>
		<modal :show.sync="addModal">
			<h4 slot="header">Add a Folder</h4>
			<span slot="body">
				<form v-on:submit.prevent="doAddFolder" class="h5">
					<label for="displayName">Display Name: </label>
					<input type="text" class="field block col-12 mb1" v-model="modal.displayName">
					<label for="Description">Description: </label>
					<input type="text" class="field block col-12 mb1" v-model="modal.description">
					<label for="parentFolder">Nested Under:</label>
					<select class="block col-12 mb2 field" v-model="modal.parent">
						<option value="/root">(Root)</option>
						<option v-for="f in flatFolders" v-if="f.displayName != 'Trash'" value="{{ f.folderId }}">{{ f.displayName }}</option>
					</select>
					<button :disabled="buttonDisabled" type="submit" class="btn btn-primary">Add</button>
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
		propFolder: Object,
		index: {
			type: Number,
			default: 1
		}
	},
	data: function () {
		return {
			buttonDisabled: false,
			truncateModal: false,
			deleteModal: false,
			editModal: false,
			addModal: false,
			modal: {
				accountId: this.route.params.accountId,
				folderId: '',
				displayName: '',
				description: '',
				parent: '/root',
				action: ''
			},
			menuVisible: false
		}
	},
	methods: {
		flipMenuAndDescription: function() {
			var menuVisible = this.menuVisible;
			var folderId = this.propFolder.folderId;
			var menuBlock = document.getElementsByClassName('edit-group-' + folderId)[0];
			var descBlock = document.getElementsByClassName('desc-' + folderId)[0];

			var menuClass = 'edit-group-' + folderId + '';
			var descClass = 'desc-' + folderId + ' h5 muted black';

			if (menuVisible === false) {
				descClass += ' hide';
				this.menuVisible = true;
			}else{
				menuClass += ' hide';
				this.menuVisible = false;
			}

			menuBlock.className = menuClass;
			descBlock.className = descClass;
		},
		setModal: function(empty) {
			empty = empty || false;
			this.modal.folderId = empty ? '' : this.propFolder.folderId;
			this.modal.displayName = empty ? '' : this.propFolder.displayName;
			this.modal.description = empty ? '' : this.propFolder.description;
			this.modal.parent = this.propFolder.parent || '/root';
		},
		showTruncateFolder: function(e) {
			this.truncateModal = true;
			this.setModal(false);
			this.modal.action = 'truncateFolder';
		},
		showDeleteFolder: function(e) {
			this.deleteModal = true;
			this.setModal(false);
			this.modal.action = 'deleteFolder';
		},
		showEditFolder: function(e) {
			this.editModal = true;

			this.setModal(false);

			this.modal.action = 'updateFolder';
		},
		showAddFolder: function(e) {
			this.addModal = true;

			this.setModal(true);

			this.modal.action = 'addFolder';
		},
		doTruncateFolder: function(e) {
			this.alert()
			.okBtn("Yes")
			.cancelBtn("No")
			.confirm('Are you sure to truncate the folder?')
			.then(function(resolved) {
				resolved.event.preventDefault();

				if (resolved.buttonClicked !== 'ok') return;

				this.buttonDisabled = true;

				this.updateFolder(this.modal)
				.then(function(res) {
					if (typeof res === 'undefined') return;
					this.alert().success('Action "truncateFolder" queued.');
					this.truncateModal = false;
					return this.houseKeeping();
				}.bind(this))
				.then(function() {
					this.buttonDisabled = false;
				}.bind(this))
			}.bind(this))
		},
		doDeleteFolder: function(e) {
			this.alert()
			.okBtn("Yes")
			.cancelBtn("No")
			.confirm('Are you sure to delete the folder?')
			.then(function(resolved) {
				resolved.event.preventDefault();

				if (resolved.buttonClicked !== 'ok') return;

				this.buttonDisabled = true;

				this.updateFolder(this.modal)
				.then(function(res) {
					if (typeof res === 'undefined') return;
					this.alert().success('Folder deleted.');
					this.deleteModal = false;
					return this.houseKeeping();
				}.bind(this))
				.then(function() {
					this.buttonDisabled = false;
				}.bind(this))
			}.bind(this))
		},
		doEditFolder: function(e) {
			this.buttonDisabled = true;
			this.updateFolder(this.modal)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.alert().success('Folder updated.');
				return this.houseKeeping();
			})
			.then(function() {
				this.buttonDisabled = false;
			})
		},
		doAddFolder: function(e) {
			this.buttonDisabled = true;
			this.updateFolder(this.modal)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.alert().success('New folder created.');
				this.addModal = false;
				return this.houseKeeping();
			})
			.then(function() {
				this.buttonDisabled = false;
			})
		},
		houseKeeping: function() {
			return this.getFoldersInAccount()
			.then(function() {
				this.loading().go(100);
			}.bind(this))
		}
	}
}
</script>

<style>
.editing {
	display: none;
}
.peritem:hover .editing {
	display: inline-block;
}
</style>
