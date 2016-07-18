<template>
	<span>
		<div class="m0 p0 border-top">
			<div class="clearfix">
				<div class="left black">
					<a class="btn block h5" @click="editModal = true">
						<span v-show="address.hold">&not;</span> <span class="h6 muted">{{ address.friendlyName }}</span> &lt;{{ address.account }}@{{ address.domain }}&gt;
					</a>
				</div>
			</div>
		</div>
		<modal :show.sync="editModal">
			<h4 slot="header">Edit an Address</h4>
			<span slot="body">
				<form v-on:submit.prevent="doEditAddress" class="h5">
					<label for="hold" class="block col-12 mb2">By default, Dermail will update the recipient's friendly name whenever a new mail comes in.</label>
					<label for="read" class="block col-12 mb2">Do not update:  <input type="checkbox" v-model="address.hold"></label>
					<hr />
					<label for="name" class="block col-12 mb2">Edit name: </label>
					<label for="box" class="block col-12 mb2"><input type="text" class="field block col-12 mb1" v-model="address.friendlyName"></label>
					<button type="submit" class="mt2 inline-block btn btn-primary">Update</button>
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
		address: Object
	},
	data: function () {
		return {
			st: st,
			editModal: false
		}
	},
	methods: {
		doEditAddress: function() {
			this.st.loading.go(30);
			api.updateAddress(this, this.address)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.st.alert.success('Address updated.');
				this.editModal = false;
			})
			.finally(function() {
				this.st.loading.go(100);
			})
		}
	}
}
</script>
