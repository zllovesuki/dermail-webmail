<template>
	<span>
		<div class="m0 p0 border-bottom">
			<div class="clearfix">
				<div class="left black">
					<a v-link="{ name: 'folder', params: { accountId: folder.accountId, folderId: folder.folderId } }" class="btn h5">
						{{ folder.displayName }}
						<span v-if="folder.count">({{ folder.count }})</span>
						-
						<span class="desc-{{ folder.folderId }} h5 muted black">
							 {{ folder.description }}
						</span>
					</a>
					<span class="edit-group-{{ folder.folderId }} hide">
						<a class="btn h3" @click="showDeleteFolder" v-if="folder.mutable">
							&times;
						</a>
						<a class="btn h3" @click="showEditFolder" v-if="folder.mutable">
							&#9998;
						</a>
						<a class="btn h3" @click="showAddFolder" v-if="folder.displayName != 'Trash'">
							&#43;
						</a>
					</span>
				</div>
				<div class="right">
					<a class="btn gray h3" @click="flipMenuAndDescription" v-if="folder.mutable || folder.displayName.toLowerCase() == 'inbox'">
						&#8942;
					</a>
					<a class="btn gray h4" @click="showTruncateFolder" v-if="st.hideInMoveOptions.indexOf(folder.displayName.toLowerCase()) !== -1">
						&#8709;
					</a>
				</div>
			</div>
		</div>
		<ul class="m0"><folder-item v-for="folder in folder.child" :folder="folder"></folder-item></ul>
		<modal :show.sync="truncateModal">
			<h4 slot="header">Truncate a Folder</h4>
			<span slot="body">
				<form v-on:submit.prevent="doTruncateFolder" class="h5">
					<label for="displayName">Are you sure to truncate the folder <span class="bold">{{ modal.displayName }}</span>?</label>
					<hr />
					<span class="block">All mails under this folder will be <span class="bold">deleted</span>.</span>
					<button class="mt2 block btn btn-outline red">Truncate</button>
				</form>
			</span>
		</modal>
		<modal :show.sync="deleteModal">
			<h4 slot="header">Delete a Folder</h4>
			<span slot="body">
				<form v-on:submit.prevent="doDeleteFolder" class="h5">
					<label for="displayName">Are you sure to delete folder <span class="bold">{{ modal.displayName }}</span>?</label>
					<hr />
					<span class="block">All mails under this folder will be moved to "Trash".</span>
					<span class="block">If this folder is a parent folder, you need to delete the children folders first.</span>
					<button class="mt2 block btn btn-outline red">Delete</button>
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
						<option v-for="f in st._folders" v-if="f.displayName != 'Trash' && f.folderId != modal.folderId" value="{{ f.folderId }}">{{ f.displayName }}</option>
					</select>
					<button class="btn btn-primary">Edit</button>
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
						<option v-for="f in st._folders" v-if="f.displayName != 'Trash'" value="{{ f.folderId }}">{{ f.displayName }}</option>
					</select>
					<button class="btn btn-primary">Add</button>
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
		folder: Object
	},
	data: function () {
		return {
			st: st,
			truncateModal: false,
			deleteModal: false,
			editModal: false,
			addModal: false,
			modal: {
				accountId: this.$route.params.accountId,
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
			var folderId = this.folder.folderId;
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
		setModal: function(setToEmpty) {
			var empty = setToEmpty || false;
			this.modal.folderId = empty ? '' : this.folder.folderId;
			this.modal.displayName = empty ? '' : this.folder.displayName;
			this.modal.description = empty ? '' : this.folder.description;
			this.modal.parent = this.folder.parent || '/root';
		},
		showTruncateFolder: function(e) {
			this.truncateModal = true;

			this.setModal();

			this.modal.action = 'truncateFolder';
		},
		showDeleteFolder: function(e) {
			this.deleteModal = true;

			this.setModal();

			this.modal.action = 'deleteFolder';
		},
		showEditFolder: function(e) {
			this.editModal = true;

			this.setModal();

			this.modal.action = 'updateFolder';
		},
		showAddFolder: function(e) {
			this.addModal = true;

			this.setModal(true);

			this.modal.action = 'addFolder';
		},
		doTruncateFolder: function(e) {

			var that = this;
			this.st.alert.confirm('Are you SURE?', function() {
				api.updateFolder(that, that.modal).then(function(res) {
					that.st.alert.success('Folder truncated.');
					that.houseKeeping();
					that.truncateModal = false;
				}, function(res) {
					if (res.data.hasOwnProperty('message')) {
						that.st.alert.error(res.data.message);
					}
				});
			}, function() {

			})
		},
		doDeleteFolder: function(e) {

			var that = this;
			this.st.alert.confirm('Are you SURE?', function() {
				api.updateFolder(that, that.modal).then(function(res) {
					that.st.alert.success('Folder deleted.');
					that.houseKeeping();
					that.deleteModal = false;
				}, function(res) {
					if (res.data.hasOwnProperty('message')) {
						that.st.alert.error(res.data.message);
					}
				});
			}, function() {

			})
		},
		doEditFolder: function(e) {
			api.updateFolder(this, this.modal).then(function(res) {
				this.st.alert.success('Folder updated.');
				this.houseKeeping();
				this.editModal = false;
			}, function(res) {
				if (res.data.hasOwnProperty('message')) {
					this.st.alert.error(res.data.message);
				}
			});
		},
		doAddFolder: function(e) {

			api.updateFolder(this, this.modal).then(function(res) {
				this.st.alert.success('New folder added.');
				this.houseKeeping();
				this.addModal = false;
			}, function(res) {
				if (res.data.hasOwnProperty('message')) {
					this.st.alert.error(res.data.message);
				}
			});
		},
		houseKeeping: function() {
			var that = this;
			this.$dispatch('getFoldersInAccount', function() {
				that.st.loading.go(100);
			});
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
