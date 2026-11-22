import * as THREE from 'three'

type StoryEngine = { setProgress: (value: number) => void; dispose: () => void }
const vertexShader = `
attribute vec3 aRose;
attribute vec3 aSmoke;
attribute vec3 aBottle;
attribute vec3 aFlame;
attribute vec3 aPhoto;
attribute float aSeed;
uniform float uProgress;
uniform float uTime;
uniform float uPixelRatio;
uniform vec3 uPointer;
uniform float uPointerActive;
varying float vDepth;
varying float vGlow;
vec3 target(float scene) {
  if (scene < 0.5) return position;
  if (scene < 1.5) return aRose;
  if (scene < 2.5) return aSmoke;
  if (scene < 3.5) return aBottle;
  if (scene < 4.5) return aFlame;
  return aPhoto;
}
void main() {
  float base = floor(min(uProgress, 5.0));
  float part = smoothstep(0.0, 1.0, fract(min(uProgress, 5.0)));
  vec3 p = mix(target(base), target(min(base + 1.0, 5.0)), part);
  float drift = 0.025 + (1.0 - smoothstep(0.0, 0.7, uProgress)) * 0.045;
  p += vec3(sin(uTime*.42+aSeed*19.0), cos(uTime*.35+aSeed*27.0), sin(uTime*.28+aSeed*13.0)) * drift;
  vec2 delta = p.xy - uPointer.xy;
  float distanceToPointer = length(delta);
  float influence = (1.0-smoothstep(0.08, 0.85, distanceToPointer))*uPointerActive;
  vec2 outward = delta / max(distanceToPointer, 0.001);
  vec2 swirl = vec2(-outward.y, outward.x);
  p.xy += (outward*.27 + swirl*.16*sin(uTime*1.2+aSeed*9.0)) * influence;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp((2.3 + aSeed*2.5) * uPixelRatio * (5.0 / max(1.0, -mv.z)), 1.0, 10.0);
  vDepth = clamp((p.z + 1.5) / 3.0, 0.0, 1.0);
  vGlow = 0.35 + aSeed*.35;
}`
const fragmentShader = `
varying float vDepth;
varying float vGlow;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float glow = pow(1.0 - smoothstep(0.0, 0.5, d), 1.5);
  vec3 gold = mix(vec3(.45,.24,.065), vec3(1.0,.78,.37), vDepth);
  gl_FragColor = vec4(gold, glow * vGlow);
}`
const random = (i:number, salt:number) => { const x=Math.sin(i*127.1+salt*311.7)*43758.5453;return x-Math.floor(x) }
function imagePoints(image:HTMLImageElement) {
  const canvas=document.createElement('canvas');canvas.width=180;canvas.height=180
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Image sampling unavailable')
  ctx.drawImage(image,0,0,180,180);const data=ctx.getImageData(0,0,180,180).data;const points:number[][]=[]
  for(let y=0;y<180;y++)for(let x=0;x<180;x++){const i=(y*180+x)*4;const light=(data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722)/255;if(light>.12&&random(i,3)<light*.85)points.push([(x/180-.5)*3,(.5-y/180)*3,(light-.5)*.35])}
  if(!points.length)throw Error('Image sampling failed');return points
}
async function loadPhoto(){const image=new Image();image.src='/images/product-stone.webp';await image.decode();return imagePoints(image)}
function flame(t:number, strand:number) {
  // Three nested flame-like curves, adapted from the supplied emblem's silhouette.
  const angle=t*Math.PI*2;const width=[.72,.46,.26][strand];const x=Math.sin(angle)*width*Math.pow(Math.sin(t*Math.PI),.45);const y=1.32-2.65*t;return [x,y,Math.sin(angle*2)*.06]
}
export async function createStory3D(canvas:HTMLCanvasElement):Promise<StoryEngine> {
  const photo=await loadPhoto()
  const mobile=matchMedia('(max-width: 767px)').matches
  const nav=navigator as Navigator & {deviceMemory?:number};const count=mobile?8000:((nav.deviceMemory||8)>=8&&(navigator.hardwareConcurrency||4)>=8?30000:18000)
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'high-performance'})
  renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.z=6.5
  const geometry=new THREE.BufferGeometry();const arrays=Array.from({length:6},()=>new Float32Array(count*3));const seeds=new Float32Array(count)
  for(let i=0;i<count;i++){
    const r1=random(i,1),r2=random(i,2),r3=random(i,3),r4=random(i,4),angle=r1*Math.PI*2
    const mistRadius=1.65*Math.sqrt(r2);const mist=[Math.cos(angle)*mistRadius,(r3-.5)*2.7,Math.sin(angle)*mistRadius*.6]
    const petal=Math.floor(r1*5),u=r2,v=(r3-.5)*2,pa=petal*Math.PI*2/5,pr=.18+u*1.35,pw=Math.sin(u*Math.PI)*v*.58
    const rose=[Math.cos(pa)*pr-Math.sin(pa)*pw,Math.sin(pa)*pr+Math.cos(pa)*pw,(1-u)*.28+Math.cos(v*1.5)*.24]
    const y=(r1-.5)*3.0,smoke=[Math.sin(y*3+r2*6.28)*(.16+r3*.55),y,Math.cos(y*2.3+r2*6.28)*(.15+r4*.5)]
    const cap=r1<.18;const by=cap?1.0+r2*.44:-1.25+r2*2.25;const bw=cap?.63:.75;const bd=cap?.34:.35;const edge=Math.floor(r3*4);const bx=edge===0?-bw:edge===1?bw:(r4*2-1)*bw;const bz=edge===2?-bd:edge===3?bd:(r4*2-1)*bd;const bottle=[bx,by,bz]
    const f=flame(r1,Math.floor(r2*3));const flamePoint=[f[0]+(r3-.5)*.05,f[1],f[2]+(r4-.5)*.08]
    const pic=photo[Math.floor(r1*photo.length)]
    ;[mist,rose,smoke,bottle,flamePoint,pic].forEach((v,j)=>arrays[j].set(v,i*3));seeds[i]=r4
  }
  geometry.setAttribute('position',new THREE.BufferAttribute(arrays[0],3));['aRose','aSmoke','aBottle','aFlame','aPhoto'].forEach((name,i)=>geometry.setAttribute(name,new THREE.BufferAttribute(arrays[i+1],3)));geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1))
  const uniforms={uProgress:{value:0},uTime:{value:0},uPixelRatio:{value:1},uPointer:{value:new THREE.Vector3()},uPointerActive:{value:0}}
  const material=new THREE.ShaderMaterial({uniforms,vertexShader,fragmentShader,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})
  const points=new THREE.Points(geometry,material);points.frustumCulled=false;scene.add(points)
  let frame=0,disposed=false,desiredProgress=0,progress=0,ratio=Math.min(devicePixelRatio||1,2),mouseX=0,mouseY=0,last=0,frames=0,total=0;const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),0),hit=new THREE.Vector3()
  function resize(){const w=window.innerWidth,h=window.innerHeight;camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);uniforms.uPixelRatio.value=ratio}
  function pointer(e:PointerEvent){mouseX=e.clientX/window.innerWidth*2-1;mouseY=-(e.clientY/window.innerHeight*2-1);mouse.set(mouseX,mouseY);raycaster.setFromCamera(mouse,camera);if(raycaster.ray.intersectPlane(plane,hit)){uniforms.uPointer.value.copy(hit);uniforms.uPointerActive.value=1}}
  function leave(){uniforms.uPointerActive.value=0}
  function tilt(e:DeviceOrientationEvent){if(e.gamma!==null&&e.beta!==null){mouseX=THREE.MathUtils.clamp(e.gamma/45,-1,1);mouseY=THREE.MathUtils.clamp((e.beta-45)/45,-1,1)}}
  function render(now:number){if(disposed||document.hidden){frame=0;return}const dt=last?Math.min(now-last,100):16;last=now;frames++;total+=dt;if(frames>=120){const avg=total/frames;const max=Math.min(devicePixelRatio||1,2);const next=avg>28?Math.max(.75,ratio-.2):avg<19?Math.min(max,ratio+.1):ratio;if(Math.abs(next-ratio)>.01){ratio=next;resize()}frames=0;total=0}progress+=(desiredProgress-progress)*.08;uniforms.uProgress.value=progress;uniforms.uTime.value=now*.001;camera.position.x=Math.sin(now*.00008)*.24+mouseX*.17;camera.position.y=Math.cos(now*.00007)*.12+mouseY*.12;camera.lookAt(0,0,0);renderer.render(scene,camera);frame=requestAnimationFrame(render)}
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0}else if(!frame&&!disposed)frame=requestAnimationFrame(render)}
  function contextLost(e:Event){e.preventDefault();dispose();canvas.dispatchEvent(new CustomEvent('story-webgl-lost'))}
  function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',pointer);window.removeEventListener('pointerdown',pointer);window.removeEventListener('pointerleave',leave);window.removeEventListener('deviceorientation',tilt);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);geometry.dispose();material.dispose();renderer.dispose()}
  window.addEventListener('resize',resize);window.addEventListener('pointermove',pointer,{passive:true});window.addEventListener('pointerdown',pointer,{passive:true});window.addEventListener('pointerleave',leave);window.addEventListener('deviceorientation',tilt,{passive:true});document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',contextLost);resize();if(!document.hidden)frame=requestAnimationFrame(render)
  return {setProgress(value){desiredProgress=THREE.MathUtils.clamp(value,0,5)},dispose}
}
