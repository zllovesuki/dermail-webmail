<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p0">
				<div class="clearfix">
					<div class="left black">
						<span class="btn h4 not-clickable muted">
							Criteria <span class="black"> - Actions</span>
						</span>
					</div>
				</div>
			</div>
			<div class="m0 p0">
				<div class="clearfix">
					<div class="left black">
						<span class="btn muted h5 not-clickable">
							No filters defined.
						</span>
					</div>
				</div>
			</div>
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
	ready: function() {

		this.st.setTitle('Address Book');
		this.st.loading.go(100);
	}
}
</script>
