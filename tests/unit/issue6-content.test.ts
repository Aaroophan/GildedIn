import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {parseSectionId,parseContentId,parseMediaId} from '../../src/shared/domain/identifiers.ts';
import {PRODUCT_LIMITS} from '../../src/shared/domain/limits.ts';
import {initialHeroSection,parseContentDraft,parseContentBinding,validateForPublication,
  deletionImpact,projectEligibleContent,validateReferenceGraph} from '../../src/domain/content/model.ts';
import {parseFieldDefinition,parseFieldValue,parseCollectionDefinition,importJsonSchema} from '../../src/domain/content/schema.ts';
import {parseRichText,richTextToSafeHtml,importMarkdown,exportMarkdown} from '../../src/domain/content/rich-text.ts';
import {projectCollectionDefinition,suggestProjectSlug,parseProjectCaseStudy} from '../../src/domain/content/projects.ts';
import {deriveDuration,formatContentDate,deriveContentCount} from '../../src/domain/content/derived.ts';
import {previewSchemaChange,migrateSchema} from '../../src/domain/content/migration.ts';
import {parseContentMutation,applyContentOperations} from '../../src/domain/content/commands.ts';
import {ContentDenied} from '../../src/domain/content/errors.ts';
import type {ContentDraftShape,CollectionDefinition,FieldDefinition,ContentItem,SectionDefinition} from '../../src/domain/content/types.ts';
const now='2026-11-28T10:00:00.000Z';
const SID=parseSectionId(randomUUID()),A=parseContentId(randomUUID()),B=parseContentId(randomUUID());
const mid=parseMediaId(randomUUID());
function section():SectionDefinition{return initialHeroSection(SID);}
function empty():ContentDraftShape{return {profile:{displayName:'Synthetic Owner',identityLabel:'Software Engineer',
  introduction:'I build reliable systems.'},sections:[section()],collectionDefinitions:[],contentCollections:[],nodes:[],mediaRefs:[]};}
function field(id:string,type:FieldDefinition['type']='text',patch:Partial<FieldDefinition>={}):FieldDefinition{
  return {fieldId:id,name:id,label:id,required:false,type,publicVisibility:'owner_choice',
    aiVisibility:'requires_explicit_approval',searchable:true,...patch};
}
function definition(patch:Partial<CollectionDefinition>={}):CollectionDefinition{
  return {collectionId:'projects',schemaId:'projects_schema',schemaVersion:1,
    kind:'projects',displayName:'Projects',itemsLimit:20,
    fields:[field('title'),field('private_email','email',{publicVisibility:'private',aiVisibility:'denied',searchable:false}),
      field('summary','text'),field('relation','relation',{targetCollectionId:'projects',searchable:false})],
    categories:[],...patch};
}
function item(id=A,fields:Record<string,unknown>={title:'System A'},patch:Partial<ContentItem>={}):ContentItem{
  return {contentId:id,collectionId:'projects',schemaVersion:1,fields,categoryIds:[],sortOrder:0,
    featured:false,ownerVisibility:'public_candidate',searchable:true,publicFieldIds:['title'],
    aiApprovedFieldIds:[],createdAt:now,updatedAt:now,...patch};
}
function withProject(){const d=empty(),def=definition();d.collectionDefinitions=[def];
  d.contentCollections=[{collectionId:'projects',items:[item()]}];return d;}
function rejects(code:string){return (e:unknown)=>e instanceof ContentDenied&&e.code===code;}

