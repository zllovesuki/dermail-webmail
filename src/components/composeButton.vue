<template>
	<span>
		<div class="fixed top-0 left-0 m2" v-if="$route.params.accountId && !isInCompose">
			<a class="btn block" @click="goToCompose">
				<mail-icon></mail-icon>
			</a>
		</div>
	</span>
</template>

<script>

var st = require('../lib/st.js');

module.exports = {
	data: function() {
		return {
			st: st
		}
	},
	computed: {
		isInCompose: function() {
			return this.$route.fullPath === '/accounts/:accountId/compose'
		}
	},
	methods: {
		goToCompose: function() {
			return this.$route.router.go({ name: 'compose', params: { accountId: this.$route.params.accountId } })
		}
	}
}
</script>
