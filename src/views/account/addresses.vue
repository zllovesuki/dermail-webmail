<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p0">
				<div class="clearfix">
					<div class="left black">
						<span class="btn h4 not-clickable">
							<span class="muted">Name</span> &lt;Address&gt;
						</span>
					</div>
				</div>
			</div>
			<div class="m0 p0" v-if="addresses.length === 0">
				<div class="clearfix">
					<div class="left black">
						<span class="btn h5 not-clickable">
							No addresses found.
						</span>
					</div>
				</div>
			</div>
			<address-item v-for="address in addresses" track-by="addressId" :prop-address="address"></address-item>
		</div>
	</div>
</template>

<script>

var getters = require('../../lib/vuex/getters.js')
var actions = require('../../lib/vuex/actions.js')

module.exports = {
	vuex: {
		getters: getters,
		actions: actions
	},
	compiled: function() {
		this.setTitle('Address Book');
		this.grabDependencies(1)
		.then(function(res) {
			if (typeof res === 'undefined') return;
			this.loading().go(70);
			return this.getAddresses({
				accountId: this.$route.params.accountId
			})
		}.bind(this))
		.finally(function() {
			this.loading().go(100);
		}.bind(this))
	}
}
</script>
