/** Read-time Gilden knowledge lookup. Does not store chat transcripts or prompts.
 * This does not call Groq; that feature requires its own Issue 16 consent and quota gates.
 */
import type {MongoDatabase} from './driver.ts';
import type {VerifiedPublicPortfolio} from '../../domain/persistence/ports.ts';
import type {AIContextRecord,PortfolioRecord,ModerationPolicyRecord} from '../../domain/persistence/models.ts';
import {parseAIContextRecord,parseModerationPolicyRecord,parsePortfolioRecord} from './validation.ts';
export class MongoAIContextRepository {
  private readonly db:MongoDatabase;private readonly now:()=>Date;
  constructor(db:MongoDatabase,now:()=>Date=()=>new Date()){this.db=db;this.now=now;}
  async getCurrentApproved(identity:VerifiedPublicPortfolio):Promise<AIContextRecord|null>{
    if(identity?.hostResolutionVerified!==true)return null;
    try{
      const p=await this.db.collection<PortfolioRecord>('portfolios').findOne({portfolioId:identity.portfolioId});
      if(!p)return null;
      const control=parsePortfolioRecord(p);
      if(control.status!=='active'||!control.activeReleaseId||!control.aiAccess.enabled)return null;
      const restrictions=await this.db.collection<ModerationPolicyRecord>('moderationPolicies')
        .find({portfolioId:identity.portfolioId,active:true}).sort({issuedAt:-1}).limit(101).toArray();
      if(restrictions.length>100)return null;
      for(const r of restrictions){const policy=parseModerationPolicyRecord(r);
        if((!policy.expiresAt||policy.expiresAt>this.now())&&
          ['deny_ai','suspend','quarantine','deny_public'].includes(policy.effect))return null;}
      const raw=await this.db.collection<AIContextRecord>('aiContexts').findOne({
        portfolioId:identity.portfolioId,releaseId:control.activeReleaseId,
        approvalPolicyVersion:control.aiAccess.revocationVersion,status:'ready',
        $or:[{expiresAt:{$exists:false}},{expiresAt:{$gt:this.now()}}]});
      if(!raw)return null;
      const context=parseAIContextRecord(raw);
      if(context.expiresAt&&context.expiresAt<=this.now())return null;
      if(context.sources.some(s=>control.aiAccess.deniedSourceIds.includes(s.sourceId)))return null;
      return context;
    }catch{return null;}
  }
}
