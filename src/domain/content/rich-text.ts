/** Portable inert rich-text AST, not editor DOM/HTML/MDX. No script-capable diagram renderer. */
import {parseMediaId} from '../../shared/domain/identifiers.ts';
import type {MediaId} from '../../shared/domain/identifiers.ts';
import {contentIssue} from './errors.ts';
import {list,shape,string,integer,safeHttps,ensureJson,token} from './strict.ts';
export interface RichTextDoc {type:'doc';version:1;blocks:RichBlock[];}
export type RichInline={type:'text';text:string}|{type:'strong'|'em'|'inlineCode';text:string}|
  {type:'link';href:string;children:RichInline[]};
export type RichBlock=
  |{type:'paragraph';children:RichInline[]}
  |{type:'heading';level:2|3|4;children:RichInline[]}
  |{type:'quote';children:RichInline[]}
  |{type:'list';ordered:boolean;items:RichInline[][]}
  |{type:'code';language:string;text:string}
  |{type:'image';mediaId:MediaId;alt:string;caption?:string}
  |{type:'table';headers:RichInline[][];rows:RichInline[][][]}
  |{type:'diagram';kind:'mermaid';source:string;alt:string};
const INLINE_TYPES=['text','strong','em','inlineCode','link'];
export function parseInline(value:unknown,path:string,depth=0):RichInline{
  if(depth>3)contentIssue(path,'depth','Inline nesting is limited.');
  const base=shape(value,['type','text','href','children'],path);
  const type=base.type;
  if(typeof type!=='string'||!INLINE_TYPES.includes(type))return contentIssue(path,'invalid_node','Unsupported inline mark.');
  if(type==='link'){
    shape(value,['type','href','children'],path);
    const href=safeHttps(base.href,`${path}.href`);
    const children=list(base.children,20,`${path}.children`).map((x,i)=>parseInline(x,`${path}.children.${i}`,depth+1));
    if(!children.length||children.some(x=>x.type==='link'))contentIssue(path,'invalid_link','Nested or empty links are unavailable.');
    return {type:'link',href,children};
  }
  shape(value,['type','text'],path);
  return {type,text:string(base.text,10000,`${path}.text`)} as RichInline;
}
export function parseRichText(raw:unknown,path='richText'):RichTextDoc{
  ensureJson(raw,path,12,150_000);
  const head=shape(raw,['type','version','blocks'],path);
  if(head.type!=='doc'||head.version!==1)return contentIssue(path,'version','Unsupported rich-text document version.');
  const blocks=list(head.blocks,120,`${path}.blocks`);
  let total=0;
  const inline=(x:unknown,key:string)=>list(x,100,key).map((v,i)=>parseInline(v,`${key}.${i}`));
  const parsed=blocks.map((rawBlock,i):RichBlock=>{
    const loc=`${path}.blocks.${i}`;
    const b=shape(rawBlock,['type','children','level','ordered','items','language','text',
      'mediaId','alt','caption','headers','rows','kind','source'],loc);
    const ty=b.type;
    if(ty==='paragraph'||ty==='quote'){
      shape(rawBlock,['type','children'],loc);
      return {type:ty,children:inline(b.children,`${loc}.children`)};
    }
    if(ty==='heading'){
      shape(rawBlock,['type','level','children'],loc);
      const level=integer(b.level,2,4,`${loc}.level`) as 2|3|4;
      return {type:'heading',level,children:inline(b.children,`${loc}.children`)};
    }
    if(ty==='list'){
      shape(rawBlock,['type','ordered','items'],loc);
      if(typeof b.ordered!=='boolean')contentIssue(loc,'invalid_list','List kind is required.');
      const items=list(b.items,30,`${loc}.items`).map((item,j)=>inline(item,`${loc}.items.${j}`));
      return {type:'list',ordered:b.ordered as boolean,items};
    }
    if(ty==='code'){
      shape(rawBlock,['type','language','text'],loc);
      const language=string(b.language,32,`${loc}.language`);
      if(language&&!/^[a-z0-9+_.#-]+$/i.test(language))contentIssue(loc,'code_language','Unsupported language label.');
      const text=string(b.text,15000,`${loc}.text`);total+=text.length;
      return {type:'code',language,text};
    }
    if(ty==='image'){
      shape(rawBlock,['type','mediaId','alt','caption'],loc);
      let mediaId:MediaId;
      try{mediaId=parseMediaId(b.mediaId);}catch{return contentIssue(`${loc}.mediaId`,'invalid_media','A valid media ID is required.');}
      const alt=string(b.alt,250,`${loc}.alt`);
      if(!alt.trim())contentIssue(`${loc}.alt`,'alt_required','Informative images need alternative text.');
      return {type:'image',mediaId,alt,...(b.caption===undefined?{}:{caption:string(b.caption,250,`${loc}.caption`)})};
    }
    if(ty==='table'){
      shape(rawBlock,['type','headers','rows'],loc);
      const headers=list(b.headers,12,`${loc}.headers`).map((h,j)=>inline(h,`${loc}.headers.${j}`));
      if(!headers.length)return contentIssue(`${loc}.headers`,'table_headers','A table requires headers.');
      const rows=list(b.rows,30,`${loc}.rows`).map((r,j)=>{
        const cells=list(r,headers.length,`${loc}.rows.${j}`);
        if(cells.length!==headers.length)contentIssue(`${loc}.rows.${j}`,'table_cells','Column count mismatch.');
        return cells.map((c,k)=>inline(c,`${loc}.rows.${j}.${k}`));
      });
      return {type:'table',headers,rows};
    }
    if(ty==='diagram'){
      shape(rawBlock,['type','kind','source','alt'],loc);
      if(b.kind!=='mermaid')contentIssue(loc,'invalid_diagram','Only inert Mermaid text is supported.');
      const source=string(b.source,8000,`${loc}.source`,1);
      const alt=string(b.alt,300,`${loc}.alt`,1);
      // Never run Mermaid here. Exclude directives, HTML, click URLs, scripts and theme/security controls.
      if(!/^(?:flowchart\s+(?:LR|RL|TB|TD|BT)|graph\s+(?:LR|RL|TB|TD|BT))\s*(?:\n|$)/.test(source)||
        /<\/?[a-z!]|\b(?:click|href|callback|init|securityLevel|script|style|classDef|linkStyle)\b|%%\s*\{/i.test(source))
        contentIssue(loc,'diagram_unsafe','Diagram syntax is not in the inert allowlist.');
      return {type:'diagram',kind:'mermaid',source,alt};
    }
    return contentIssue(loc,'invalid_node','Unsupported rich-text node.');
  });
  // Reject pathological inline text weight even when many nodes are individually bounded.
  const plain=JSON.stringify(parsed);if(plain.length+total>100_000)contentIssue(path,'too_large','Rich text exceeds its allowed content limit.');
  return {type:'doc',version:1,blocks:parsed};
}
export function escapeText(v:string):string {
  return v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
}
/** Safe server fallback: no raw user HTML, no iframe, no script or SVG, no media capability. */
export function richTextToSafeHtml(source:RichTextDoc):string{
  const doc=parseRichText(source);
  const inlines=(xs:RichInline[]):string=>xs.map(x=>{
    if(x.type==='link')return `<a href="${escapeText(x.href)}" rel="noopener noreferrer">${inlines(x.children)}</a>`;
    const t=escapeText(x.text);
    return x.type==='strong'?`<strong>${t}</strong>`:x.type==='em'?`<em>${t}</em>`:
      x.type==='inlineCode'?`<code>${t}</code>`:t;
  }).join('');
  return doc.blocks.map(b=>{
    switch(b.type){
      case 'paragraph':return `<p>${inlines(b.children)}</p>`;
      case 'heading':return `<h${b.level}>${inlines(b.children)}</h${b.level}>`;
      case 'quote':return `<blockquote>${inlines(b.children)}</blockquote>`;
      case 'list':return `<${b.ordered?'ol':'ul'}>${b.items.map(i=>`<li>${inlines(i)}</li>`).join('')}</${b.ordered?'ol':'ul'}>`;
      case 'code':return `<pre><code>${escapeText(b.text)}</code></pre>`;
      case 'image':return `<p data-asset-pending="true">${escapeText(b.alt)}</p>`;
      case 'table':return `<table><thead><tr>${b.headers.map(h=>`<th scope="col">${inlines(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(row=>`<tr>${row.map(cell=>`<td>${inlines(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      case 'diagram':return `<figure><pre>${escapeText(b.source)}</pre><figcaption>${escapeText(b.alt)}</figcaption></figure>`;
    }
  }).join('\n');
}
function inlineMarkdown(xs:RichInline[]):string{
  return xs.map(x=>x.type==='link'?`[${inlineMarkdown(x.children)}](${x.href})`:
    x.type==='strong'?`**${x.text}**`:x.type==='em'?`*${x.text}*`:
      x.type==='inlineCode'?`\`${x.text}\``:x.text.replace(/([*_`\[\]\\])/g,'\\$1')).join('');
}
/** Deterministic output for supported AST; HTML import is intentionally unavailable. */
export function exportMarkdown(source:RichTextDoc):string{
  return parseRichText(source).blocks.map(b=>{
    switch(b.type){
      case 'paragraph':return inlineMarkdown(b.children);
      case 'heading':return '#'.repeat(b.level)+' '+inlineMarkdown(b.children);
      case 'quote':return '> '+inlineMarkdown(b.children);
      case 'list':return b.items.map((it,i)=>`${b.ordered?`${i+1}.`:'-'} ${inlineMarkdown(it)}`).join('\n');
      case 'code':return `\`\`\`${b.language}\n${b.text}\n\`\`\``;
      case 'diagram':return `\`\`\`mermaid\n${b.source}\n\`\`\`\n\n${b.alt}`;
      case 'image':return `![${b.alt}](media:${b.mediaId})`;
      case 'table':return `| ${b.headers.map(inlineMarkdown).join(' | ')} |\n| ${b.headers.map(()=> '---').join(' | ')} |\n${b.rows.map(r=>`| ${r.map(inlineMarkdown).join(' | ')} |`).join('\n')}`;
    }
  }).join('\n\n');
}
function inlineFromMarkdown(s:string):RichInline[]{
  const result:RichInline[]=[];
  const re=/\[([^\]\n]{1,200})\]\((https:\/\/[^)\s]{1,2048})\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`/g;
  let last=0,m:RegExpExecArray|null;
  while((m=re.exec(s))){
    if(m.index>last)result.push({type:'text',text:s.slice(last,m.index)});
    if(m[1]!==undefined)result.push({type:'link',href:m[2],children:[{type:'text',text:m[1]}]});
    else if(m[3]!==undefined)result.push({type:'strong',text:m[3]});
    else if(m[4]!==undefined)result.push({type:'em',text:m[4]});
    else result.push({type:'inlineCode',text:m[5]});
    last=re.lastIndex;
  }
  if(last<s.length)result.push({type:'text',text:s.slice(last)});
  return result.length?result:[{type:'text',text:''}];
}
/** Small, safe Markdown subset. Unsupported raw HTML and MDX are rejected rather than executed. */
export function importMarkdown(input:unknown):RichTextDoc{
  const source=string(input,40_000,'markdown');
  if(/<\/?[a-z][^>]*>|\{[^}\n]{0,200}(?:=>|eval\s*\(|function\b|document\.|window\.|import\s*\()[^}\n]*\}|\bjavascript:/i.test(source))contentIssue('markdown','unsupported_html','Raw HTML and expressions are not accepted.');
  const rows=source.replace(/\r\n?/g,'\n').split('\n');const blocks:RichBlock[]=[];
  for(let i=0;i<rows.length;){
    const line=rows[i];if(!line.trim()){i++;continue;}
    const code=line.match(/^```([a-zA-Z0-9+_.#-]{0,32})\s*$/);
    if(code){const body:string[]=[];i++;while(i<rows.length&&rows[i]!=='```')body.push(rows[i++]);
      if(i===rows.length)contentIssue('markdown','fence_unclosed','A code fence was not closed.');i++;
      if(code[1]==='mermaid'){
        const src=body.join('\n');blocks.push({type:'diagram',kind:'mermaid',source:src,alt:'Diagram (text alternative)'});
      }else blocks.push({type:'code',language:code[1],text:body.join('\n')});continue;}
    const heading=line.match(/^(#{2,4})\s+(.+)$/);
    if(heading){blocks.push({type:'heading',level:heading[1].length as 2|3|4,children:inlineFromMarkdown(heading[2])});i++;continue;}
    if(/^#\s/.test(line))contentIssue('markdown','heading','The portfolio Hero owns H1. Use H2-H4.');
    if(/^>\s/.test(line)){blocks.push({type:'quote',children:inlineFromMarkdown(line.slice(2))});i++;continue;}
    if(/^(?:[-*]|\d+\.)\s/.test(line)){
      const ordered=/^\d+\./.test(line);const items:RichInline[][]=[];
      while(i<rows.length&&/^(?:[-*]|\d+\.)\s/.test(rows[i])){
        if(/^\d+\./.test(rows[i])!==ordered)break;
        items.push(inlineFromMarkdown(rows[i++].replace(/^(?:[-*]|\d+\.)\s+/,'')));
      }
      blocks.push({type:'list',ordered,items});continue;
    }
    const text:string[]=[];while(i<rows.length&&rows[i].trim()&&!/^(?:```|#{2,4}\s|>\s|[-*]\s|\d+\.\s)/.test(rows[i]))text.push(rows[i++]);
    if(!text.length)contentIssue(`markdown.line.${i}`,'unsupported_markdown','Unsupported Markdown syntax.');
    blocks.push({type:'paragraph',children:inlineFromMarkdown(text.join('\n'))});
  }
  return parseRichText({type:'doc',version:1,blocks},'markdown');
}
