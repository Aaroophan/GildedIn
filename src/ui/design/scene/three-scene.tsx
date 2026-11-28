'use client';
/** Optional, bounded Three.js backdrop. Never imports draft/owner repository or external shaders. */
import {useEffect,useRef} from 'react';
import type {QualityLevel} from '../../../domain/design/motion.ts';
import {deriveSceneQuality} from '../../../domain/design/motion.ts';
import type {SceneGraph} from '../../../domain/design/scene.ts';
import type {ScenePreset} from '../../../domain/design/theme.ts';
interface Props {preset:ScenePreset;quality:QualityLevel;color:string;graph?:SceneGraph;onFailure:()=>void;}
export default function ThreeScene({preset,quality,color,graph,onFailure}:Props){
  const holder=useRef<HTMLDivElement>(null),fail=useRef(onFailure);fail.current=onFailure;
  useEffect(()=>{
    if(!holder.current||quality==='off')return;
    const element=holder.current;
    let disposed=false,animation=0,observer:IntersectionObserver|undefined,resize:ResizeObserver|undefined;
    let detach:(()=>void)|undefined;
    const start=async()=>{
      try{
        // Dynamic import creates a second optional chunk, beyond the lazy scene component itself.
        const THREE=await import('three');
        if(disposed)return;
        const scene=new THREE.Scene();
        const camera=new THREE.PerspectiveCamera(43,1,.1,120);camera.position.set(0,2,9);
        const r=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});
        r.setClearColor(0,0);r.setPixelRatio(1);
        r.domElement.setAttribute('aria-hidden','true');r.domElement.tabIndex=-1;
        r.domElement.style.pointerEvents='none';
        element.appendChild(r.domElement);
        const accent=new THREE.Color(color),resources:{dispose():void}[]=[];
        const wire=new THREE.LineBasicMaterial({color:accent,transparent:true,opacity:.24,depthWrite:false});resources.push(wire);
        const pointsMaterial=new THREE.PointsMaterial({size:.055,color:accent,transparent:true,opacity:.63});
        resources.push(pointsMaterial);
        const grid=new THREE.GridHelper(24,20,accent,accent);
        grid.position.y=-2;grid.rotation.y=.17;scene.add(grid);resources.push(grid.geometry);
        const fixed=graph?.nodes??Array.from({length:quality==='high'?24:quality==='medium'?14:8},(_,i)=>({
          id:String(i),x:Math.sin(i*2.3)*2.7,y:Math.cos(i*1.7)*1.5,z:Math.sin(i*3)*1.2,kind:'project' as const}));
        const coords=fixed.flatMap(n=>[n.x,n.y,n.z]);
        const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',
          new THREE.Float32BufferAttribute(coords,3));resources.push(geometry);
        const dots=new THREE.Points(geometry,pointsMaterial);scene.add(dots);
        const linePositions:number[]=[];
        if(graph){
          const byId=new Map(fixed.map(n=>[n.id,n]));
          for(const edge of graph.edges){const a=byId.get(edge.from),b=byId.get(edge.to);
            if(a&&b)linePositions.push(a.x,a.y,a.z,b.x,b.y,b.z);}
        }else if(preset!=='technical-grid'){
          for(let i=1;i<fixed.length;i++)linePositions.push(...coords.slice((i-1)*3,i*3),...coords.slice(i*3,(i+1)*3));
        }
        if(linePositions.length){const linesGeometry=new THREE.BufferGeometry();
          linesGeometry.setAttribute('position',new THREE.Float32BufferAttribute(linePositions,3));
          resources.push(linesGeometry);scene.add(new THREE.LineSegments(linesGeometry,wire));}
        let active=document.visibilityState==='visible',onscreen=true,lastFrame=0,samples=0,average=0;
        const onLost=(event:Event)=>{event.preventDefault();fail.current();};
        const halt=()=>{if(animation)cancelAnimationFrame(animation);animation=0;};
        const schedule=()=>{if(!disposed&&active&&onscreen&&!animation)animation=requestAnimationFrame(render);};
        const onVisibility=()=>{active=document.visibilityState==='visible';if(active)schedule();else halt();};
        r.domElement.addEventListener('webglcontextlost',onLost,false);
        document.addEventListener('visibilitychange',onVisibility);
        observer=new IntersectionObserver(items=>{onscreen=items.some(e=>e.isIntersecting);
          if(onscreen)schedule();else halt();});observer.observe(element);
        const measure=()=>{if(!element.isConnected)return;
          const width=Math.max(1,element.clientWidth),height=Math.max(1,element.clientHeight);
          camera.aspect=width/height;camera.updateProjectionMatrix();r.setSize(width,height,false);};
        resize=new ResizeObserver(measure);resize.observe(element);measure();
        const connection=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection;
        const baseline=deriveSceneQuality({motion:quality==='high'?'cinematic':quality==='medium'?'standard':'subtle',
          density:'standard',devicePixelRatio:window.devicePixelRatio,
          hardwareConcurrency:navigator.hardwareConcurrency,saveData:connection?.saveData});
        r.setPixelRatio(baseline.pixelRatio);
        const render=(ms:number)=>{
          animation=0;
          if(disposed||!active||!onscreen||document.hidden)return;
          schedule();
          const interval=1000/Math.max(1,baseline.targetFps);
          if(ms-lastFrame<interval)return;
          const delta=ms-lastFrame;lastFrame=ms;
          if(delta>0&&delta<200){average=average*.92+delta*.08;samples++;
            if(samples%90===0&&average>38)r.setPixelRatio(1);}
          // Background only: no owner-authored shader and no pointer capture.
          grid.rotation.z=Math.sin(ms*.00009)*.025;
          r.render(scene,camera);
        };
        schedule();
        detach=()=>{r.domElement.removeEventListener('webglcontextlost',onLost);
          document.removeEventListener('visibilitychange',onVisibility);
          for(const resource of resources)resource.dispose();
          // Grid has its own material; remove safely to avoid lingering GPU buffers.
          grid.material instanceof Array?grid.material.forEach(m=>m.dispose()):grid.material.dispose();
          r.dispose();r.forceContextLoss();r.domElement.remove();};
      }catch{if(!disposed)fail.current();}
    };
    void start();
    return ()=>{disposed=true;cancelAnimationFrame(animation);observer?.disconnect();resize?.disconnect();detach?.();};
  },[preset,quality,color,graph]);
  return <div ref={holder} className="gi-three-canvas" aria-hidden="true"/>;
}
