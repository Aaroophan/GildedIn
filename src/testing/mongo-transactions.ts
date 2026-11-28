/** Synthetic serialized rollback model: NO proof a real Mongo tier supports transactions. */
import type {MongoTransactionRunner} from '../infrastructure/mongodb/audit.ts';
import type {FakeMongoDatabase} from './mongo-fake.ts';
export class FakeMongoTransactionRunner implements MongoTransactionRunner {
  private queue:Promise<void>=Promise.resolve();
  unavailable=false;
  private readonly db:FakeMongoDatabase;
  constructor(db:FakeMongoDatabase){this.db=db;}
  async execute<T>(cb:(session:unknown)=>Promise<T>):Promise<T> {
    if(this.unavailable)throw new Error('SYNTHETIC_TRANSACTION_UNAVAILABLE');
    let unlock!:()=>void;const next=new Promise<void>(resolve=>{unlock=resolve;});
    const preceding=this.queue;this.queue=next;await preceding;
    const snapshot=this.db.snapshot();
    try {if(this.unavailable)throw new Error('SYNTHETIC_TRANSACTION_UNAVAILABLE');
      return await cb({syntheticOnly:true});}
    catch(e){this.db.restore(snapshot);throw e;}
    finally{unlock();}
  }
}
