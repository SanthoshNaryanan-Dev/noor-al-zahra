import {defineStore} from 'pinia'
export const useLanguage=defineStore('language',{state:()=>({locale:'en' as 'en'|'ar'}),actions:{set(value:'en'|'ar'){this.locale=value;if(typeof document!=='undefined'){document.documentElement.lang=value;document.documentElement.dir=value==='ar'?'rtl':'ltr'}}}})
