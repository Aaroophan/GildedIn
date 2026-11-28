import test from 'node:test';
import assert from 'node:assert/strict';
import {EMPTY_WIZARD,JOURNEY_STEPS,normalizeOnboardingSlug,wizardStepErrors,createFromWizard,
  safeDashboardReturnTo,ownerLifecycle,ownerQuota,explainOwnerError} from '../../src/domain/onboarding/model.ts';
import type {WizardData,OwnerPortfolioState} from '../../src/domain/onboarding/model.ts';
import {parseCreationCommand} from '../../src/domain/tenancy/commands.ts';
const valid=():WizardData=>({...EMPTY_WIZARD,displayName:'Synthetic Engineer',slug:'Me-Portfolio',
  identityLabel:'Student',introduction:'Studying software systems, no employment experience claimed.'});
const portfolio=():OwnerPortfolioState=>({slug:'me-portfolio',status:'onboarding',visibility:'public',
  activeReleaseId:null,draftRevision:0,securityVersion:0,aliases:[],canonicalUrl:'https://aaroophan.dev/me-portfolio'});
test('9.3 all five owner steps exist and no first project is required',()=>{
  assert.deepEqual(JOURNEY_STEPS,['identity','professional','appearance','project','review']);
  const cmd=createFromWizard(valid());assert.equal(cmd.slug,'me-portfolio');assert.equal(cmd.firstProject,undefined);
  assert.equal(cmd.templatePreset,'signature');
});
test('9.3 optional first project is preserved as explicitly owner-authored text only',()=>{
  const data={...valid(),firstProjectTitle:'Research prototype',firstProjectSummary:'A private draft example written by the owner.'};
  assert.deepEqual(createFromWizard(data).firstProject,{title:data.firstProjectTitle,summary:data.firstProjectSummary});
});
test('9.3 validation catches missing names, profile fields and unsafe markup before network',()=>{
  const empty={...EMPTY_WIZARD};const all=wizardStepErrors(empty,'review');
  assert.ok(all.displayName&&all.slug&&all.identityLabel&&all.introduction);
  assert.throws(()=>createFromWizard(empty),/ONBOARDING_VALIDATION_FAILED/);
  assert.ok(wizardStepErrors({...valid(),displayName:'<script>'},'identity').displayName);
  assert.ok(wizardStepErrors({...valid(),introduction:'A'.repeat(801)},'professional').introduction);
  assert.ok(wizardStepErrors({...valid(),identityLabel:'<'},'professional').identityLabel);
});
test('9.3 username normalization forbids a route namespace, confusable, traversal and separators',()=>{
  assert.equal(normalizeOnboardingSlug('ALEX-2'),'alex-2');
  for(const bad of ['api','login','dashboard','x','-hello','hello-','a..b','íñvalid','foo/bar','%2e%2e'])
    assert.equal(normalizeOnboardingSlug(bad),'');
});
test('9.3 optional project accepts a skipped state and rejects half-submitted, huge or executable text',()=>{
  assert.deepEqual(wizardStepErrors({...valid()},'project'),{});
  assert.ok(wizardStepErrors({...valid(),firstProjectSummary:'A summary without a title'},'project').firstProjectTitle);
  assert.ok(wizardStepErrors({...valid(),firstProjectTitle:'X'.repeat(161)},'project').firstProjectTitle);
  assert.ok(wizardStepErrors({...valid(),firstProjectTitle:'Hello',firstProjectSummary:'X'.repeat(601)},'project').firstProjectSummary);
  assert.ok(wizardStepErrors({...valid(),firstProjectTitle:'<img onerror=alert()>'},'project').firstProjectTitle);
});
test('9.3 server command rejects mass assignment, owner selectors, AI or public release changes',()=>{
  const cmd=createFromWizard(valid());
  for(const bad of [{...cmd,ownerAccountId:'victim'}, {...cmd,activeReleaseId:'fake'},
    {...cmd,firstProject:{title:'Safe',publicFieldIds:['title']}},
    {...cmd,firstProject:{title:'Safe',ownerVisibility:'public_candidate'}},
    {...cmd,firstProject:{title:'<script>'}},
    JSON.parse('{"slug":"alice","displayName":"Alice","identityLabel":"Dev","introduction":"Hello","$where":"true"}')])
      assert.throws(()=>parseCreationCommand(bad));
});
test('9.3 preset selection is closed, no custom style/CSS',()=>{
  assert.deepEqual(wizardStepErrors({...valid(),templatePreset:'unsafe' as never},'appearance'),{
    templatePreset:'Choose an approved design preset.'});
  assert.throws(()=>createFromWizard({...valid(),templatePreset:'<style>' as never}));
});
test('9.2 internal return-to allowlist blocks open redirects, encoded bypass and API paths',()=>{
  for(const good of ['/dashboard','/dashboard/onboarding','/dashboard/account','/dashboard/portfolio'])
    assert.equal(safeDashboardReturnTo(good),good);
  const path='/dashboard/portfolios/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/editor';
  assert.equal(safeDashboardReturnTo(path),path);
  for(const bad of ['https://evil.test','//evil.test','/\\evil','/%2fevil','/dashboard/../api',
    '/dashboard?next=https://evil.test','/dashboard#inject','/dashboard/tools/admin','/api/v1/accounts/me','/dashboard/%252fadmin','/dashboard'.repeat(50),null,{},0])
    assert.equal(safeDashboardReturnTo(bad),'/dashboard');
});
test('9.4 no portfolio and unpublished status cannot be mislabeled public or published',()=>{
  const s=ownerLifecycle(portfolio());assert.equal(s.title,'Not published yet');
  assert.equal(s.publiclyAccessible,false);assert.equal(s.unpublished,true);assert.match(s.draftLabel,/revision 0/);
});
test('9.4 unlisted stays accessible by link only with an active release',()=>{
  const s=ownerLifecycle({...portfolio(),status:'active',visibility:'unlisted',activeReleaseId:'release'});
  assert.equal(s.publiclyAccessible,true);assert.equal(s.robots,'No public indexing');
  assert.match(s.title,/Unlisted/);
});
test('9.4 suspended, disabled and removing states never advertise accessible site',()=>{
  for(const status of ['owner_disabled','suspended','deleting'] as const){
    const s=ownerLifecycle({...portfolio(),status,activeReleaseId:'release'});
    assert.equal(s.publiclyAccessible,false);assert.equal(s.robots,'No public indexing');
    if(status==='suspended'||status==='deleting')assert.equal(s.canEdit,false);
  }
});
test('9.8 quotas reflect exact spec caps and measured original metadata only',()=>{
  const quota=ownerQuota({...portfolio(),mediaUsage:{usedBytes:1024,reservedBytes:2048,originalFileCount:2}});
  assert.equal(quota.mediaFilesUsed,2);assert.equal(quota.mediaUsedBytes,1024);
  assert.equal(quota.mediaBytesLimit,15*1048576);assert.equal(quota.publishedReleaseBytes,102400);
  assert.equal(quota.blocksLimit,20);assert.equal(quota.itemsPerCollection,20);
  assert.ok(!Object.hasOwn(ownerQuota(portfolio()),'mediaFilesUsed'));
});
test('9.9 known error statuses map to safe recoverable UI copy, never raw exception text',()=>{
  assert.match(explainOwnerError(401),/expired/);assert.match(explainOwnerError(409,'SLUG_UNAVAILABLE'),/unavailable/);
  assert.match(explainOwnerError(403,'REAUTHENTICATION_REQUIRED'),/Verify/);
  assert.match(explainOwnerError(412),/Refresh/);
  assert.doesNotMatch(explainOwnerError(500,'PRIVATE_STACK_TRACE_SENTINEL'),/PRIVATE_STACK_TRACE_SENTINEL/);
});