test('6.1 exactly one first Hero; empty optional sections and multiple Projects sections are valid',()=>{
  assert.equal(parseContentDraft(empty()).sections[0].type,'hero');
  const two=empty();two.sections.push({...section(),sectionId:parseSectionId(randomUUID()),type:'projects',
    order:1,publicAnchor:'works',title:'Works'});
  two.sections.push({...section(),sectionId:parseSectionId(randomUUID()),type:'projects',
    order:2,publicAnchor:'moreworks',title:'More Works'});
  assert.equal(parseContentDraft(two).sections.length,3);
  assert.throws(()=>parseContentDraft({...two,sections:[]}),rejects('CONTENT_INVALID'));
  assert.throws(()=>parseContentDraft({...two,sections:[two.sections[1],two.sections[0]]}),rejects('CONTENT_INVALID'));
  assert.throws(()=>parseContentDraft({...two,sections:[section(),section()]}),rejects('CONTENT_INVALID'));
});
test('6.1 publish requires minimum Hero identity but no project or career history',()=>{
  validateForPublication(empty());const missing=empty();missing.profile.identityLabel='';
  parseContentDraft(missing);assert.throws(()=>validateForPublication(missing),rejects('CONTENT_INVALID'));
});
test('6.1 legacy Issue 5 Hero is upgraded in memory, not forcibly published',()=>{
  const d=empty();d.sections=[{sectionId:SID,type:'hero',order:0,visibility:'draft_private',
    fields:{...d.profile}}] as unknown as SectionDefinition[];
  assert.equal(parseContentDraft(d).sections[0].publicAnchor,'intro');
  assert.equal(d.sections[0].publicAnchor,undefined);
});
test('6.2 accepted field primitives are strict and typed, not interpreted as HTML or code',()=>{
  const mk=(type:FieldDefinition['type'],extra:Partial<FieldDefinition>={})=>parseFieldDefinition(field('x',type,extra));
  assert.equal(parseFieldValue(mk('text'),'<script>not executable</script>','f'),'<'+'script>not executable</script>');
  assert.equal(parseFieldValue(mk('url'),'https://example.com/path','f'),'https://example.com/path');
  assert.equal(parseFieldValue(mk('email'),'owner@example.com','f'),'owner@example.com');
  assert.equal(parseFieldValue(mk('date'),'2024-02-29','f'),'2024-02-29');
  assert.equal(parseFieldValue(mk('number'),1.5,'f'),1.5);
  assert.equal(parseFieldValue(mk('boolean'),false,'f'),false);
  assert.deepEqual(parseFieldValue(mk('image'),{mediaId:mid,alt:'Architecture diagram'},'f'),
    {mediaId:mid,alt:'Architecture diagram'});
  assert.deepEqual(parseFieldValue(mk('pdf'),{mediaId:mid,label:'Résumé'},'f'),{mediaId:mid,label:'Résumé'});
  assert.equal(parseFieldValue(mk('select',{options:[{optionId:'one',label:'One'}]}),'one','f'),'one');
  assert.deepEqual(parseFieldValue(mk('list',{item:field('v','text')}),['a','b'],'f'),['a','b']);
  assert.deepEqual({...parseFieldValue(mk('object',{fields:[field('v','text')]}),{v:'ok'},'f') as object},{v:'ok'});
  assert.equal(parseFieldValue(mk('relation',{targetCollectionId:'projects'}),A,'f'),A);
});
test('6.2 dangerous values are rejected with field paths before storage',()=>{
  assert.throws(()=>parseFieldValue(field('n','number'),NaN,'items.0.n'),rejects('CONTENT_INVALID'));
  assert.throws(()=>parseFieldValue(field('n','number'),Infinity,'items.0.n'),rejects('CONTENT_INVALID'));
  assert.throws(()=>parseFieldValue(field('b','boolean'),'true','items.0.b'),rejects('CONTENT_INVALID'));
  assert.throws(()=>parseFieldValue(field('d','date'),'2025-02-29','items.0.d'),rejects('CONTENT_INVALID'));
  for(const u of ['javascript:alert(1)','data:text/html,<script>','https://127.0.0.1','https://localhost'])
    assert.throws(()=>parseFieldValue(field('u','url'),u,'items.0.u'),rejects('CONTENT_INVALID'));
  assert.throws(()=>parseFieldValue(field('s','select',{options:[{optionId:'one',label:'One'}]}),'two','f'),rejects('CONTENT_INVALID'));
  assert.throws(()=>parseFieldDefinition({...field('x'),validation:{pattern:'.*'}}),rejects('CONTENT_INVALID'));
  assert.throws(()=>parseFieldDefinition({...field('x'),defaultValue:'x'.repeat(11000)}),rejects('CONTENT_INVALID'));
});
test('6.2 image and PDF identities are not URLs or owner-controlled storage paths',()=>{
  assert.throws(()=>parseFieldValue(field('img','image'),{mediaId:'https://evil.test/file',alt:'a'},'img'),rejects('CONTENT_INVALID'));
  assert.throws(()=>parseFieldValue(field('pdf','pdf'),{mediaId:mid,label:'résumé',rawStorageKey:'x'},'pdf'),rejects('CONTENT_INVALID'));
});
test('6.3 supported schema depth and custom-field cap enforce exactly-at and one-over',()=>{
  const list1=field('a','list',{item:field('b','list',{item:field('c','list',{item:field('d','text')})})});
  assert.ok(parseFieldDefinition(list1));
  const four=field('a','list',{item:field('b','list',{item:field('c','list',{item:field('d','object',{fields:[]})})})});
  assert.throws(()=>parseFieldDefinition(four),rejects('CONTENT_INVALID'));
  assert.equal(parseCollectionDefinition(definition({fields:Array.from({length:20},(_,i)=>field(`field_${i}`))})).fields.length,20);
  assert.throws(()=>parseCollectionDefinition(definition({fields:Array.from({length:21},(_,i)=>field(`field_${i}`))})),rejects('CONTENT_INVALID'));
});
test('6.3 imported JSON schema uses an inert closed subset and private-by-default new fields',()=>{
  const raw={'$schema':'https://json-schema.org/draft/2020-12/schema',type:'object',
    additionalProperties:false,required:['title'],properties:{title:{type:'string',maxLength:160},
      source:{type:'string',format:'uri'},rating:{type:'number',minimum:0,maximum:5}}};
  const parsed=importJsonSchema(raw,{collectionId:'papers',schemaId:'papers_schema',displayName:'Papers'});
  assert.deepEqual(parsed.fields.map(f=>f.fieldId),['title','source','rating']);
  assert.ok(parsed.fields.every(f=>f.publicVisibility==='private'&&f.aiVisibility==='denied'&&!f.searchable));
  assert.equal(parsed.fields[0].required,true);
});
test('6.3 unsafe JSON Schema directives, prototypes, recursion, remotes and type overrides are denied',()=>{
  const base={type:'object',additionalProperties:false,properties:{title:{type:'string'}}};
  const bad=[{...base,'$ref':'https://evil.test'},
    {...base,properties:{title:{type:'string','$dynamicRef':'#a'}}},
    {...base,properties:{title:{type:'string',pattern:'(a+)+$'}}},
    {...base,properties:JSON.parse('{"__proto__":{"type":"string"}}')},
    {...base,properties:{title:{type:'string','x-javascript':'eval(...)'}}},
    {...base,properties:{title:{type:'array',items:{type:'array',items:{type:'array',items:{type:'array',items:{type:'string'}}}}}}}];
  for(const x of bad)assert.throws(()=>importJsonSchema(x,{collectionId:'papers',schemaId:'papers_schema',displayName:'Papers'}),rejects('CONTENT_INVALID'));
});
test('6.4 stable item IDs, categories and schema identity are not array-index substitutes',()=>{
  const d=withProject();assert.equal(parseContentDraft(d).contentCollections[0].items[0].contentId,A);
  d.contentCollections[0].items.push(item(A,{title:'Duplicate'},{sortOrder:1}));
  assert.throws(()=>parseContentDraft(d),rejects('CONTENT_INVALID'));
  d.contentCollections[0].items[1]=item(B,{title:'B'},{sortOrder:1,collectionId:'other'});
  assert.throws(()=>parseContentDraft(d),rejects('CONTENT_INVALID'));
  d.contentCollections[0].items[1]=item(B,{title:'B'},{sortOrder:1});
  assert.equal(parseContentDraft(d).contentCollections[0].items.length,2);
});
test('6.4 the 20-item limit is enforced on data records, not repeater appearances',()=>{
  const d=withProject();d.contentCollections[0].items=Array.from({length:20},(_,i)=>item(parseContentId(randomUUID()),
    {title:`Project ${i}`},{sortOrder:i}));
  assert.equal(parseContentDraft(d).contentCollections[0].items.length,20);
  d.contentCollections[0].items.push(item(B,{title:'Overflow'},{sortOrder:20}));
  assert.throws(()=>parseContentDraft(d),rejects('CONTENT_INVALID'));
});
test('6.5 same-portfolio relations validate target collection, missing IDs and cycles',()=>{
  const d=withProject();d.contentCollections[0].items.push(item(B,{title:'Linked'},{sortOrder:1}));
  d.contentCollections[0].items[0].fields.relation=B;
  assert.equal(parseContentDraft(d).contentCollections[0].items.length,2);
  d.contentCollections[0].items[1].fields.relation=A;
  assert.throws(()=>parseContentDraft(d),rejects('CONTENT_INVALID'));
  delete d.contentCollections[0].items[1].fields.relation;
  d.contentCollections[0].items[0].fields.relation=parseContentId(randomUUID());
  assert.throws(()=>parseContentDraft(d),rejects('CONTENT_INVALID'));
});
test('6.5 deletion impact reports node and item references, never silently cascades',()=>{
  const d=withProject();d.contentCollections[0].items.push(item(B,{title:'Consumer',relation:A},{sortOrder:1}));
  d.nodes=[{nodeId:'node_ref',contentBinding:{source:'collectionItem',collectionId:'projects',contentId:A,fieldId:'title'}}];
  const impact=deletionImpact(d,A);assert.equal(impact.canDelete,false);
  assert.deepEqual(impact.usedByNodes,['node_ref']);assert.deepEqual(impact.usedByItems,[B]);
});
test('6.5 binding grammar rejects Mongo-like selectors and foreign collection IDs',()=>{
  assert.throws(()=>parseContentBinding({source:'collectionItem',collectionId:'projects',contentId:A,
    query:{$where:'evil'}},'node'),rejects('CONTENT_INVALID'));
  const d=withProject();d.nodes=[{nodeId:'bad',contentBinding:{source:'collectionItem',collectionId:'other',contentId:A}}];
  assert.throws(()=>parseContentDraft(d),rejects('CONTENT_INVALID'));
});
test('6.6 only explicitly public fields appear; private nested testimonial email never leaks',()=>{
  const d=withProject();d.collectionDefinitions[0].fields.push(field('testimonial','object',{fields:[
    field('quote','text'),field('email','email',{publicVisibility:'private',aiVisibility:'denied',searchable:false})]}));
  d.contentCollections[0].items[0].fields.private_email='secret.reference@example.com';
  d.contentCollections[0].items[0].fields.testimonial={quote:'Helpful person',email:'deep.private@example.com'};
  d.contentCollections[0].items[0].publicFieldIds=['title','testimonial','testimonial.quote'];
  d.sections[0].aiSectionApproved=true;
  const bindings=[{sectionId:SID,binding:{source:'collectionItem' as const,collectionId:'projects',contentId:A}}];
  const pub=projectEligibleContent(d,bindings,'public');
  const serialized=JSON.stringify(pub);
  assert.match(serialized,/Helpful person/);assert.doesNotMatch(serialized,/private@example.com/);
  assert.doesNotMatch(serialized,/secret\.reference/);
  assert.deepEqual(projectEligibleContent(d,bindings,'ai').items,[]);
  d.contentCollections[0].items[0].aiApprovedFieldIds=['title'];
  assert.deepEqual(Object.keys(projectEligibleContent(d,bindings,'ai').items[0].fields),['title']);
});
test('6.6 search uses only explicit searchable/public fields from a visible binding',()=>{
  const d=withProject();d.contentCollections[0].items[0].publicFieldIds=['title','summary'];
  d.contentCollections[0].items[0].fields.summary='No search consent in this example';
  d.collectionDefinitions[0].fields.find(f=>f.fieldId==='summary')!.searchable=false;
  const request=[{sectionId:SID,binding:{source:'collectionItem' as const,collectionId:'projects',contentId:A}}];
  const search=projectEligibleContent(d,request,'search');
  assert.equal(search.items.length,1);
  assert.deepEqual(Object.keys(search.items[0].fields),['title']);
  d.sections[0].visible=false;
  assert.deepEqual(projectEligibleContent(d,request,'search').items,[]);
  assert.throws(()=>validateForPublication(d),rejects('CONTENT_INVALID'));
});
test('6.6 item-level drafts are always excluded from release candidates',()=>{
  const d=withProject();d.contentCollections[0].items[0].ownerVisibility='draft_only';
  assert.deepEqual(projectEligibleContent(d,[{sectionId:SID,binding:{source:'collectionItem',collectionId:'projects',contentId:A}}],'public').items,[]);
});
test('6.7 rich text is an inert AST; safe HTML renderer escapes all text/attributes',()=>{
  const document=parseRichText({type:'doc',version:1,blocks:[
    {type:'paragraph',children:[{type:'text',text:'<img src=x onerror=alert(1)>'},
      {type:'link',href:'https://example.com/',children:[{type:'text',text:'Safe link'}]}]},
    {type:'code',language:'js',text:'<script>alert(1)</script>'},
    {type:'table',headers:[[{type:'text',text:'Field'}]],rows:[[[{type:'text',text:'value'}]]]}]});
  const html=richTextToSafeHtml(document);
  assert.doesNotMatch(html,/<script|<img/i);
  assert.match(html,/&lt;script&gt;/);assert.match(html,/rel="noopener noreferrer"/);
});
test('6.7 Markdown import/export supports headings, lists and code without HTML execution',()=>{
  const input='## Overview\n\nA **bold** link to [docs](https://example.com).\n\n- One\n- Two\n\n```ts\nconst x = 1;\n```';
  const doc=importMarkdown(input);
  assert.equal(doc.blocks.length,4);
  const markdown=exportMarkdown(doc);
  const after=importMarkdown(markdown);
  assert.deepEqual(after,doc);
  assert.throws(()=>importMarkdown('hello <script>alert(1)</script>'),rejects('CONTENT_INVALID'));
  assert.throws(()=>importMarkdown('## Hello\n\n{() => eval("x")}'),rejects('CONTENT_INVALID'));
});
test('6.7 diagrams remain text-only; no click callbacks, SVG, unsafe directives or remote render',()=>{
  assert.equal(parseRichText({type:'doc',version:1,blocks:[{type:'diagram',kind:'mermaid',
    source:'flowchart LR\n  A-->B',alt:'A flows to B'}]}).blocks.length,1);
  for(const source of ['flowchart LR\nclick A "javascript:alert(1)"','flowchart LR\n%%{init: {}}%%',
    'graph TD\nA[<script>bad</script>]','sequenceDiagram\nA->B'])
    assert.throws(()=>parseRichText({type:'doc',version:1,blocks:[{type:'diagram',kind:'mermaid',source,alt:'Diagram'}]}),rejects('CONTENT_INVALID'));
});
test('6.8 structured projects validate technical fields, dates, links and route slugs',()=>{
  const def=projectCollectionDefinition();
  const parsed=parseProjectCaseStudy({contentId:A,slug:'safe-project',title:'Case study',summary:'A system',
    technologies:['TypeScript','MongoDB'],startedOn:'2024-01-02',endedOn:'2024-04-02',
    sourceUrl:'https://github.com/example/repo',categoryIds:[],featured:true},def);
  assert.equal(parsed.fields.title,'Case study');assert.equal(parsed.featured,true);
  assert.equal(suggestProjectSlug('Two Words!'),'two-words');
  assert.equal(suggestProjectSlug('Two Words!',new Set(['two-words'])),'two-words-2');
  assert.throws(()=>parseProjectCaseStudy({contentId:A,slug:'safe-project',title:'Project',
    startedOn:'2025-06-01',endedOn:'2024-01-01'},def),rejects('CONTENT_INVALID'));
});
test('6.8 repeated project slug within same portfolio is forbidden',()=>{
  const d=withProject();d.contentCollections[0].items[0].slug='case-one';
  d.contentCollections[0].items.push(item(B,{title:'Next'},{sortOrder:1,slug:'case-one'}));
  assert.throws(()=>parseContentDraft(d),rejects('CONTENT_INVALID'));
});
test('6.9 UTC date derivations are deterministic across leap days and year boundaries',()=>{
  assert.deepEqual(deriveDuration('2023-12-31','2024-02-29'),
    {months:1,years:0,remainderMonths:1,label:'1 month'});
  assert.equal(deriveDuration('2020-01-15','2022-03-15')?.label,'2 years, 2 months');
  assert.equal(deriveDuration(null,null),null);
  assert.equal(formatContentDate('2024-02-29'),'Feb 29, 2024');
  assert.equal(deriveContentCount([]),0);
  assert.throws(()=>deriveDuration('2025-01-01','2024-01-01'),rejects('CONTENT_INVALID'));
});
test('6.9 migration impact requires exact confirmation before value loss, never alters original',async()=>{
  const d=withProject();d.contentCollections[0].items[0].fields.title='Not a date';
  const v2=definition({schemaVersion:2,fields:[field('title','date'),field('private_email','email',{publicVisibility:'private',aiVisibility:'denied',searchable:false}),
    field('summary','text'),field('relation','relation',{targetCollectionId:'projects',searchable:false})]});
  const impact=await previewSchemaChange(d,v2,3);
  assert.equal(impact.destructive,true);assert.ok(impact.affectedPaths.some(x=>x.includes(A)));
  await assert.rejects(migrateSchema(d,v2,3),rejects('CONTENT_MIGRATION_CONFIRMATION_REQUIRED'));
  const migrated=await migrateSchema(d,v2,3,impact.confirmationHash);
  assert.equal(migrated.candidate.contentCollections[0].items[0].fields.title,undefined);
  assert.equal(migrated.candidate.collectionDefinitions[0].schemaVersion,2);
  assert.equal(d.collectionDefinitions[0].schemaVersion,1);
  await assert.rejects(migrateSchema(d,v2,4,impact.confirmationHash),rejects('CONTENT_MIGRATION_CONFIRMATION_REQUIRED'));
});
test('6.9 compatible label-only schema migrations preserve values and identity',async()=>{
  const d=withProject();const v2=definition({schemaVersion:2,fields:definition().fields.map(f=>f.fieldId==='title'?{...f,label:'New title'}:f)});
  const impact=await previewSchemaChange(d,v2,0);
  assert.equal(impact.destructive,false);
  const next=await migrateSchema(d,v2,0);
  assert.equal(next.candidate.contentCollections[0].items[0].fields.title,'System A');
});
test('6.10 mutation parser denies arbitrary patches, prototype keys and spoofed revisions',()=>{
  assert.throws(()=>parseContentMutation({expectedRevision:0,clientMutationId:'mutation_1234',operations:[]}),rejects('CONTENT_INVALID'));
  assert.throws(()=>parseContentMutation({expectedRevision:0,clientMutationId:'mutation_1234',operations:[{type:'$set',path:'admin'}]}),rejects('CONTENT_INVALID'));
  assert.throws(()=>parseContentMutation(JSON.parse('{"expectedRevision":0,"clientMutationId":"mutation_1234","operations":[{"type":"setProfileField","field":"displayName","value":"a","__proto__":{}}]}')),rejects('CONTENT_INVALID'));
});
test('6.10 edit batches apply as one pure candidate and leave original source unchanged',async()=>{
  const d=withProject();const changed=await applyContentOperations(d,[
    {type:'setProfileField',field:'introduction',value:'New safe introduction'},
    {type:'upsertContentItem',collectionId:'projects',contentId:A,fields:{title:'Updated source'},
      categoryIds:[],featured:true,ownerVisibility:'public_candidate',searchable:true,
      publicFieldIds:['title'],aiApprovedFieldIds:[]}
  ],now,0);
  assert.equal(changed.profile.introduction,'New safe introduction');
  assert.equal(changed.contentCollections[0].items[0].fields.title,'Updated source');
  assert.equal(d.contentCollections[0].items[0].fields.title,'System A');
  assert.equal(d.profile.introduction,'I build reliable systems.');
  await assert.rejects(applyContentOperations(d,[{type:'deleteContentItem',collectionId:'projects',contentId:A},
    {type:'setProfileField',field:'platformRoles',value:'admin'}],now,0),rejects('CONTENT_INVALID'));
});
test('6.10 delete item blocks dependent nodes; after explicit detach in one batch it succeeds',async()=>{
  const d=withProject();d.nodes=[{nodeId:'node_project',contentBinding:{source:'collectionItem',collectionId:'projects',contentId:A}}];
  await assert.rejects(applyContentOperations(d,[{type:'deleteContentItem',collectionId:'projects',contentId:A}],now,0),rejects('CONTENT_IN_USE'));
  const result=await applyContentOperations(d,[{type:'detachContentReference',nodeId:'node_project'},
    {type:'deleteContentItem',collectionId:'projects',contentId:A}],now,0);
  assert.equal(result.contentCollections[0].items.length,0);
});
test('6.10 schema/sections and category operations keep stable item IDs and validate entire batch',async()=>{
  const d=withProject();let changed=await applyContentOperations(d,[
    {type:'createCategory',collectionId:'projects',category:{categoryId:'backend',label:'Backend'}},
    {type:'upsertContentItem',collectionId:'projects',contentId:A,fields:{title:'System A'},
      categoryIds:['backend'],featured:false,ownerVisibility:'public_candidate',searchable:true,
      publicFieldIds:['title'],aiApprovedFieldIds:[]}],now,0);
  assert.deepEqual(changed.contentCollections[0].items[0].categoryIds,['backend']);
  await assert.rejects(applyContentOperations(changed,[{type:'deleteCategory',collectionId:'projects',categoryId:'backend'}],now,1),rejects('CONTENT_IN_USE'));
  changed=await applyContentOperations(changed,[{type:'renameCategory',collectionId:'projects',categoryId:'backend',value:'Server side'},
    {type:'deleteCategory',collectionId:'projects',categoryId:'backend',removeAssignments:true}],now,1);
  assert.deepEqual(changed.contentCollections[0].items[0].categoryIds,[]);
});

