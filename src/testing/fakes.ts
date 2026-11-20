/** Test-only deterministic providers, no network and no real credentials. */
export interface FakeClock { now():Date; advance(ms:number):void; }
export function makeFakeClock(initial='2026-01-01T00:00:00.000Z'):FakeClock {
  let time=Date.parse(initial);if(!Number.isFinite(time))throw new Error('INVALID_TEST_TIME');
  return {now:()=>new Date(time),advance(ms){if(!Number.isSafeInteger(ms)||ms<0)throw new Error('INVALID_DURATION');time+=ms;}};
}
export interface FakeStore { readonly objects:Map<string,Uint8Array>; put(key:string,bytes:Uint8Array):void; get(key:string):Uint8Array|null; }
export function makeFakeStore():FakeStore {
  const objects=new Map<string,Uint8Array>();
  return {objects,put(key,bytes){if(!/^test\/[a-zA-Z0-9/_-]{1,80}$/.test(key))throw new Error('UNSAFE_STORAGE_KEY');objects.set(key,bytes.slice());},
  get(key){return objects.get(key)?.slice()??null;}};
}
export function makeIsolatedNamespace(suffix:string):string {
  if(!/^[a-z0-9]{8,50}$/.test(suffix))throw new Error('INVALID_TEST_NAMESPACE');
  return `gildedin_test_${suffix}`;
}
/** Test cleanup never accepts an unverified production scope. */
export function clearOnlyFakeStore(fake:FakeStore):void {fake.objects.clear();}
