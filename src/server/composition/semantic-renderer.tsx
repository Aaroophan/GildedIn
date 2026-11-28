/** Safe React semantic renderer for an ALREADY verified compilation plan.
 * PUBLIC ENTRY MUST FIRST read an active immutable release through Issue 5's live policy gate.
 * This component MUST NOT fetch an owner draft, session or arbitrary media from the browser. */
import type {ReactNode} from 'react';
import type {SemanticRenderPlan,SemanticNode} from '../../domain/composition/types.ts';
import type {RichInline,RichTextDoc} from '../../domain/content/rich-text.ts';
import type {DesignTheme} from '../../domain/design/theme.ts';
import type {SceneGraph} from '../../domain/design/scene.ts';
import {defaultTheme,parseDesignTheme} from '../../domain/design/theme.ts';
import {ThemeScope} from '../../ui/design/theme-scope.tsx';
import {MotionProvider} from '../../ui/design/motion-settings.tsx';
import {SceneBackdrop} from '../../ui/design/scene-backdrop.tsx';
import {IntroHeading} from '../../ui/design/intro.tsx';
import {COMPONENT_REGISTRY_VERSION,COMPOSITION_COMPILER_VERSION,COMPOSITION_SERIALIZER_VERSION} from '../../domain/composition/types.ts';
import {TabsIsland,CarouselIsland,ActionIsland} from '../../ui/composition/client-islands.tsx';
interface RenderOptions {plan:SemanticRenderPlan;nonce:string;basePath:string;pauseMotion?:boolean;mediaUrl?:(id:string)=>string|null;
  modalTargets?:ReadonlySet<string>;theme?:DesignTheme;sceneGraph?:SceneGraph;enableCinematic?:boolean;}
