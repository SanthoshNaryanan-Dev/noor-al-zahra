import {ViteSSG} from 'vite-ssg'
import {createPinia} from 'pinia'
import App from './App.vue'
import {routes} from './router'
import {makeI18n} from './locales'
import './style.css'
export const createApp=ViteSSG(App,{routes,base:import.meta.env.BASE_URL,scrollBehavior:()=>({top:0})},({app})=>{app.use(createPinia());app.use(makeI18n())})
