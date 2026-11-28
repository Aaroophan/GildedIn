/** Trusted operator CLI ONLY. No HTTP endpoint; no first-user/email bootstrap.
 * Requires verified provider identity + explicit single-operation approval from the operator.
 * Do not run against an unverified MongoDB tier/credential. Never print the provider subject.
 */
import {loadServerEnvironment} from '../src/server/config/server.ts';
import {requireIdentityRepository} from '../src/bootstrap/identity-runtime.ts';
import {parseAccountId,parseOperationId} from '../src/shared/domain/identifiers.ts';
const [accountText,provider,subject,operationText,flag]=process.argv.slice(2);
const die=reason=>{console.error(`BOOTSTRAP_BLOCKED: ${reason}`);process.exit(2);};
if(flag!=='--approve-reviewed-operation')die('explicit-approval-flag-required');
if(!operationText||process.env.GI_APPROVED_BOOTSTRAP_OPERATION_ID!==operationText)
  die('one-operation-operator-approval-missing');
if(!['google','github'].includes(provider)||typeof subject!=='string'||subject.length<1||subject.length>200)
  die('provider-subject-required');
let accountId,operationId;
try{accountId=parseAccountId(accountText);operationId=parseOperationId(operationText);}
catch{die('canonical-ids-required');}
const env=loadServerEnvironment();
if(env.APP_ENV!=='local'&&env.APP_ENV!=='production')die('no-preview-or-test-bootstrap');
if(env.APP_ENV==='production'&&env.APP_ZERO_CHARGE_APPROVED!=='true')die('production-review-required');
const repo=await requireIdentityRepository();
const result=await repo.bootstrapAdmin(true,accountId,provider,subject,operationId);
console.log(result==='granted'?'ADMIN_ROLE_GRANTED_AND_AUDITED':'ADMIN_ALREADY_PRESENT_NO_CHANGE');
