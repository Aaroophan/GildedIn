import test from 'node:test';
import assert from 'node:assert/strict';
import {preflightDecision} from '../../src/shared/domain/governance.ts';
import {makeAuditMetadata} from '../../src/shared/domain/audit.ts';
test('review blocks billable, unknown-terms providers before using real tenant data',()=>{
 assert.equal(preflightDecision({category:'provider',paymentCardRequired:true,billableOverflow:false,termsVerified:true,privacyVerified:true}).decision,'BLOCKED');
 assert.equal(preflightDecision({category:'provider',paymentCardRequired:false,billableOverflow:true,termsVerified:true,privacyVerified:true}).decision,'BLOCKED');
 assert.equal(preflightDecision({category:'provider',paymentCardRequired:false,billableOverflow:false,termsVerified:false,privacyVerified:true}).decision,'BLOCKED');
});
test('compatible patch can proceed through routine technical review while contract changes require ADR',()=>{
 assert.equal(preflightDecision({category:'library-patch',changesContract:false,licensingVerified:true,securityChecked:true}).decision,'ROUTINE_TECHNICAL_REVIEW');
 assert.equal(preflightDecision({category:'library-patch',changesContract:true,licensingVerified:true,securityChecked:true}).decision,'ADR_AND_OWNER_APPROVAL_REQUIRED');
 assert.equal(preflightDecision({category:'product-constraint',requirementId:'OPS-001'}).decision,'ADR_AND_OWNER_APPROVAL_REQUIRED');
});
test('audit adapter allowlists fields and refuses request bodies and unsafe codes',()=>{
 const event=makeAuditMetadata({requestId:'req_a234567b',category:'publication',outcome:'denied',code:'FORBIDDEN',rawPrompt:'SHOULD_NOT_LOG'} as any);
 assert.equal('rawPrompt' in event,false);
 assert.throws(()=>makeAuditMetadata({requestId:'req_a234567b',category:'publication',outcome:'denied',code:'FORBIDDEN\nsecret'}));
});
