<template>
	<section id="container" class="container clearfix">
		<search></search>

		<div class="clearfix mt2">
			<div class="mb2 sm-flex center nowrap">
				<div class="flex-auto block">
					<p class="inline h2">Dermail | <small class="muted" >{{ st.title }}</small>
				</div>
			</div>

			<div class="mn1 center" v-if="st.authenticated">
				<a class="btn button-narrow" v-link="{ name: 'accounts'}">Accounts</a>
				<a class="btn button-narrow" v-link="{ name: 'settingIndex'}">Settings</a>
				<a class="btn button-narrow" @click="doLogout">Logout</a>
			</div>

			<div class="p0 col col-12">
				<router-view transition="fade"></router-view>
			</div>
		</div>
		<audio id="sound" preload="auto">
			<source src="/public/sound/yoda.ogg" type="audio/ogg">
		</audio>
		<compose-button></compose-button>
	</section>
</template>
<script>

var st = require('./lib/st.js')
var api = require('./lib/api.js')

module.exports = {
	data: function () {
		return {
			st: st
		}
	},
	methods: {
		doLogout: function() {
			this.st.setAuthenticated(false);
			this.st.blockLoadingOnce = false;
			api.queue().disconnect();
			this.st.removeToken();
			this.st.alert.success('Logout successfully!');
			this.$route.router.go({name: 'login'});
		}
	},
	events: {
		'getAccounts': function(cb) {
			this.st.loading.go(50);
			api.getAccounts(this)
			.then(function(res) {
				if (typeof res === 'undefined') return;
				var data = res.json();
				this.st.putAccounts(data);
			}.bind(this))
			.finally(function() {
				if (cb) cb();
			})
		}
	}
}
</script>
<style>
hr {
	border: 0;
	height: 1px;
	background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
}

body {
	font-family: "Lato", "Helvetica Neue", "Luxi Sans", "DejaVu Sans", Tahoma, "Hiragino Sans GB", "Microsoft Yahei", sans-serif;
	font-size: 1em;
	line-height: 1.5;
	background-color: #f1f2f3
}

::selection {
  background: #ffb7b7; /* WebKit/Blink Browsers */
}
::-moz-selection {
  background: #ffb7b7; /* Gecko Browsers */
}

ul li {
	list-style-type: none;
}

pre {
	overflow-x: hidden;
}

pre code {
	display: block;
    overflow-x: auto;
    background: white;
    color: #4d4d4c;
    font-family: Menlo, Monaco, Consolas, monospace;
    line-height: 1.25;
    padding: 10px;
}

.clickable {
	cursor: pointer;
}

.not-clickable {
	cursor: default;
}

a.link {
	color: inherit;
	text-decoration: none;
}

img {
	display: block;
	margin: 0 auto;
}

svg{max-width:100%;height:auto}.icon,svg{position:relative;top:.25em}.icon{width:1em;height:1em}

.fade-transition {
	transition: all .5s ease;
}

.fade-enter, .fade-leave {
	opacity: 0;
	transform: translate3d(10px, 0, 0);
}

.x-scrollable {
	overflow-x: auto;
	overflow-y: hidden;
}

.y-scrollable {
	overflow-x: hidden;
	overflow-y: auto;
}
</style>