test('6.6 deep nested list approvals never inherit the top-level public or AI choice',()=>{
  const d=withProject();const sensitive=field('mail','email',{publicVisibility:'private',aiVisibility:'denied',searchable:false});
  d.collectionDefinitions[0].fields.push(field('blocks','list',{item:field('entry','object',{
    fields:[field('heading','text'),sensitive,field('new_field','text')]})}));
  const target=d.contentCollections[0].items[0];
  target.fields.blocks=[{heading:'Public note',mail:'PRIVATE-NESTED@example.com',new_field:'NEW-PRIVATE-CANDIDATE'}];
  target.publicFieldIds=['title','blocks'];d.sections[0].aiSectionApproved=true;
  const requests=[{sectionId:SID,binding:{source:'collectionItem' as const,collectionId:'projects',contentId:A}}];
  assert.doesNotMatch(JSON.stringify(projectEligibleContent(d,requests,'public')),/Public note|PRIVATE-NESTED|NEW-PRIVATE/);
  target.publicFieldIds.push('blocks.entry','blocks.entry.heading');
  let publicSnapshot=JSON.stringify(projectEligibleContent(d,requests,'public'));
  assert.match(publicSnapshot,/Public note/);assert.doesNotMatch(publicSnapshot,/PRIVATE-NESTED|NEW-PRIVATE/);
  target.aiApprovedFieldIds=['blocks','blocks.entry'];
  assert.doesNotMatch(JSON.stringify(projectEligibleContent(d,requests,'ai')),/Public note|NEW-PRIVATE/);
  target.aiApprovedFieldIds.push('blocks.entry.heading');
  assert.match(JSON.stringify(projectEligibleContent(d,requests,'ai')),/Public note/);
  assert.doesNotMatch(JSON.stringify(projectEligibleContent(d,requests,'ai')),/PRIVATE-NESTED|NEW-PRIVATE/);
  target.publicFieldIds.push('blocks.entry.mail');
  assert.throws(()=>parseContentDraft(d),rejects('CONTENT_INVALID'));
});

