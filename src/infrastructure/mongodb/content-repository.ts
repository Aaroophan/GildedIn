/** Issue 6: authenticated content authoring inside one bounded draft aggregate.
 * No public draft reader, arbitrary update operators, or independent item collections.
 * Security-sensitive multi-record eligibility checks share the official Mongo transaction session.
 */
import {createHash} from 'node:crypto';
import {parsePortfolioId} from '../../shared/domain/identifiers.ts';
import type {PortfolioId,AccountId,MediaId} from '../../shared/domain/identifiers.ts';
import {canonicalJson,PRODUCT_LIMITS} from '../../shared/domain/limits.ts';
import type {AuthenticatedActor} from '../../domain/identity/contracts.ts';
import type {DraftRecord,PortfolioRecord,AccountRecord,SessionRecord,MediaRecord} from '../../domain/persistence/models.ts';
import type {MongoDatabase} from './driver.ts';
import {parseDraftRecord,parseAccountRecord,parsePortfolioRecord,parseMediaRecord} from './validation.ts';
import type {MongoTransactionRunner} from './audit.ts';
import {applyContentOperations,parseContentMutation} from '../../domain/content/commands.ts';
import type {MutationCommand} from '../../domain/content/commands.ts';
import {parseContentDraft} from '../../domain/content/model.ts';
import {importJsonSchema,parseCollectionDefinition} from '../../domain/content/schema.ts';
import {previewSchemaChange} from '../../domain/content/migration.ts';
import {ContentDenied} from '../../domain/content/errors.ts';
import {parseRichText} from '../../domain/content/rich-text.ts';
import type {ContentDraftShape,FieldDefinition,CollectionDefinition} from '../../domain/content/types.ts';
import {shape,integer,string,ensureJson} from '../../domain/content/strict.ts';
function sha256(value:unknown):string{return createHash('sha256').update(canonicalJson(value)).digest('hex');}
export type ContentSaveResult={kind:'saved'|'replayed';draft:DraftRecord}|{kind:'conflict';currentRevision:number};
export class MongoContentRepository {
  private readonly db:MongoDatabase;
  private readonly transactions:MongoTransactionRunner|null;
  private readonly now:()=>Date;
  constructor(db:MongoDatabase,transactions:MongoTransactionRunner|null,now:()=>Date=()=>new Date()){
    this.db=db;this.transactions=transactions;this.now=now;
  }
  private validTime():string{const d=this.now();if(!Number.isFinite(d.valueOf()))throw new ContentDenied('CONTENT_UNAVAILABLE');return d.toISOString();}
  private async readOwned(actor:AuthenticatedActor,id:PortfolioId,session?:unknown):Promise<DraftRecord>{
    if(!actor||typeof actor.accountId!=='string'||typeof actor.sessionId!=='string'||
      typeof actor.sessionLookupId!=='string'||!Number.isSafeInteger(actor.securityVersion))
      throw new ContentDenied('CONTENT_NOT_AUTHORIZED');
    try{parsePortfolioId(id);}catch{throw new ContentDenied('CONTENT_NOT_FOUND');}
    const now=this.now();if(!Number.isFinite(now.valueOf()))throw new ContentDenied('CONTENT_UNAVAILABLE');
    const options=session?{session}:undefined;
    const account=await this.db.collection<AccountRecord>('accounts').findOne({accountId:actor.accountId,
      securityVersion:actor.securityVersion,status:'active'},options);
    if(!account)throw new ContentDenied('CONTENT_NOT_AUTHORIZED');
    parseAccountRecord(account);
    const foundSession=await this.db.collection<SessionRecord>('sessions').findOne({
      sessionId:actor.sessionId,sessionLookupId:actor.sessionLookupId,accountId:actor.accountId,
      securityVersion:actor.securityVersion,revokedAt:{$exists:false},expiresAt:{$gt:now},
      idleExpiresAt:{$gt:now},absoluteExpiresAt:{$gt:now}},options);
    if(!foundSession)throw new ContentDenied('CONTENT_NOT_AUTHORIZED');
    const portfolio=await this.db.collection<PortfolioRecord>('portfolios').findOne({
      portfolioId:id,ownerAccountId:actor.accountId,status:{$in:['onboarding','active','owner_disabled']}},options);
    if(!portfolio)throw new ContentDenied('CONTENT_NOT_FOUND');
    parsePortfolioRecord(portfolio);
    const raw=await this.db.collection<DraftRecord>('drafts').findOne({portfolioId:id},options);
    if(!raw)throw new ContentDenied('CONTENT_NOT_FOUND');
    return parseDraftRecord(raw);
  }
  async getOwnedDraft(actor:AuthenticatedActor,id:PortfolioId):Promise<DraftRecord>{
    try{
      const raw=await this.readOwned(actor,id);
      return {...raw,...parseContentDraft(raw)};
    }catch(e){if(e instanceof ContentDenied)throw e;
      throw new ContentDenied('CONTENT_UNAVAILABLE');}
  }
  private async transaction<T>(fn:(session:unknown)=>Promise<T>):Promise<T>{
    if(!this.transactions)throw new ContentDenied('CONTENT_UNAVAILABLE');
    try {return await this.transactions.execute(fn);}
    catch(e){if(e instanceof ContentDenied)throw e;
      // Unknown write result or inconsistent provider capabilities are never treated as success.
      throw new ContentDenied('CONTENT_UNAVAILABLE');}
  }
  /** Resolve owned media via server-derived portfolio ID, never an ID provided in a field value alone. */
  private async verifyMedia(actor:AuthenticatedActor,id:PortfolioId,source:ContentDraftShape,
    session:unknown):Promise<void>{
    const required=new Map<string,'image'|'pdf'|'either'>();
    const push=(mediaId:string,kind:'image'|'pdf'|'either')=>{
      const old=required.get(mediaId);
      if(old&&old!==kind&&old!=='either'&&kind!=='either')throw new ContentDenied('CONTENT_INVALID');
      required.set(mediaId,kind==='either'?(old??kind):kind);
    };
    for(const media of source.mediaRefs)push(media,'either');
    const gather=(field:FieldDefinition,value:unknown):void=>{
      if(value===undefined||value===null)return;
      if(field.type==='image'||field.type==='pdf')push((value as {mediaId:string}).mediaId,field.type);
      else if(field.type==='richText'){for(const node of parseRichText(value).blocks)
        if(node.type==='image')push(node.mediaId,'image');}
      else if(field.type==='list')for(const item of value as unknown[])gather(field.item!,item);
      else if(field.type==='object')for(const nested of field.fields??[])
        gather(nested,(value as Record<string,unknown>)[nested.fieldId]);
    };
    for(const c of source.contentCollections){
      const def=source.collectionDefinitions.find(x=>x.collectionId===c.collectionId)!;
      for(const item of c.items)for(const f of def.fields)gather(f,item.fields[f.fieldId]);
    }
    for(const section of source.sections){
      const def=source.collectionDefinitions.find(x=>x.schemaId===section.schemaDefinitionId);
      if(def)for(const f of def.fields)gather(f,section.customValues?.[f.fieldId]);
    }
    if(required.size>PRODUCT_LIMITS.originalMediaFilesPerPortfolio)throw new ContentDenied('CONTENT_CAPACITY');
    for(const [mediaId,kind] of required){
      const raw=await this.db.collection<MediaRecord>('mediaAssets').findOne({mediaId,portfolioId:id,
        uploadedByAccountId:actor.accountId},{session});
      if(!raw)throw new ContentDenied('CONTENT_INVALID',
        [{path:'mediaRefs',code:'unavailable_media',message:'Media must belong to this portfolio.'}]);
      const media=parseMediaRecord(raw);
      if(!['ready_private','ready_public'].includes(media.state)||
        (kind==='image'&&media.kind!=='image')||(kind==='pdf'&&media.kind!=='resume_pdf'))
        throw new ContentDenied('CONTENT_INVALID',
          [{path:'mediaRefs',code:'media_type',message:'An approved media state and type are required.'}]);
    }
  }
  /** Single CAS update AFTER fully constructing and validating a nonpublic candidate. */
  async apply(actor:AuthenticatedActor,id:PortfolioId,rawCommand:unknown):Promise<ContentSaveResult>{
    const cmd=parseContentMutation(rawCommand);
    return this.save(actor,id,cmd,async stored=>applyContentOperations(stored,cmd.operations,this.validTime(),cmd.expectedRevision));
  }
  /** Whole-snapshot content save. Non-content draft fields are server-preserved until their own issues. */
  async putContent(actor:AuthenticatedActor,id:PortfolioId,raw:unknown,
    expectedRevision:number,clientMutationId:string):Promise<ContentSaveResult>{
    const candidate=shape(raw,['schemaVersion','rendererVersion','profile','sections','collectionDefinitions',
      'contentCollections','nodes','theme','navigation','seo','aiApprovals','mediaRefs'],'draft');
    if(candidate.schemaVersion!==1||!Number.isSafeInteger(expectedRevision)||expectedRevision<0||
      !/^[A-Za-z0-9_-]{8,96}$/.test(clientMutationId))throw new ContentDenied('CONTENT_INVALID');
    const required=['schemaVersion','rendererVersion','profile','sections','collectionDefinitions',
      'contentCollections','nodes','theme','navigation','seo','aiApprovals','mediaRefs'];
    if(required.some(key=>!Object.hasOwn(candidate,key)))throw new ContentDenied('CONTENT_INVALID');
    ensureJson(candidate,'draft',16,350_000);
    return this.save(actor,id,{expectedRevision,clientMutationId,operations:[candidate]},async stored=>{
      if(candidate.rendererVersion!==stored.rendererVersion||
        ['nodes','theme','navigation','seo','aiApprovals','mediaRefs'].some(k=>
          canonicalJson(candidate[k])!==canonicalJson(stored[k as keyof DraftRecord])))
        throw new ContentDenied('CONTENT_INVALID',
          [{path:'draft',code:'protected_field',message:'Layout and control-plane fields are not editable through content APIs.'}]);
      return parseContentDraft({...stored,profile:candidate.profile as Record<string,unknown>,
        sections:candidate.sections as DraftRecord['sections'],
        collectionDefinitions:candidate.collectionDefinitions as DraftRecord['collectionDefinitions'],
        contentCollections:candidate.contentCollections as DraftRecord['contentCollections']});
    });
  }
  private async save(actor:AuthenticatedActor,id:PortfolioId,cmd:MutationCommand,
    make:(stored:DraftRecord)=>Promise<ContentDraftShape>):Promise<ContentSaveResult>{
    const fingerprint=sha256({expectedRevision:cmd.expectedRevision,operations:cmd.operations});
    return this.transaction(async session=>{
      const stored=await this.readOwned(actor,id,session);
      if(stored.draftMutationId===cmd.clientMutationId){
        if(stored.draftMutationFingerprint!==fingerprint)throw new ContentDenied('CONTENT_CONFLICT');
        return {kind:'replayed',draft:{...stored,...parseContentDraft(stored)}};
      }
      if(stored.revision!==cmd.expectedRevision)return {kind:'conflict',currentRevision:stored.revision};
      const candidate=parseContentDraft(await make(stored));
      await this.verifyMedia(actor,id,candidate,session);
      const timestamp=this.validTime();
      const normalized:DraftRecord={...stored,profile:candidate.profile,sections:candidate.sections,
        collectionDefinitions:candidate.collectionDefinitions,contentCollections:candidate.contentCollections,
        nodes:candidate.nodes,mediaRefs:candidate.mediaRefs,revision:stored.revision+1,
        draftMutationId:cmd.clientMutationId,draftMutationFingerprint:fingerprint,
        updatedAt:timestamp,updatedBy:actor.accountId};
      parseDraftRecord(normalized);
      const updated=await this.db.collection<DraftRecord>('drafts').findOneAndUpdate({
        portfolioId:id,revision:stored.revision},{$set:{...normalized}},
        {session,returnDocument:'after'});
      if(!updated)throw new ContentDenied('CONTENT_CONFLICT');
      return {kind:'saved',draft:{...parseDraftRecord(updated),...parseContentDraft(updated)}};
    });
  }
  /** Parse/import is ALWAYS read-only and owner-only. Creates a candidate for a future CAS write. */
  async previewSchemaImport(actor:AuthenticatedActor,id:PortfolioId,raw:unknown):Promise<{
    candidate:CollectionDefinition;impact?:Awaited<ReturnType<typeof previewSchemaChange>>;
    mode:'new'|'change';revision:number}>{
    try{
      const ownerDraft=await this.getOwnedDraft(actor,id);
      const r=shape(raw,['format','collectionId','schemaId','displayName','kind','sectionId','schema'],
        'schemaImport');
      if(r.format!=='json-schema-2020-12'&&r.format!=='gildedin-v1')
        throw new ContentDenied('CONTENT_INVALID');
      const collectionId=string(r.collectionId,64,'schemaImport.collectionId',1),
        schemaId=string(r.schemaId,64,'schemaImport.schemaId',1),
        displayName=string(r.displayName,120,'schemaImport.displayName',1);
      const existing=ownerDraft.collectionDefinitions.find(x=>x&&typeof x==='object'&&
        (x as CollectionDefinition).collectionId===collectionId) as CollectionDefinition|undefined;
      const candidate=r.format==='gildedin-v1'?parseCollectionDefinition(r.schema,'schemaImport.schema'):
        importJsonSchema(r.schema,{collectionId,schemaId,displayName,kind:r.kind as CollectionDefinition['kind'],
          sectionId:r.sectionId as string|undefined,schemaVersion:existing?existing.schemaVersion+1:1});
      if(candidate.collectionId!==collectionId||candidate.schemaId!==schemaId||candidate.displayName!==displayName)
        throw new ContentDenied('CONTENT_INVALID');
      const impact=existing?await previewSchemaChange(ownerDraft,candidate,ownerDraft.revision):undefined;
      return {candidate,impact,mode:existing?'change':'new',revision:ownerDraft.revision};
    }catch(e){if(e instanceof ContentDenied)throw e;throw new ContentDenied('CONTENT_UNAVAILABLE');}
  }
}
