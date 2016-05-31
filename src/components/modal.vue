<template>
	<span>
		<div class="modal-mask" @click="close" v-show="show" transition="modal">
			<div class="modal-wrapper">
				<div class="modal-container" @click.stop>

					<div class="modal-header">
						<slot name="header">
							default header
						</slot>
					</div>

					<div class="modal-body">
						<slot name="body">
							default body
						</slot>
					</div>
				</div>
			</div>
		</div>
	</span>
</template>

<script>
module.exports = {
	props: {
		show: {
			type: Boolean,
			required: true,
			twoWay: true
		}
	},
	methods: {
		close: function() {
			this.show = false;
		}
	},
	created: function () {
		document.addEventListener("keydown", (e) => {
			if (this.show && e.keyCode === 27) {
				this.close();
			}
		});
	}
} // http://adamwathan.me/2016/01/04/composing-reusable-modal-dialogs-with-vuejs/: close on clicking outside
</script>

<style>
.modal-mask {
  position: fixed;
  z-index: 98;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .3);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 16em;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
}

.modal-header h3 {
  margin-top: 0;
}

.modal-body {
  margin: 20px 0;
}

/*
 * the following styles are auto-applied to elements with
 * v-transition="modal" when their visiblity is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter, .modal-leave {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave .modal-container {
  transition: all .33s cubic-bezier(.25, .8, .25, 1)
}
</style>
