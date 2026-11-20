/** A deliberately small structural subset of the official MongoDB Node driver's Db/Collection.
 * The injected implementation is the OFFICIAL driver. No homegrown Mongo wire protocol.
 * No credentials, network or MongoClient construction occur when this module is imported.
 */
export type MongoFilter = Readonly<Record<string,unknown>>;
export type MongoMutation = Readonly<Record<string,unknown>>;
export interface CollectionLike<T> {
  findOne(filter:MongoFilter, options?:Record<string,unknown>):Promise<T|null>;
  insertOne(record:T,options?:Record<string,unknown>):Promise<{acknowledged:boolean;insertedId:unknown}>;
  findOneAndUpdate(filter:MongoFilter,update:MongoMutation,options?:Record<string,unknown>):Promise<T|null>;
  updateOne(filter:MongoFilter,update:MongoMutation,options?:Record<string,unknown>):Promise<{matchedCount:number;modifiedCount:number;upsertedCount?:number}>;
  find(filter:MongoFilter,options?:Record<string,unknown>):{sort(order:MongoFilter):{limit(max:number):{toArray():Promise<T[]>}}};
  createIndex(keys:MongoFilter,options?:Record<string,unknown>):Promise<string>;
}
export interface MongoDatabase {
  collection<T>(name:string):CollectionLike<T>;
  createCollection?(name:string,options?:Record<string,unknown>):Promise<unknown>;
  command?(command:MongoMutation):Promise<Record<string,unknown>>;
  listCollections?(filter:MongoFilter):{toArray():Promise<{name:string}[]>};
}
export function isMongoDuplicateKey(error:unknown):boolean {
  return !!error && typeof error==='object' && 'code' in error && error.code===11000;
}
export class PersistenceUnavailable extends Error {
  readonly code='PERSISTENCE_UNAVAILABLE';
  constructor(){super('Persistent data is temporarily unavailable.');this.name='PersistenceUnavailable';}
}
export class PersistenceConflict extends Error {
  readonly code='PERSISTENCE_CONFLICT';
  constructor(){super('The operation conflicts with current stored state.');this.name='PersistenceConflict';}
}
export class PersistedRecordRejected extends Error {
  readonly code='PERSISTED_RECORD_REJECTED';
  constructor(){super('An incompatible or invalid stored record was rejected.');this.name='PersistedRecordRejected';}
}