function hrefForPlan(href:unknown,basePath:string):string|undefined{
  if(typeof href!=='string')return undefined;
  if(/^\/(?!\/)[a-z0-9\/-]*$/.test(href))return basePath+(href==='/'?'':href)||'/';
  if(/^#gi-section-[a-f0-9]{32}$/.test(href))return href;
  try{const u=new URL(href);
    if(u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&
      u.hostname&&!/^(localhost|.*\.(?:localhost|test|local|internal)|\[.*\]|[\d.]+)$/i.test(u.hostname))
      return u.href;
    if(u.protocol==='mailto:'&&/^mailto:[^\s@<>?]+@[^\s@<>?]+$/i.test(href))return href;
  }catch{ /* denied */ }
  return undefined;
}
/** Only a verified and approved media gateway may supply the location. */
function approvedMediaUrl(mediaId:string,getUrl?:RenderOptions['mediaUrl']):string|undefined{
  const candidate=getUrl?.(mediaId);
  return candidate&&/^\/api\/v1\/public\/media\/[a-f0-9-]{36}\/[a-z0-9_-]+$/.test(candidate)?candidate:undefined;
}
/** No raw user HTML is ever mounted. Technical code/diagram source stays inert text. */
function richInline(items:readonly RichInline[],base:string):ReactNode{
  return items.map((item,i)=>{
    if(item.type==='text')return <span key={i}>{item.text}</span>;
    if(item.type==='strong')return <strong key={i}>{item.text}</strong>;
    if(item.type==='em')return <em key={i}>{item.text}</em>;
    if(item.type==='inlineCode')return <code key={i}>{item.text}</code>;
    const href=hrefForPlan(item.href,base);
    return href?<a key={i} href={href} rel="noopener noreferrer">{richInline(item.children,base)}</a>:
      <span key={i}>{richInline(item.children,base)}</span>;
  });
}
function renderRichText(doc:RichTextDoc,options:RenderOptions):ReactNode{
  return doc.blocks.map((block,i)=>{
    switch(block.type){
      case 'paragraph':return <p key={i}>{richInline(block.children,options.basePath)}</p>;
      case 'heading':return block.level===2?<h2 key={i}>{richInline(block.children,options.basePath)}</h2>:
        block.level===3?<h3 key={i}>{richInline(block.children,options.basePath)}</h3>:
        <h4 key={i}>{richInline(block.children,options.basePath)}</h4>;
      case 'quote':return <blockquote key={i}>{richInline(block.children,options.basePath)}</blockquote>;
      case 'list':{
        const rows=block.items.map((item,j)=><li key={j}>{richInline(item,options.basePath)}</li>);
        return block.ordered?<ol key={i}>{rows}</ol>:<ul key={i}>{rows}</ul>;
      }
      case 'code':return <pre key={i} tabIndex={0}><code>{block.text}</code></pre>;
      case 'diagram':return <figure key={i}><figcaption>{block.alt}</figcaption>
        <pre tabIndex={0} aria-label={block.alt}>{block.source}</pre></figure>;
      case 'image':{
        const url=approvedMediaUrl(block.mediaId,options.mediaUrl);
        return <figure key={i}>{url?<img src={url} alt={block.alt} loading="lazy"/>:
          <span role="img" aria-label={block.alt||'Media unavailable'}>Media unavailable</span>}
          {block.caption?<figcaption>{block.caption}</figcaption>:null}</figure>;
      }
      case 'table':return <table key={i}><thead><tr>{block.headers.map((h,j)=><th key={j} scope="col">
        {richInline(h,options.basePath)}</th>)}</tr></thead><tbody>{block.rows.map((row,j)=><tr key={j}>
        {row.map((cell,k)=><td key={k}>{richInline(cell,options.basePath)}</td>)}</tr>)}</tbody></table>;
    }
  });
}
function renderNode(node:SemanticNode,options:RenderOptions):ReactNode{
  const className=`gi-composition-node ${/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(node.nodeId)?`gi-node-${node.nodeId.replace(/-/g,'')}`:''}`;
  const props=node.props,children=node.children.map(x=>renderNode(x,options));
  const label=typeof props.label==='string'?props.label:node.text??'Open';
  const href=hrefForPlan(node.href,options.basePath);
  let content:ReactNode=null;
  switch(node.componentType){
  case 'heading':content=node.role==='h1'?<IntroHeading title={node.text??''}/>:
      node.role==='h3'?<h3>{node.text}</h3>:<h2>{node.text}</h2>;break;
  case 'text':content=node.richText?<div>{renderRichText(node.richText,options)}</div>:<p>{node.text}</p>;break;
  case 'button':case 'link':
    content=href?<a href={href} rel={href.startsWith('https:')?'noopener noreferrer':undefined}>{label}</a>:
      <ActionIsland label={label} action={node.interaction}/>;break;
  case 'image':{
    const src=node.mediaId?approvedMediaUrl(node.mediaId,options.mediaUrl):undefined;
    content=<figure>{src?<img src={src} alt={node.alt??''} loading="lazy"/>:
      <span role="img" aria-label={node.alt||'Media awaiting approval'}>Media unavailable</span>}
      {typeof props.caption==='string'?<figcaption>{props.caption}</figcaption>:null}</figure>;break;
  }
  case 'repeater':case 'timeline':{
    content=<ul>{(node.items??[]).map(item=><li key={item.key}>
      {item.href&&hrefForPlan(item.href,options.basePath)?<a href={hrefForPlan(item.href,options.basePath)}>{item.title}</a>:
        <strong>{item.title}</strong>}
      {item.description?<p>{item.description}</p>:null}</li>)}</ul>;break;
  }
  case 'gallery':{
    const items=props.items as {mediaId:string;alt:string;caption?:string}[];
    content=<ul>{items.map((item,i)=>{const url=approvedMediaUrl(item.mediaId,options.mediaUrl);
      return <li key={`${item.mediaId}-${i}`}><figure>{url?<img src={url} alt={item.alt} loading="lazy"/>:
        <span role="img" aria-label={item.alt||'Media awaiting approval'}>Media unavailable</span>}
        {item.caption?<figcaption>{item.caption}</figcaption>:null}</figure></li>;})}</ul>;break;
  }
  case 'tabs':content=<TabsIsland id={node.nodeId} label={String(props.label??'Information tabs')}
    items={props.items as {id:string;label:string;body:string}[]}/>;break;
  case 'accordion':content=<div>{(props.items as {id:string;label:string;body:string}[]).map(item=>
    <details key={item.id}><summary>{item.label}</summary><p>{item.body}</p></details>)}</div>;break;
  case 'carousel':content=<CarouselIsland id={node.nodeId} label={String(props.label??'Content carousel')}
    items={props.slides as {id:string;label:string;body:string}[]}/>;break;
  case 'comparisonTable':{
    const headers=props.headers as string[],rows=props.rows as string[][];
    content=<table><caption>{String(props.caption)}</caption><thead><tr>{headers.map((h,i)=><th key={i} scope="col">{h}</th>)}</tr></thead>
      <tbody>{rows.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table>;break;
  }
  case 'contactForm':content=<div data-gi-contact-form="true" tabIndex={-1}>
    <p>{String(props.label)}</p><p>{String(props.consentLabel)}</p>
    <p>Contact submission is not available until an approved endpoint is configured.</p>
    </div>;break;
  case 'container':case 'group':case 'grid':case 'card':{
    // The wrapper receives the generated safe CSS; nested content remains in DOM reading order.
    content=<>{typeof props.label==='string'?<h3>{props.label}</h3>:null}{children}
      {node.interaction.kind!=='none'?<ActionIsland label={label} action={node.interaction}/>:null}</>;
    break;
  }
  default:content=null;
  }
  const id=`gi-node-${node.nodeId}`;
  if(options.modalTargets?.has(node.nodeId))return <dialog id={id} key={node.nodeId} className={className}
    aria-label={typeof props.label==='string'?props.label:'Information dialog'} open>
    {content}<form method="dialog"><button type="submit">Close dialog</button></form></dialog>;
  if(node.componentType==='card')return <article id={id} key={node.nodeId} className={className}>{content}</article>;
  if(node.role==='navigation')return <nav id={id} key={node.nodeId} className={className}
    aria-label={typeof props.label==='string'?props.label:'Section navigation'}>{content}</nav>;
  if(node.role==='decorative')return <div id={id} key={node.nodeId} className={className} aria-hidden="true">{content}</div>;
  return <div id={id} key={node.nodeId} className={className}>{content}</div>;
}
export function SemanticComposition({plan,nonce,mediaUrl,basePath,theme,sceneGraph,enableCinematic=false,pauseMotion=false}:RenderOptions){
  if(plan.schemaVersion!==1||plan.compilerVersion!==COMPOSITION_COMPILER_VERSION||plan.registryVersion!==COMPONENT_REGISTRY_VERSION||
    plan.serializerVersion!==COMPOSITION_SERIALIZER_VERSION||!/^[A-Za-z0-9+/=_-]{16,96}$/.test(nonce))
    throw new Error('UNSUPPORTED_SEMANTIC_RENDER_PLAN');
  const modalTargets=new Set<string>();
  const inspect=(n:SemanticNode):void=>{if(n.interaction.kind==='openModal')modalTargets.add(n.interaction.targetNodeId);
    for(const child of n.children)inspect(child);};
  for(const section of plan.sections)for(const node of section.nodes)inspect(node);
  if(basePath!==''&&!/^\/[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(basePath))
    throw new Error('UNTRUSTED_RENDER_BASE_PATH');
  const options={plan,nonce,mediaUrl,basePath,modalTargets};
  const appearance=parseDesignTheme(theme??defaultTheme());
  return <ThemeScope theme={appearance}><MotionProvider defaultMotion={appearance.defaultMotion} forceOff={pauseMotion}>
    {enableCinematic?<SceneBackdrop theme={appearance} sceneGraph={sceneGraph}/>:null}
    <div className="gi-composition">
    {/* CSS generated exclusively from validated finite tokens, with the trusted request CSP nonce. */}
    <style nonce={nonce}>{plan.css}</style>
    {plan.sections.map(section=><section className="gi-composition-section" key={section.sectionId}
      id={`gi-section-${section.sectionId.replace(/-/g,'')}`}>
      {section.nodes.map(n=>renderNode(n,options))}
    </section>)}
    </div></MotionProvider></ThemeScope>;
}
