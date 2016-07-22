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
var getters = require('../lib/vuex/getters.js')
var actions = require('../lib/vuex/actions.js')

module.exports = {
	data: function() {
		return {
			credentials: {
				username: '',
				password: ''
			},
			submitButtonDisabled: false
		}
	},
	vuex: {
		getters: getters,
		actions: actions
	},
	computed: {
		usernameNotFilled: function() {
			return this.credentials.username < 1;
		},
		passwordNotFilled: function() {
			return this.credentials.password < 1;
		}
	},
	methods: {
		doLogin: function(e) {
			this.submitButtonDisabled =  true;
			this.loading().go(30);
			return this.login(this.credentials)
			.then(function(res) {
				if (res === true) {
					this.$route.router.go({ name: 'accounts' })
					return;
					return this.getS3()
					.catch(function(res) {
						console.log(res);
						this.alert().error('Unable to fetch S3 information, attachment functionalities may be impacted.');
					}.bind(this))
					.finally(function() {
						return true;
					}.bind(this))
	/*				this.alert().success('Welcome back!');
					this.$route.router.go({ name: 'accounts' })
					*/
				}
			}.bind(this))
			.finally(function() {
				this.submitButtonDisabled = false;
				this.loading().go(100);
			}.bind(this))
		},
		resetForm: function() {
			this.credentials = {
				username: '',
				password: ''
			}
		}
	},
	ready: function() {
		if (this.isAuthenticated()) {
			return this.$route.router.go({ name: 'accounts' })
		}else{
			this.setTitle('Login');
		}
	}
}
</script>
