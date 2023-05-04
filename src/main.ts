import './style.css'
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { useNodeStore } from './node/store';
import { createApp } from 'vue';
const app = createApp(App)

const pinia = createPinia()


// app.mount('#app')
router.beforeEach((to, from, next) => {
    const nodeStore = useNodeStore()
    to.meta.node = useNodeStore().getNode;
    next()
  })

app.use(pinia)
app.use(router)
app.mount('#app')
