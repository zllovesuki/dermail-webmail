module.exports = function(Vue) {
	Vue.component('folder-item', require('../components/folderItem.vue'))
	Vue.component('modal', require('../components/modal.vue'))
	Vue.component('mail-menu', require('../components/mailMenu.vue'))
	Vue.component('address-button', require('../components/addressButton.vue'))
	Vue.component('star-button', require('../components/starButton.vue'))
	Vue.component('compose-button', require('../components/composeButton.vue'))
	Vue.component('search', require('../components/search.vue'))
	Vue.component('mail-item', require('../components/mailItem.vue'))
	Vue.component('autoresize-textarea', require('../components/autoresizeTextArea.vue'))
	Vue.component('spam', require('../components/reportSPAM.vue'))
	Vue.component('filter-item', require('../components/filterItem.vue'))
	Vue.component('address-item', require('../components/addressItem.vue'))
}
