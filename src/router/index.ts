import type {RouteRecordRaw} from 'vue-router'
export const routes:RouteRecordRaw[]=[{path:'/',component:()=>import('../views/Entry.vue')},{path:'/:locale(en|ar)/shop',component:()=>import('../views/Shop.vue')},{path:'/:locale(en|ar)/story',component:()=>import('../views/Story.vue')}]
