<script setup lang="ts">
import {onMounted,onUnmounted,ref,watch} from 'vue'
const props=defineProps<{ar:boolean,sound:boolean}>();defineEmits(['shop','sound'])
const canvas=ref<HTMLCanvasElement|null>(null),canvas3d=ref<HTMLCanvasElement|null>(null),threeActive=ref(false),scene=ref(0)
let engine:{setProgress:(value:number)=>void;dispose:()=>void}|undefined,frame=0,alive=true,cleanup2d=()=>{},context:AudioContext|undefined,gain:GainNode|undefined,osc:OscillatorNode|undefined
const lines=['Every fragrance begins with a feeling.','A moment unfolds, petal by petal.','Some memories linger in the air.','A little essence. A lasting impression.','Made to become your own.','Discover your signature at Noor Al Zahra.']
const arabic=['كل عطر يبدأ بإحساس.','لحظة تتفتح، بتلة بعد بتلة.','بعض الذكريات تبقى في الهواء.','قليل من العطر، أثر لا يُنسى.','عطر يعبّر عنك.','اكتشف عطرك المميز مع نور الزهراء.']
function progress(){const value=Math.min(5,window.scrollY/Math.max(1,window.innerHeight));scene.value=Math.floor(value);engine?.setProgress(value)}
function start2d(){
 if(!alive||frame)return
 const c=canvas.value!,ctx=c.getContext('2d');if(!ctx)return
 let width=0,height=0,pointer={x:-10000,y:-10000};const count=360
 const particles=Array.from({length:count},(_,i)=>({x:0,y:0,seed:i*2.399}))
 const resize=()=>{width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio,2);c.width=width*dpr;c.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
 const move=(e:PointerEvent)=>{pointer={x:e.clientX,y:e.clientY}},leave=()=>{pointer={x:-10000,y:-10000}}
 function shape(i:number,mode:number,scale:number){const t=i/count,a=t*Math.PI*16,phase=i*2.399;switch(mode){case 0:return [Math.cos(phase)*scale*(.15+.75*t),Math.sin(phase)*scale*(.15+.75*t)];case 1:{const r=scale*(.25+.5*Math.abs(Math.sin(2.5*a)));return [Math.cos(a)*r,Math.sin(a)*r]}case 2:return [Math.sin(t*22)*scale*(.12+.4*t),scale*(.8-t*1.6)];case 3:{const side=i%4,v=Math.floor(i/4)/(count/4)-.5;return side===0?[v*scale,-scale*.7]:side===1?[v*scale,scale*.7]:[(side===2?-.5:.5)*scale,v*scale*1.4]}case 4:{const u=t*Math.PI*2,r=scale*(.4+.3*Math.sin(3*u));return [Math.cos(u)*r,Math.sin(u)*r]}default:{const r=scale*Math.sqrt(t);return [Math.cos(phase)*r,Math.sin(phase)*r*.65]}}}
 function draw(t:number){if(!alive||document.hidden){frame=0;return}ctx!.clearRect(0,0,width,height);const p=Math.min(5,window.scrollY/Math.max(1,height)),from=Math.floor(p),to=Math.min(5,from+1),mix=p-from,scale=Math.min(width,height)*.34;particles.forEach((particle,i)=>{const a=shape(i,from,scale),b=shape(i,to,scale);let x=width/2+a[0]*(1-mix)+b[0]*mix,y=height/2+a[1]*(1-mix)+b[1]*mix;x+=Math.sin(t*.0006+particle.seed)*3;y+=Math.cos(t*.0005+particle.seed)*3;const dx=x-pointer.x,dy=y-pointer.y,d=Math.hypot(dx,dy);if(d<100&&d>0){x+=dx/d*(100-d)*.45;y+=dy/d*(100-d)*.45}particle.x+=(x-particle.x)*.06;particle.y+=(y-particle.y)*.06;ctx!.fillStyle=`rgba(215,177,105,${.28+(i%5)/8})`;ctx!.beginPath();ctx!.arc(particle.x,particle.y,i%13===0?1.7:.8,0,7);ctx!.fill()});frame=requestAnimationFrame(draw)}
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else if(!frame&&alive)frame=requestAnimationFrame(draw)}
 resize();window.addEventListener('resize',resize);window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',move,{passive:true});window.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);if(!document.hidden)frame=requestAnimationFrame(draw)
 cleanup2d=()=>{cancelAnimationFrame(frame);frame=0;window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',move);window.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility)}
}
function fallback(){engine?.dispose();engine=undefined;threeActive.value=false;start2d()}
onMounted(async()=>{
 window.addEventListener('scroll',progress,{passive:true});progress()
 const nav=navigator as Navigator & {deviceMemory?:number;connection?:{saveData?:boolean}}
 const lowPower=(nav.deviceMemory!==undefined&&nav.deviceMemory<=2)||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=2)||!!nav.connection?.saveData
 const probe=document.createElement('canvas');const webgl=!lowPower&&!!(probe.getContext('webgl2')||probe.getContext('webgl'))
 if(!webgl){start2d();return}
 try{const module=await import('../story/particles3d');if(!alive)return;const created=await module.createStory3D(canvas3d.value!);if(!alive){created.dispose();return}engine=created;threeActive.value=true;canvas3d.value?.addEventListener('story-webgl-lost',fallback);progress()}catch{start2d()}
})
watch(()=>props.sound,async v=>{if(v){context ||= new AudioContext();await context.resume();if(!osc){osc=context.createOscillator();const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=350;gain=context.createGain();osc.frequency.value=110;osc.type='sine';gain.gain.value=0;osc.connect(filter);filter.connect(gain);gain.connect(context.destination);osc.start()}gain!.gain.setTargetAtTime(.025,context.currentTime,.5)}else if(context&&gain)gain.gain.setTargetAtTime(0,context.currentTime,.4)})
onUnmounted(()=>{alive=false;window.removeEventListener('scroll',progress);canvas3d.value?.removeEventListener('story-webgl-lost',fallback);engine?.dispose();cleanup2d();context?.close()})
</script>
<template><div class="story"><canvas v-show="!threeActive" ref="canvas" aria-hidden="true"></canvas><canvas v-show="threeActive" ref="canvas3d" aria-hidden="true"></canvas><header><span class="wordmark">NOOR <small>AL ZAHRA</small></span><div><button class="text-button" @click="$emit('sound')">{{sound?'SOUND OFF':'SOUND ON'}}</button><button class="text-button" @click="$emit('shop')">{{ar?'تخطي إلى المتجر':'SKIP TO SHOP'}}</button></div></header><div class="story-copy"><p class="eyebrow">NOOR AL ZAHRA · {{String(scene+1).padStart(2,'0')}}</p><h1>{{ar?arabic[scene]:lines[scene]}}</h1><p>{{scene===5?(ar?'اكتشف المجموعة':'DISCOVER THE COLLECTION'):(ar?'مرر للاستكشاف':'SCROLL TO EXPLORE')}}</p><button v-if="scene===5" class="button gold" @click="$emit('shop')">{{ar?'دخول المتجر':'ENTER THE SHOP'}}</button></div><div class="story-scroll"></div></div></template>
