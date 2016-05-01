<template>
	<div>
		<div class="m0 p0 border-top">
			<div class="clearfix">
				<div class="left black">
					<a class="filter-{{ filter.filterId }} btn block h5">
						<span v-if="filter.pre.from">from:({{ filter.pre.from.join(', ') }})</span>
						<span v-if="filter.pre.to">to:({{ filter.pre.to.join(', ') }})</span>
						<span v-if="filter.pre.subject">subject:({{ filter.pre.subject.join(', ') }})</span>
						<span v-if="filter.pre.contain"> {{ filter.pre.contain.join(', ') }}</span>
						<span v-if="filter.pre.exclude"> -{{ filter.pre.exclude.join(', ') }}</span>
						<span class="muted black"> -
							<span class="h6 not-clickable">
								<span v-if="filter.post.folder">Move to "{{ filter.post.folder.displayName }}", </span>
								<span v-if="filter.post.doNotNotify">{{ filter.post.doNotNotify ? 'Do not notify' : 'Notify' }}, </span>
								<span v-if="filter.post.markRead">{{ filter.post.markRead ? 'Mark Read' : 'Do not mark Read' }}, </span>
							</span>
						</span>
					</a>
				</div>
				<div class="right black">
					<a class="btn h3" @click="showDeleteFilter">
						&times;
					</a>
				</div>
			</div>
		</div>
		<modal :show.sync="deleteModal">
			<h4 slot="header">Delete a Filter</h4>
			<span slot="body">
				<form v-on:submit.prevent="doDeleteFilter" class="h5">
					<label for="displayName">Are you sure to delete filter?</label>
					<button class="mt2 block btn btn-outline red">Delete</button>
				</form>
			</span>
		</modal>
	</div>
</template>

<script>

var st = require('../lib/st.js');
var api = require('../lib/api.js');

module.exports = {
	props: {
		filter: Object,
		deleteModal: false
	},
	data: function() {
		return {
			st: st
		}
	},
	methods: {
		doDeleteFilter: function() {
			api.modifyFilter(this, {
				accountId: this.$route.params.accountId,
				filterId: this.filter.filterId,
				op: 'delete'
			}).then(function(res) {
				this.deleteModal = false;
				this.st.alert.success('Filter deleted.');
				api.grabFilters(this);
			}, function(res) {
				if (res.data.hasOwnProperty('message')) {
					this.st.alert.error(res.data.message);
					this.st.loading.go(100);
				}
			});
		},
		showDeleteFilter: function(e) {
			this.deleteModal = true;
		}
	}
}
</script>
