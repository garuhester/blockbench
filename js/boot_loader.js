
CustomTheme.setup()

StateMemory.init('dialog_paths', 'object')

initCanvas()
animate()

Blockbench.browser = 'electron'
if (isApp === false) {
	if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
		Blockbench.browser = 'firefox'
	} else if (!!window.chrome && !!window.chrome.webstore) {
		Blockbench.browser = 'chrome'
	} else if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
		Blockbench.browser = 'opera'
	} else if (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))) {
		Blockbench.browser = 'safari'
	} else if (!!document.documentMode) {
		Blockbench.browser = 'internet_explorer'
	} else if (!!window.chrome && window.navigator.userAgent.toLowerCase().includes('edg')) {
		Blockbench.browser = 'edge'
	} else if (!!window.StyleMedia) {
		Blockbench.browser = 'proprietary_edge'
	} else if (!!window.chrome && !window.chrome.webstore) {
		Blockbench.browser = 'chromium'
	}
	if (navigator.appVersion.indexOf("Win") != -1) 	 Blockbench.operating_system = 'Windows';
	if (navigator.appVersion.indexOf("Mac") != -1) 	 Blockbench.operating_system = 'MacOS';
	if (navigator.appVersion.indexOf("Linux") != -1) Blockbench.operating_system = 'Linux';
	if (['proprietary_edge', 'internet_explorer'].includes(Blockbench.browser)) {
		alert(capitalizeFirstLetter(Blockbench.browser)+' does not support Blockbench')
	}
	$('.local_only').remove()
} else {
	$('.web_only').remove()
}
BARS.setupActions()
BARS.setupToolbars()
BARS.setupVue()
MenuBar.setup()
translateUI()

console.log(`Three.js r${THREE.REVISION}`)
console.log('%cBlockbench ' + appVersion + (isApp
	? (' Desktop (' + Blockbench.operating_system +')')
	: (' Web ('+capitalizeFirstLetter(Blockbench.browser) + (Blockbench.isPWA ? ', PWA)' : ')'))),
	'border: 2px solid #3e90ff; padding: 4px 8px; font-size: 1.2em;'
)
var startups = parseInt(localStorage.getItem('startups')||0);
localStorage.setItem('startups', startups+1);

document.getElementById('blackout').addEventListener('click', event => {
	if (typeof open_interface.cancel == 'function') {
		open_interface.cancel(event);
	} else if (typeof open_interface == 'string' && open_dialog) {
		$('dialog#'+open_dialog).find('.cancel_btn:not([disabled])').trigger('click');
	}
})

if (isApp) {
	updateRecentProjects()
}

if (!isApp) {
	async function registerSW() {
		if ('serviceWorker' in navigator) {
			try {
				await navigator.serviceWorker.register('./service_worker.js');
			} catch (err) {
				console.log(err)
			}
		}
	}
	registerSW();
}

if (!Blockbench.isWeb || !Blockbench.isPWA) {
	$.ajaxSetup({ cache: false });
}

Blockbench.on('before_closing', (event) => {
	if (!Blockbench.hasFlag('no_localstorage_saving')) {
		Settings.saveLocalStorages()
	}
})

setInterval(function() {
	Prop.fps = framespersecond;
	framespersecond = 0;
}, 1000)

main_uv = new UVEditor('main_uv', false, true)
main_uv.setToMainSlot()

onVueSetup.funcs.forEach((func) => {
	if (typeof func === 'function') {
		func()
	}
})

updateProjectResolution()

setupInterface()
setupDragHandlers()

if (isApp) {
	initializeDesktopApp();
} else {
	initializeWebApp();
}

localStorage.setItem('last_version', Blockbench.version);

Modes.options.start.select()

Promise.any([
	loadInstalledPlugins(),
	new Promise(resolve => setTimeout(resolve, 1200))
]).then(plugins => {
	if (isApp) {
		loadOpenWithBlockbenchFile();
	} else {
		loadInfoFromURL();
	}
})

document.getElementById('page_wrapper').classList.remove('hidden')

Blockbench.setup_successful = true;
