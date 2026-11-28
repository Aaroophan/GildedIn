'use client';
/** Issue 11 autosave: one in-flight mutation, matching acknowledgments, bounded recovery.
 * Session storage is advisory and NEVER an authorization or publication source. */
import {useEffect,useRef,useState} from 'react';
import type {ContentDraftShape} from '../../../domain/content/types.ts';
import {beginDraftSave,completeDraftSave,uncertainDraftSave,reconcileDraftSave,
  recoveryStorageKey,readScopedRecovery,encodeRecovery,DRAFT_RECOVERY_TTL_MS,workspaceDiff} from '../../../domain/editor/autosave.ts';
import type {DraftSaveCursor,DraftSavePhase,DraftRecovery,MutationStatus,PendingDraftSave} from '../../../domain/editor/autosave.ts';
import {OwnerRequestError,ownerRequest} from '../request.ts';
import {parseContentDraft} from '../../../domain/content/model.ts';
interface ResponseAck {revision:number;updatedAt:string;status:'saved'|'replayed';}
interface RemoteDraft {draft:ContentDraftShape & {revision:number};}
const workspace=(draft:ContentDraftShape)=>({schemaVersion:1 as const,sections:draft.sections,
  nodes:draft.nodes,contentCollections:draft.contentCollections});
const getOwnJson=async<T,>(url:string):Promise<T>=>{
  const response=await fetch(url,{cache:'no-store',credentials:'same-origin'});
  if(!response.ok){let code:string|undefined;
    try{const p=await response.json() as {code?:unknown};if(typeof p.code==='string')code=p.code;}catch{}
    throw new OwnerRequestError(response.status,code);
  }
  return response.json() as Promise<T>;
};
export function useDraftAutosave(input:{portfolioId:string;accountId:string;revision:number;
  initial:ContentDraftShape;draft:ContentDraftShape;legacy:boolean;
  onRestore:(draft:ContentDraftShape)=>void}){
  const {portfolioId,accountId,draft,legacy}=input;
  const [cursor,setCursor]=useState<DraftSaveCursor>(()=>({revision:input.revision,
    acknowledgedFingerprint:JSON.stringify(input.initial),phase:'saved'}));
  const cursorRef=useRef(cursor);
  const draftRef=useRef(draft),fingerprint=JSON.stringify(draft);
  const fpRef=useRef(fingerprint);draftRef.current=draft;fpRef.current=fingerprint;
  const [message,setMessage]=useState('Draft loaded. Future edits save automatically to this private draft.');
  const [remote,setRemote]=useState<RemoteDraft['draft']|null>(null);
  const [recovery,setRecovery]=useState<DraftRecovery|null|undefined>(undefined);
  const [retryCount,setRetryCount]=useState(0);
  const pendingSnapshot=useRef<ReturnType<typeof workspace>|null>(null);
  const key=recoveryStorageKey(accountId,portfolioId);
  const noticeKey=`gildedin:revision:v1:${accountId}:${portfolioId}`;
  const dirty=fingerprint!==cursor.acknowledgedFingerprint;
  const active=cursor.phase!=='conflict'&&cursor.phase!=='blocked';
  function update(next:DraftSaveCursor){cursorRef.current=next;setCursor(next);}
  useEffect(()=>{if(cursor.phase==='saved'&&dirty)update({...cursor,phase:'unsaved'});
    else if(cursor.phase==='unsaved'&&!dirty)update({...cursor,phase:'saved'});
  },[fingerprint,cursor.phase,dirty]);
  useEffect(()=>{
    try{const raw=sessionStorage.getItem(key),record=readScopedRecovery(raw,accountId,portfolioId,Date.now());
      if(raw&&!record)sessionStorage.removeItem(key);
      if(record&&JSON.stringify(record.workspace)!==JSON.stringify(workspace(input.initial))){
        try{parseContentDraft({...input.initial,...record.workspace});setRecovery(record);}
        catch{sessionStorage.removeItem(key);setRecovery(null);}
      }else setRecovery(null);
    }catch{setRecovery(null);}
    // Only read the key for this server-authorized account + portfolio.
  },[key]);
  useEffect(()=>{
    if(recovery!==null||!dirty)return;
    try{
      const now=Date.now(),text=encodeRecovery({version:1,accountId,portfolioId,
        baseRevision:cursor.revision,createdAt:now,expiresAt:now+DRAFT_RECOVERY_TTL_MS,workspace:workspace(draft)});
      if(text)sessionStorage.setItem(key,text);
      else setMessage('Your unsaved work is larger than the browser recovery limit. Keep this tab open or save it.');
    }catch{setMessage('Browser recovery is unavailable. Unsaved work remains only in this tab.');}
  },[fingerprint,cursor.revision,dirty,recovery,key]);
  useEffect(()=>{if(dirty||recovery!==null)return;
    try{sessionStorage.removeItem(key);}catch{}
  },[dirty,key,recovery]);
  async function fetchLatest():Promise<RemoteDraft['draft']>{
    const response=await getOwnJson<RemoteDraft>(`/api/v1/portfolios/${portfolioId}/draft`);
    if(!Number.isSafeInteger(response.draft.revision))throw new Error('Invalid draft revision');
    setRemote(response.draft);return response.draft;
  }
  async function markConflict(reason:string){
    const prev=cursorRef.current;update({...prev,phase:'conflict'});
    setMessage(reason+' Your local work has been kept. Review the newer saved draft before choosing what to do.');
    try{await fetchLatest();}catch{setMessage(reason+' The latest draft could not be fetched; retry when signed in.');}
  }
  async function sendPending(pending:PendingDraftSave,snapshot:ReturnType<typeof workspace>){
    try{
      const result=await ownerRequest<ResponseAck>(`/api/v1/portfolios/${portfolioId}/draft/workspace`,
        'PUT',snapshot,{'If-Match':`"rev-${pending.expectedRevision}"`,
          'X-Client-Mutation-Id':pending.clientMutationId});
      if(cursorRef.current.phase==='conflict'||cursorRef.current.phase==='blocked')return;
      const next=completeDraftSave(cursorRef.current,pending.clientMutationId,result.revision,fpRef.current);
      update(next);pendingSnapshot.current=null;setRetryCount(0);
      setMessage(next.phase==='saved'?`Saved · revision ${next.revision}. Nothing was published.`:
        `Revision ${next.revision} saved. Newer local edits are still unsaved.`);
      try{localStorage.setItem(noticeKey,String(next.revision));}catch{}
    }catch(e){
      if(e instanceof OwnerRequestError&&[409,412].includes(e.status)){
        await markConflict('Another revision was saved before this edit.');return;
      }
      if(e instanceof OwnerRequestError&&[401,403,404].includes(e.status)){
        update({...cursorRef.current,phase:'blocked'});
        setMessage('Editing access has changed or your session expired. Sign in again before retrying. Your local edits were not submitted.');return;
      }
      if(cursorRef.current.phase==='conflict'||cursorRef.current.phase==='blocked')return;
      update(uncertainDraftSave(cursorRef.current));
      setMessage('The save response was lost or the service is unavailable. Checking the server before retrying.');
    }
  }
  async function saveNow(){
    const current=cursorRef.current;
    if(!active||legacy||current.pending||fpRef.current===current.acknowledgedFingerprint)return;
    const pendingToken=crypto.randomUUID();
    const next=beginDraftSave(current,fpRef.current,pendingToken);
    update(next);pendingSnapshot.current=workspace(draftRef.current);setRetryCount(0);
    setMessage('Saving…');
    await sendPending(next.pending!,pendingSnapshot.current);
  }
  async function reconcile(){
    const c=cursorRef.current,p=c.pending;if(!p||c.phase!=='uncertain')return;
    try{
      const status=await getOwnJson<MutationStatus>(
        `/api/v1/portfolios/${portfolioId}/draft/mutations/${p.clientMutationId}`);
      const result=reconcileDraftSave(c,status,fpRef.current);
      if(result.kind==='conflict'){await markConflict('The server has a different draft revision.');return;}
      if(result.kind==='acknowledged'){
        update(result.cursor);pendingSnapshot.current=null;setRetryCount(0);
        setMessage(result.cursor.phase==='saved'?`Save confirmed · revision ${result.cursor.revision}.`:
          `Save confirmed · revision ${result.cursor.revision}. Newer changes remain unsaved.`);
        try{localStorage.setItem(noticeKey,String(result.cursor.revision));}catch{}
        return;
      }
      update(result.cursor);
      if(!pendingSnapshot.current){await markConflict('The original save snapshot is not available.');return;}
      setMessage('The server has not acknowledged this operation. Retrying the same mutation ID.');
      await sendPending(p,pendingSnapshot.current);
    }catch(e){
      if(e instanceof OwnerRequestError&&[401,403,404].includes(e.status)){
        update({...cursorRef.current,phase:'blocked'});setMessage('Session or ownership changed. Sign in before continuing.');
      }else{update({...cursorRef.current,phase:'uncertain'});
        setMessage('Could not confirm the save outcome. Keep your work and retry after reconnecting.');}
    }
  }
  useEffect(()=>{
    if(!dirty||!active||legacy||cursor.phase!=='unsaved'||recovery!==null)return;
    const timer=window.setTimeout(()=>{void saveNow();},850);return()=>window.clearTimeout(timer);
  },[fingerprint,cursor.phase,dirty,legacy,recovery]);
  useEffect(()=>{
    if(cursor.phase!=='uncertain'||retryCount>=3)return;
    const timer=window.setTimeout(()=>{setRetryCount(x=>x+1);void reconcile();},1000*2**retryCount);
    return()=>window.clearTimeout(timer);
  },[cursor.phase,retryCount]);
  useEffect(()=>{
    const onChange=(event:StorageEvent)=>{
      if(event.key==='gildedin:account-signout:v1'){
        try{sessionStorage.removeItem(key);}catch{}
        update({...cursorRef.current,phase:'blocked'});window.location.replace('/login');return;
      }
      if(event.key!==noticeKey||!event.newValue)return;
      const other=Number(event.newValue);
      if(Number.isSafeInteger(other)&&other>cursorRef.current.revision){
        update({...cursorRef.current,phase:'conflict'});
        setMessage('Another tab saved a newer revision. Your edits remain local until you compare changes.');
        void fetchLatest();
      }
    };
    window.addEventListener('storage',onChange);return()=>window.removeEventListener('storage',onChange);
  },[noticeKey,key]);
  function discardRecovery(){try{sessionStorage.removeItem(key);}catch{}setRecovery(null);}
  async function restoreRecovery(){
    if(!recovery)return;
    const candidate:ContentDraftShape={...draftRef.current,...recovery.workspace};
    try{parseContentDraft(candidate);}catch{discardRecovery();setMessage('The saved recovery is incompatible with the current draft; it was not applied.');return;}
    input.onRestore(candidate);setRecovery(null);
    if(recovery.baseRevision!==cursorRef.current.revision)
      await markConflict('Local recovery was based on an older server revision.');
    else setMessage('Recovered local changes. They are not saved until the server acknowledges them.');
  }
  async function inspectLatest(){try{await fetchLatest();}catch{setMessage('Unable to compare the server draft. Retry after signing in.');}}
  function overrideAfterReview(){
    if(!remote||cursorRef.current.phase!=='conflict')return;
    update({revision:remote.revision,acknowledgedFingerprint:cursorRef.current.acknowledgedFingerprint,phase:'unsaved'});
    pendingSnapshot.current=null;setRemote(null);
    setMessage('You explicitly chose to replace the latest canvas workspace. Saving requires a new revision check.');
  }
  function discardAndReload(){try{sessionStorage.removeItem(key);}catch{}window.location.reload();}
  const differences=remote?workspaceDiff(workspace(draft),workspace(remote)):[];
  return {revision:cursor.revision,phase:cursor.phase as DraftSavePhase,dirty,message,
    saveNow,reconcile,remote,inspectLatest,differences,overrideAfterReview,
    discardAndReload,recovery,restoreRecovery,discardRecovery,
  };
}
