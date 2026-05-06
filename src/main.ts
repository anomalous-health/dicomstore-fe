import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// PrimeVue
// Theme is loaded dynamically from localStorage (pv-theme key). We avoid importing a fixed theme so user can switch at runtime.
import '../src/assets/style.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

// Components
import { registerPrimeVueComponents } from './plugins/primevue'

const app = createApp(App)

registerPrimeVueComponents(app)
app.use(router)

app.mount('#app')

// Ensure selected PrimeVue theme is applied early to reduce FOUC.
try {
	const savedTheme = localStorage.getItem('pv-theme') || 'lara-light-blue'
	let themeLink = document.getElementById('theme-link') as HTMLLinkElement | null
	if (!themeLink) {
		themeLink = document.createElement('link')
		themeLink.id = 'theme-link'
		themeLink.rel = 'stylesheet'
		document.head.appendChild(themeLink)
	}
	themeLink.href = `/node_modules/primevue/resources/themes/${savedTheme}/theme.css`
} catch (e) {
	// ignore when not running in browser or if access to localStorage/document is not available
}
