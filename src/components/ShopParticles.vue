<script setup lang="ts">
import {onMounted,onUnmounted,ref} from 'vue'
const props=withDefaults(defineProps<{density?:number}>(),{density:64})
const canvas=ref<HTMLCanvasElement|null>(null)
let stop=()=>{}
onMounted(()=>{
 const c=canvas.value!,parent=c.parentElement,ctx=c.getContext('2d');if(!parent||!ctx||matchMedia('(prefers-reduced-motion: reduce)').matches)return
 const low=(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=2)||(navigator as Navigator & {deviceMemory?:number}).deviceMemory===1
 const count=low?18:props.density
 const dots=Array.from({length:count},()=>({x:Math.random(),y:Math.random(),size:.45+Math.random()*.9,speed:.000015+Math.random()*.000025,phase:Math.random()*6.28}))
 let w=1,h=1,frame=0,last=0,visible=false,pointer={x:-1000,y:-1000}
 function resize(){if(!parent||!ctx||!c)return;const rect=parent.getBoundingClientRect();w=rect.width;h=rect.height;const dpr=Math.min(devicePixelRatio||1,1.5);c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
 function draw(time:number){if(!ctx||!visible||document.hidden){frame=0;return}const elapsed=last?Math.min(time-last,50):16;last=time;ctx.clearRect(0,0,w,h);for(const d of dots){d.y=(d.y-elapsed*d.speed+1)%1;let x=d.x*w+Math.sin(time*.0004+d.phase)*7,y=d.y*h;const dx=x-pointer.x,dy=y-pointer.y,dist=Math.hypot(dx,dy);if(dist<85&&dist>0){x+=dx/dist*(85-dist)*.13;y+=dy/dist*(85-dist)*.13}const alpha=.12+(Math.sin(time*.001+d.phase)+1)*.13;ctx.fillStyle=`rgba(226,187,113,${alpha})`;ctx.beginPath();ctx.arc(x,y,d.size,0,Math.PI*2);ctx.fill()}frame=requestAnimationFrame(draw)}
 const observer=new IntersectionObserver(entries=>{visible=!!entries[0]?.isIntersecting;if(visible&&!document.hidden&&!frame){last=0;frame=requestAnimationFrame(draw)}else if(!visible){cancelAnimationFrame(frame);frame=0}},{threshold:0})
 const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else if(visible&&!frame){last=0;frame=requestAnimationFrame(draw)}}
 const move=(e:PointerEvent)=>{const rect=parent.getBoundingClientRect();pointer={x:e.clientX-rect.left,y:e.clientY-rect.top}}
 const leave=()=>{pointer={x:-1000,y:-1000}}
 resize();observer.observe(parent);window.addEventListener('resize',resize);parent.addEventListener('pointermove',move,{passive:true});parent.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',onVisibility)
 stop=()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',resize);parent.removeEventListener('pointermove',move);parent.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',onVisibility)}
})
onUnmounted(()=>stop())
</script>
<template><canvas ref="canvas" class="shop-particles" aria-hidden="true"></canvas></template>
