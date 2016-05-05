<template>
	<div>
		<div class="overflow-hidden bg-white rounded mb2">
			<div class="m0 p0">
				<div class="clearfix">
					<div class="left black">
						<span class="btn h4 muted not-clickable">
							account@domain
						</span>
					</div>
					<div class="right">
						<span class="btn h6">
							alias
						</span>
					</div>
				</div>
			</div>
			<div class="m0 p0" v-if="st.accounts.length === 0">
				<div class="clearfix">
					<div class="left black">
						<span class="btn h5 not-clickable">
							Loading account list...
						</span>
					</div>
				</div>
			</div>
			<template v-for="account in st.accounts">
				<div class="m0 p0 border-top">
					<div class="clearfix">
						<div class="left black">
							<a v-link="{ name: 'account', params: { accountId: account.accountId } }" class="btn block h5">
								{{ account.account }} <span class="muted black">@{{ account.domain }}</span>
							</a>
						</div>
						<div class="right">
							<span class="btn h6 muted not-clickable">
								{{ account.alias.join(', ') }}
							</span>
						</div>
					</div>
				</div>
			</template>
		</div>
		<div class="mt2 mb2">
			<div class="overflow-hidden bg-white rounded mb2">
				<div class="m0 p1">
					<div class="clearfix">
						<span class="btn black h5 muted ">Manage: </span>
					</div>
					<!--<div class="clearfix">
						<span class="ml1 btn black h6 muted not-clickable"></span>
					</div>-->
				</div>
				<div class="m0 p2 border-top">
					<div class="clearfix">
						<a class="muted h6 ml1 bold btn btn-outline {{ st.color }}" >Add alias to domain</a>
						<a class="muted h6 ml1 bold btn btn-outline {{ st.color }}" >Add an account</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>

var st = require('../../lib/st.js');

module.exports = {
	data: function() {
		return {
			st: st,
		}
	},
	created: function() {

		if (!this.st.isAuthenticated()) {
			return this.$route.router.go({name: 'login'})
		}

		this.st.loading.go(50);

		var that = this;

		this.st.setTitle('Accounts');

		this.$dispatch('getAccounts', function() {
			that.st.folders = [];
			that.st.loading.go(100);
		});

	}
}
</script>
