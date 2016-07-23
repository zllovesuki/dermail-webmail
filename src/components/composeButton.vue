<template>
	<span>
		<div class="fixed top-0 left-0 m2" v-if="route.params && route.params.accountId && !isInCompose">
			<a class="btn block" @click="goToCompose">
				<mail-icon></mail-icon>
			</a>
		</div>
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
	computed: {
		isInCompose: function() {
			return this.route.name === 'compose'
		}
	},
	methods: {
		goToCompose: function() {
			return this.route.router.go({ name: 'compose', params: { accountId: this.route.params.accountId } })
		}
	}
}
</script>
