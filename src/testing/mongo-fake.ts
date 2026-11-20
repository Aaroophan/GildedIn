/** Deterministic ONLY for tests. Simulates indexed one-document CAS and BSON Date.
 * NEVER use as production persistence or as evidence of MongoDB tier capabilities.
 */
import {randomUUID} from 'node:crypto';
import type {MongoDatabase,CollectionLike,MongoFilter,MongoMutation} from '../infrastructure/mongodb/driver.ts';
import {MONGO_COLLECTIONS} from '../infrastructure/mongodb/manifest.ts';

type Doc=Record<string,unknown>;
type Index={keys:Record<string,1|-1>;options:Record<string,unknown>};
const copy=<T>(x:T):T=>structuredClone(x);
function field(doc:Doc,key:string):unknown {return key.split('.').reduce<unknown>((acc,k)=>
  acc&&typeof acc==='object'&&!Array.isArray(acc)?(acc as Doc)[k]:undefined,doc);}
function eq(a:unknown,b:unknown):boolean {return JSON.stringify(a)===JSON.stringify(b);}
function matches(doc:Doc,filter:MongoFilter):boolean{
  for(const [key,test] of Object.entries(filter)){
    if(key==='$or'){
      if(!Array.isArray(test)||!test.some(item=>item&&typeof item==='object'&&matches(doc,item as MongoFilter)))return false;
      continue;
    }
    const x=field(doc,key);
    if(test&&typeof test==='object'&&!Array.isArray(test) && Object.keys(test).some(k=>k.startsWith('$'))){
      const f=test as Doc;
      for(const [op,arg] of Object.entries(f)){
        if(op==='$in'&&(!Array.isArray(arg)||!arg.some(v=>eq(v,x))))return false;
        else if(op==='$ne'&&eq(x,arg))return false;
        else if(op==='$gt'&&!(x instanceof Date&&arg instanceof Date?x>arg:(x as number)>(arg as number)))return false;
        else if(op==='$gte'&&!(x instanceof Date&&arg instanceof Date?x>=arg:(x as number)>=(arg as number)))return false;
        else if(op==='$exists'&&((x!==undefined)!==arg))return false;
        else if(!['$in','$ne','$gt','$gte','$exists'].includes(op))throw new Error('FAKE_UNSUPPORTED_OPERATOR');
      }
    }else if(!eq(x,test))return false;
  }
  return true;
}
function mutate(doc:Doc,update:MongoMutation){
  for(const [operator,body] of Object.entries(update)){
    if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('FAKE_INVALID_UPDATE');
    for(const [key,value] of Object.entries(body)){
      if(key.includes('.')||key==='__proto__')throw new Error('FAKE_UNSAFE_UPDATE_KEY');
      if(operator==='$set')doc[key]=copy(value);
      else if(operator==='$inc')doc[key]=((doc[key] as number)??0)+(value as number);
      else throw new Error('FAKE_UNSUPPORTED_UPDATE');
    }
  }
}
class FakeCollection<T> implements CollectionLike<T> {
  readonly entries:Doc[]=[];readonly indexes:Index[]=[];
  failNextInsert=false;failNextUpdate=false;
  failRead=false;
  private assertAvailable(){if(this.failRead)throw new Error('FAKE_DB_UNAVAILABLE');}
  private checkUnique(row:Doc,ignore?:Doc){
    for(const idx of this.indexes.filter(i=>i.options.unique)){
      if(idx.options.partialFilterExpression&&!matches(row,idx.options.partialFilterExpression as MongoFilter))continue;
      if(this.entries.some(x=>x!==ignore&&(!idx.options.partialFilterExpression||matches(x,idx.options.partialFilterExpression as MongoFilter))&&
        Object.keys(idx.keys).every(key=>eq(field(row,key),field(x,key)))))
        throw Object.assign(new Error('E11000 duplicate key'),{code:11000});
    }
  }
  async insertOne(row:T):Promise<{acknowledged:boolean;insertedId:unknown}>{
    this.assertAvailable();if(this.failNextInsert){this.failNextInsert=false;throw new Error('FAKE_INSERT_FAILED');}
    const stored={...copy(row as Doc),_id:randomUUID()};this.checkUnique(stored);this.entries.push(stored);
    return {acknowledged:true,insertedId:stored._id};
  }
  async findOne(filter:MongoFilter,options?:Record<string,unknown>):Promise<T|null>{
    this.assertAvailable();const found=this.entries.find(doc=>matches(doc,filter));return found?copy(this.project(found,options)):null;
  }
  private project(doc:Doc,options?:Record<string,unknown>):T{
    const projection=options?.projection as Doc|undefined;
    const cloned=copy(doc);
    if(projection)for(const [key,value] of Object.entries(projection))if(value===0)delete cloned[key];
    return cloned as T;
  }
  async updateOne(filter:MongoFilter,update:MongoMutation):Promise<{matchedCount:number;modifiedCount:number}>{
    this.assertAvailable();if(this.failNextUpdate){this.failNextUpdate=false;throw new Error('FAKE_UPDATE_FAILED');}
    const target=this.entries.find(x=>matches(x,filter));if(!target)return {matchedCount:0,modifiedCount:0};
    const next=copy(target);mutate(next,update);this.checkUnique(next,target);
    for(const k of Object.keys(target))delete target[k];Object.assign(target,next);
    return {matchedCount:1,modifiedCount:1};
  }
  async findOneAndUpdate(filter:MongoFilter,update:MongoMutation,options?:Record<string,unknown>):Promise<T|null>{
    this.assertAvailable();if(this.failNextUpdate){this.failNextUpdate=false;throw new Error('FAKE_UPDATE_FAILED');}
    const target=this.entries.find(x=>matches(x,filter));if(!target)return null;
    const before=copy(target);const next=copy(target);mutate(next,update);this.checkUnique(next,target);
    for(const k of Object.keys(target))delete target[k];Object.assign(target,next);
    return copy(this.project(options?.returnDocument==='before'?before:target,options));
  }
  find(filter:MongoFilter,options?:Record<string,unknown>){
    this.assertAvailable();
    return {sort:(order:MongoFilter)=>({limit:(max:number)=>({toArray:async():Promise<T[]>=>{
      const keys=Object.entries(order);
      const rows=this.entries.filter(row=>matches(row,filter));
      rows.sort((a,b)=>{
        for(const [key,direction] of keys){
          const x=field(a,key),y=field(b,key);
          if(eq(x,y))continue;
          if(x===undefined)return 1;if(y===undefined)return -1;
          return (String(x)<String(y)?-1:1)*(direction===-1?-1:1);
        }
        return 0;
      });
      return rows.slice(0,max).map(row=>copy(this.project(row,options)));
    }})})};
  }
  async createIndex(keys:MongoFilter,options:Record<string,unknown>={}){
    this.indexes.push({keys:keys as Record<string,1|-1>,options});return String(options.name??'index');
  }
}
export class FakeMongoDatabase implements MongoDatabase {
  private collections=new Map<string,FakeCollection<unknown>>();
  private schemas=new Map<string,Record<string,unknown>>();
  constructor(){for(const name of MONGO_COLLECTIONS)this.collections.set(name,new FakeCollection());}
  collection<T>(name:string):CollectionLike<T>{
    const c=this.collections.get(name);if(!c)throw new Error('FAKE_UNKNOWN_COLLECTION');
    return c as CollectionLike<T>;
  }
  inspect<T>(name:string):FakeCollection<T>{return this.collection<T>(name) as FakeCollection<T>;}
  /** Fake rollback for synthetic audit integration tests; not a live Mongo transaction proof. */
  snapshot():Map<string,Doc[]>{
    return new Map([...this.collections].map(([name,c])=>[name,copy(c.entries)]));
  }
  restore(snapshot:Map<string,Doc[]>):void{
    for(const [name,rows] of snapshot){const c=this.collections.get(name);
      if(!c)continue;c.entries.splice(0,c.entries.length,...copy(rows));}
  }
  async createCollection(name:string,options:Record<string,unknown>={}){
    if(!this.collections.has(name))throw new Error('FAKE_UNKNOWN_COLLECTION');
    this.schemas.set(name,options);return {};
  }
  async command(cmd:MongoMutation):Promise<Record<string,unknown>>{
    const name=String(cmd.collMod);if(!this.collections.has(name))throw new Error('FAKE_UNKNOWN_COLLECTION');
    this.schemas.set(name,cmd as Record<string,unknown>);return {ok:1};
  }
  listCollections(filter:MongoFilter){void filter;return {toArray:async()=>[...this.schemas.keys()].map(name=>({name}))};}
}