test('6.5 custom section relation must target an owned, existing item and remain stable',()=>{
  const d=withProject(),id=parseSectionId(randomUUID());
  d.sections.push({...section(),sectionId:id,type:'custom',order:1,publicAnchor:'custom',
    schemaDefinitionId:'projects_schema',customValues:{relation:B}});
  assert.throws(()=>parseContentDraft(d),rejects('CONTENT_INVALID'));
  d.sections[1].customValues={relation:A};
  assert.equal(parseContentDraft(d).sections[1].customValues!.relation,A);
  assert.deepEqual(deletionImpact(d,A).usedBySections,[id]);
  d.sections[1].customValues=null as unknown as Record<string,unknown>;
  assert.throws(()=>parseContentDraft(d),rejects('CONTENT_INVALID'));
});

test('6.5 longest reference path detects shared-subgraph depth and cycle without skipped visited nodes',()=>{
  const ids=Array.from({length:5},()=>parseContentId(randomUUID()));
  const d=withProject();d.contentCollections[0].items=ids.map((id,i)=>item(id,
    {title:`Ref ${i}`, ...(i<ids.length-1?{relation:ids[i+1]}:{})},{sortOrder:i,publicFieldIds:['title']}));
  assert.throws(()=>parseContentDraft(d),rejects('CONTENT_INVALID'));
  d.contentCollections[0].items[0].fields={title:'No reference'};
  assert.equal(parseContentDraft(d).contentCollections[0].items.length,5);
  d.contentCollections[0].items[4].fields={title:'Cyclic reference',relation:ids[1]};
  assert.throws(()=>parseContentDraft(d),rejects('CONTENT_INVALID'));
});

test('6.2 invalid far-future date returns a typed safe validation failure',()=>{
  assert.throws(()=>parseFieldValue(field('when','date'),'9999-99-99','when'),rejects('CONTENT_INVALID'));
});

test('6.10 owner-facing draft projection excludes internal mutation hashes and account mutation actors',async()=>{
  const {projectOwnerDraft}=await import('../../src/domain/content/owner-view.ts');
  const id=parseSectionId(randomUUID());const portfolioId=randomUUID();
  const raw={portfolioId,revision:3,schemaVersion:1 as const,rendererVersion:'1',
    ...empty(),sections:[initialHeroSection(id)],theme:{preset:'dark'},navigation:{},seo:{},aiApprovals:{},
    draftMutationId:'secret-mutation-id',draftMutationFingerprint:'secret-fingerprint',
    updatedBy:randomUUID(),createdAt:now,updatedAt:now};
  const projected=projectOwnerDraft(raw as Parameters<typeof projectOwnerDraft>[0]);
  assert.equal(projected.revision,3);assert.equal(projected.sections.length,1);
  assert.doesNotMatch(JSON.stringify(projected),/secret-mutation|secret-fingerprint|updatedBy/);
  assert.equal(Object.hasOwn(projected,'draftMutationId'),false);
});
