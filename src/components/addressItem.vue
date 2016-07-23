<template>
	<span>
		<div class="m0 p0 border-top">
			<div class="clearfix">
				<div class="left black">
					<a class="btn block h5" @click="editModal = true">
						<span v-show="propAddress.hold">&not;</span> <span class="h6 muted">{{ propAddress.friendlyName }}</span> &lt;{{ propAddress.account }}@{{ propAddress.domain }}&gt;
					</a>
				</div>
			</div>
		</div>
		<modal :show.sync="editModal">
			<h4 slot="header">Edit an Address</h4>
			<span slot="body">
				<form v-on:submit.prevent="doEditAddress" class="h5">
					<label for="hold" class="block col-12 mb2">By default, Dermail will update the recipient's friendly name whenever a new mail comes in.</label>
					<label for="read" class="block col-12 mb2">Do not update:  <input type="checkbox" :value="propAddress.hold" @click="setHold"></label>
					<hr />
					<label for="name" class="block col-12 mb2">Edit name: </label>
					<label for="box" class="block col-12 mb2"><input type="text" class="field block col-12 mb1" :value="propAddress.friendlyName" @input="setName"></label>
					<button type="submit" class="mt2 inline-block btn btn-primary">Update</button>
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
		propAddress: Object
	},
	data: function () {
		return {
			editModal: false,
			address: {
				addressId: this.propAddress.addressId,
				hold: false,
				friendlyName: ''
			}
		}
	},
	methods: {
		setHold: function(e) {
			this.address.hold = e.target.checked;
			this.setHoldInAddress(this.address.addressId, e.target.checked);
		},
		setName: function(e) {
			this.address.friendlyName = e.target.value;
			this.setNameInAddress(this.address.addressId, e.target.value);
		},
		doEditAddress: function() {
			this.loading().go(30);
			this.updateAddress(this.address)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				this.alert().success('Address updated.');
				this.editModal = false;
			})
			.finally(function() {
				this.loading().go(100);
			})
		}
	}
}
</script>
