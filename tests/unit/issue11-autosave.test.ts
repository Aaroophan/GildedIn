import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {beginDraftSave,completeDraftSave,uncertainDraftSave,reconcileDraftSave,
  recoveryStorageKey,readScopedRecovery,encodeRecovery,DRAFT_RECOVERY_TTL_MS,workspaceDiff}
  from '../../src/domain/editor/autosave.ts';
import {parsePreviewSelection} from '../../src/domain/editor/preview.ts';
import type {DraftSaveCursor,DraftRecovery} from '../../src/domain/editor/autosave.ts';
const original:DraftSaveCursor={revision:7,acknowledgedFingerprint:'A',phase:'saved'};
const changed=()=>beginDraftSave(original,'B',randomUUID());
test('11.2 saving requires changed snapshot and monotonic revision',()=>{
  const saved=beginDraftSave(original,'A',randomUUID());assert.equal(saved.phase,'saved');
  const pending=changed();assert.equal(pending.phase,'saving');assert.equal(pending.pending?.expectedRevision,7);
  assert.throws(()=>beginDraftSave(pending,'C',randomUUID()));
  assert.throws(()=>beginDraftSave(original,'B','invalid'));
});
test('11.2 ACK for snapshot A does not label later local edit B as Saved',()=>{
  const pending=changed();const result=completeDraftSave(pending,pending.pending!.clientMutationId,8,'C');
  assert.equal(result.revision,8);assert.equal(result.phase,'unsaved');assert.equal(result.acknowledgedFingerprint,'B');
});
test('11.2 exact acknowledged edit is marked saved only for correct token and revision',()=>{
  const p=changed();const result=completeDraftSave(p,p.pending!.clientMutationId,8,'B');
  assert.equal(result.phase,'saved');assert.equal(result.pending,undefined);
  assert.throws(()=>completeDraftSave(p,'different',8,'B'));
  assert.throws(()=>completeDraftSave(p,p.pending!.clientMutationId,9,'B'));
});
test('11.3 lost ACK reconciliation trusts current revision and matching receipt',()=>{
  const p=uncertainDraftSave(changed());const result=reconcileDraftSave(p,
    {status:'acknowledged',revision:8,acknowledgedRevision:8},'B');
  assert.equal(result.kind,'acknowledged');assert.equal(result.cursor.phase,'saved');
});
test('11.3 unrecognized and unchanged revision means retry the SAME id',()=>{
  const p=uncertainDraftSave(changed());const result=reconcileDraftSave(p,{status:'unrecognized',revision:7},'B');
  assert.equal(result.kind,'retry');assert.equal(result.cursor.pending!.clientMutationId,p.pending!.clientMutationId);
});
test('11.3 evicted prior ACK or newer server revision always requires conflict review',()=>{
  const p=uncertainDraftSave(changed());
  for(const receipt of [{status:'unrecognized',revision:8},
    {status:'acknowledged',revision:9,acknowledgedRevision:8}] as const)
    assert.equal(reconcileDraftSave(p,receipt,'B').kind,'conflict');
});
test('11.4 a conflicting tab cannot start another mutation without owner review',()=>{
  const p=changed();const c={...p,phase:'conflict' as const,pending:undefined};
  assert.throws(()=>beginDraftSave(c,'C',randomUUID()));
  assert.throws(()=>beginDraftSave({...c,phase:'blocked'},'C',randomUUID()));
});
test('11.5 recovery storage keys are scoped to two opaque identities',()=>{
  const a=randomUUID(),b=randomUUID(),p=randomUUID();assert.notEqual(recoveryStorageKey(a,p),recoveryStorageKey(b,p));
  assert.throws(()=>recoveryStorageKey('stolen',p));
});
test('11.5 bounded recovery round-trips only for matching identity and unexpired timestamp',()=>{
  const accountId=randomUUID(),portfolioId=randomUUID(),now=1000000;
  const record:DraftRecovery={version:1,accountId,portfolioId,baseRevision:7,createdAt:now-30,
    expiresAt:now+10000,workspace:{schemaVersion:1,sections:[],nodes:[],contentCollections:[]}};
  const encoded=encodeRecovery(record)!;
  assert.deepEqual(readScopedRecovery(encoded,accountId,portfolioId,now),record);
  assert.equal(readScopedRecovery(encoded,randomUUID(),portfolioId,now),null);
  assert.equal(readScopedRecovery(encoded,accountId,randomUUID(),now),null);
  assert.equal(readScopedRecovery(encoded,accountId,portfolioId,now+10001),null);
});
test('11.5 malformed, overlong, extended-TTL and unexpected recovery metadata is rejected',()=>{
  const accountId=randomUUID(),portfolioId=randomUUID(),now=1000000;
  const base={version:1,accountId,portfolioId,baseRevision:7,createdAt:now,
    expiresAt:now+DRAFT_RECOVERY_TTL_MS,workspace:{schemaVersion:1,sections:[],nodes:[],contentCollections:[]}};
  for(const candidate of [{...base,token:'private'}, {...base,expiresAt:base.expiresAt+1},
    {...base,workspace:{...base.workspace,ownerAccountId:accountId}},
    {...base,baseRevision:-1}, {...base,expiresAt:now-1}])
    assert.equal(readScopedRecovery(JSON.stringify(candidate),accountId,portfolioId,now),null);
  assert.equal(readScopedRecovery('not json',accountId,portfolioId,now),null);
  assert.equal(readScopedRecovery('x'.repeat(120001),accountId,portfolioId,now),null);
  assert.equal(encodeRecovery({...base,workspace:{...base.workspace,nodes:['x'.repeat(120001)]}} as DraftRecovery),null);
});
test('11.4 conflict summary contains area labels only, never field values',()=>{
  const result=workspaceDiff({sections:['secret-phrase'],nodes:[],contentCollections:[]},
    {sections:[],nodes:[],contentCollections:[]});
  assert.deepEqual(result,['Section order and visibility']);assert.ok(!result.join('').includes('secret-phrase'));
});
test('11.6 preview query defaults to root / desktop / animation paused',()=>{
  assert.deepEqual(parsePreviewSelection('https://example.test/preview'),{mode:'desktop',route:'/',animations:'paused'});
});
test('11.6 preview request parses explicit revision, viewport and play mode',()=>{
  assert.deepEqual(parsePreviewSelection('https://example.test/preview?mode=mobile&route=%2F&animations=play&revision=25'),
    {mode:'mobile',route:'/',animations:'play',revision:25});
});
test('11.6 hostile and unsupported preview query values fail closed',()=>{
  for(const suffix of ['mode=tv','animations=on','route=%2F..%2Fadmin','route=%2Fprojects%2Fexample',
    'revision=-1','revision=01','revision=9999999999999999999999','mode=mobile&mode=desktop',
    'token=share','mode=desktop&ownerAccountId=anything'])
    assert.throws(()=>parsePreviewSelection(`https://example.test/preview?${suffix}`),Error);
});
