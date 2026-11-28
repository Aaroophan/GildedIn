import type {ContentDraftShape,SectionDefinition} from '../../../domain/content/types.ts';
import type {VisualNode,ComponentType,Breakpoint,AbsoluteLayout} from '../../../domain/composition/types.ts';
import type {CanvasCommand} from '../../../domain/editor/commands.ts';
import type {Handle,GeometryGuide} from '../../../domain/editor/geometry.ts';
import type {PointerEvent as ReactPointerEvent} from 'react';
export interface CanvasView{
  doc:ContentDraftShape;nodes:VisualNode[];activeSection:SectionDefinition;
  selectedIds:readonly string[];breakpoint:Breakpoint;width:number;zoom:number;
  preview:boolean;playing:boolean;
  gesture?:{nodeId:string;layout:AbsoluteLayout;guides:GeometryGuide[]};
  select:(id:string,additive:boolean)=>void;
  execute:(command:CanvasCommand)=>boolean;
  pointerDown:(id:string,handle:Handle,event:ReactPointerEvent<HTMLButtonElement>)=>void;
  pointerMove:(event:ReactPointerEvent<HTMLButtonElement>)=>void;
  pointerEnd:(event:ReactPointerEvent<HTMLButtonElement>,cancel?:boolean)=>void;
  inlineNodeId:string|null;inlineValue:string;endPlay:()=>void;
  startInline:(id:string)=>void;changeInline:(text:string)=>void;endInline:(save:boolean)=>void;
}
export interface InspectorView extends CanvasView{
  selected:VisualNode|null;announce:(text:string)=>void;
}
export interface StructureView extends CanvasView{
  view:'sections'|'blocks'|'collections';setView:(v:'sections'|'blocks'|'collections')=>void;
  setActiveSection:(id:string)=>void;addBlock:(kind:ComponentType)=>void;
}
