<template>
	<div>
		<div class="flex flex-center p2" style="min-height: 128px;">
			<div class="p2 mx-auto border-box bg-white">
				<div class="m1 p2 white" style="min-width: 14em;">
					<div class="clearfix">
						<div class="left">
							<h1 class="h2 m0 black">{{ title }}</h1>
						</div>
					</div>
				</div>
				<form v-on:submit.prevent="doLogin">
					<div class="p2 border-top">
						<label>Username <small v-if="usernameNotFilled" class="red">*</small></label>
						<input type="text" class="block col-12 mb1 field" v-model="credentials.username">
						<label>Password <small v-if="passwordNotFilled" class="red">*</small></label>
						<input type="password" class="block col-12 mb1 field" v-model="credentials.password">
					</div>
					<div class="p2 border-top">
						<div class="clearfix">
							<button type="submit" class="h6 btn btn-primary" :disabled="submitButtonDisabled || usernameNotFilled || passwordNotFilled">
								Sign In
							</button>
							<button type="reset" class="h6 btn btn-primary black bg-gray" v-on:click="resetForm">
								Reset
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>
<script>

var st = require('../lib/st.js');
var api = require('../lib/api.js');

module.exports = {
	data: function() {
		return {
			st: st,
			credentials: {
				username: '',
				password: ''
			},
			submitButtonDisabled: false
		}
	},
	computed: {
		usernameNotFilled: function() {
			return this.credentials.username < 1;
		},
		passwordNotFilled: function() {
			return this.credentials.password < 1;
		},
		title: function() {
			return this.st.title;
		}
	},
	methods: {
		disableSubmitButton: function() {
			this.submitButtonDisabled = true;
		},
		enableSubmitButton: function() {
			this.submitButtonDisabled = false;
		},
		doLogin: function(e) {
			this.disableSubmitButton();
			this.st.loading.go(30);
			api.login(this, this.credentials). then(function(res) {
				if (res.data.hasOwnProperty('token')) {
					this.st.setToken(res.data.token);
					this.st.setAuthenticated(true);
					api.queue().connect(this);

					this.st.alert.success('Welcome back!');
					this.$route.router.go({ name: 'accounts' })
				};
			},
			function (res) {
				this.st.loading.go(100);
				if (res.data.hasOwnProperty('message')) {
					this.st.alert.error(res.data.message);
				}else{
					this.st.alert.error(res.statusText);
				}
				this.enableSubmitButton();
			});
		},
		resetForm: function() {
			this.credentials = {
				username: '',
				password: ''
			}
		}
	},
	ready: function() {
		if (this.st.isAuthenticated()) {
			return this.$route.router.go({ name: 'accounts' })
		}else{
			this.st.setTitle('Login');
			if (!this.st.blockLoadingOnce) this.st.loading.go(100);
		}
	}
}
</script>
