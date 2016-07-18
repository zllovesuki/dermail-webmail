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
			<div class="m0 p0" v-if="st.addresses.length === 0">
				<div class="clearfix">
					<div class="left black">
						<span class="btn h5 not-clickable">
							No addresses found.
						</span>
					</div>
				</div>
			</div>
			<address-item v-for="address in st.addresses" :address="address"></address-item>
		</div>
	</div>
</template>

<script>

var st = require('../../lib/st.js');
var api = require('../../lib/api.js');

module.exports = {
	data: function() {
		return {
			st: st
		}
	},
	compiled: function() {
		this.st.setTitle('Address Book');
		api.grabDependencies(1, this)
		.then(function(data) {
			this.st.loading.go(70);
			api.getAddresses(this, {
				accountId: this.$route.params.accountId
			})
			.then(function(res) {
				if (typeof res === 'undefined') return;
				var data = res.json();
				this.st.putAddresses(data);
			})
			.finally(function() {
				this.st.loading.go(100);
			})
		}.bind(this))
	}
}
</script>
