<script setup lang="ts">
import {computed,nextTick,onMounted,onUnmounted,ref,watch} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {useLanguage} from './stores/language'
import {useI18n} from 'vue-i18n'
const route=useRoute(),router=useRouter(),language=useLanguage(),sound=ref(false),{locale}=useI18n({useScope:'global'})
watch(()=>language.locale,v=>{locale.value=v},{immediate:true})
const ar=computed(()=>language.locale==='ar')
watch(()=>route.params.locale,v=>{if(v==='ar'||v==='en')language.set(v)},{immediate:true})
function select(v:string){if(v==='story'&&matchMedia('(prefers-reduced-motion: reduce)').matches)v='shop';try{sessionStorage.setItem('noor-choice',v)}catch{/* Session storage may be blocked. */};router.push(`/${language.locale}/${v}`)}
function toggleLanguage(){const next=ar.value?'en':'ar';language.set(next);if(route.path!=='/')router.push(`/${next}/${route.path.endsWith('/story')?'story':'shop'}`)}
let revealObserver:IntersectionObserver|undefined;watch(()=>route.path,async()=>{await nextTick();if(!revealObserver)return;document.querySelectorAll('.shop section').forEach(el=>{el.classList.add('reveal');revealObserver?.observe(el)})});onMounted(()=>{const analyticsDomain=import.meta.env.VITE_PLAUSIBLE_DOMAIN;if(analyticsDomain&&/^[a-z0-9.-]+$/i.test(analyticsDomain)){const script=document.createElement('script');script.defer=true;script.dataset.domain=analyticsDomain;script.src='https://plausible.io/js/script.js';document.head.appendChild(script)}if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');revealObserver?.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.shop section').forEach(el=>{el.classList.add('reveal');revealObserver?.observe(el)})}if(route.path.endsWith('/story')&&matchMedia('(prefers-reduced-motion: reduce)').matches){select('shop');return}if(route.path==='/'){let choice='';try{choice=sessionStorage.getItem('noor-choice')||''}catch{/* Session storage may be blocked. */};const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced)select('shop');else if(choice==='shop'||choice==='story')select(choice)}})
onUnmounted(()=>revealObserver?.disconnect())
</script>
<template><div :dir="ar?'rtl':'ltr'" :lang="language.locale"><div class="global-controls"><button @click="toggleLanguage" class="text-button" aria-label="Switch language">{{ar?'EN':'العربية'}}</button></div><router-view v-slot="{Component}"><component :is="Component" :ar="ar" :sound="sound" @shop="select('shop')" @story="select('story')" @sound="sound=!sound" /></router-view></div></template>
