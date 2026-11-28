/** Bounded in-memory, session-scoped snapshots; no browser persistence or cross-owner replay. */
export interface EditorHistory<T>{past:readonly T[];present:T;future:readonly T[];}
export const MAX_EDITOR_UNDO=50;
export function initialHistory<T>(present:T):EditorHistory<T>{return {past:[],present,future:[]};}
export function commitHistory<T>(history:EditorHistory<T>,next:T):EditorHistory<T>{
  return {past:[...history.past.slice(-(MAX_EDITOR_UNDO-1)),history.present],present:next,future:[]};
}
export function undoHistory<T>(history:EditorHistory<T>):EditorHistory<T>{
  if(!history.past.length)return history;
  return {past:history.past.slice(0,-1),present:history.past[history.past.length-1],
    future:[history.present,...history.future]};
}
export function redoHistory<T>(history:EditorHistory<T>):EditorHistory<T>{
  if(!history.future.length)return history;
  return {past:[...history.past.slice(-(MAX_EDITOR_UNDO-1)),history.present],
    present:history.future[0],future:history.future.slice(1)};
}
