/** Immutable, provider-neutral visual grammar. One authored record is one node. */
import type {NodeId,SectionId,ContentId,MediaId} from '../../shared/domain/identifiers.ts';
import type {ContentBinding} from '../content/types.ts';
import type {RichTextDoc} from '../content/rich-text.ts';
export const COMPOSITION_SCHEMA_VERSION=1 as const;
export const COMPOSITION_COMPILER_VERSION='gi-composition-v1' as const;
export const COMPONENT_REGISTRY_VERSION='gi-components-v1' as const;
export const COMPOSITION_SERIALIZER_VERSION='gi-semantic-v1' as const;
export const BREAKPOINTS={mobile:{min:320,max:767},tablet:{min:768,max:1023},desktop:{min:1024,max:4096}} as const;
export type Breakpoint=keyof typeof BREAKPOINTS;
export type LayoutToken='none'|'xs'|'sm'|'md'|'lg'|'xl';
export interface AutoLayout {mode:'auto';flow:'row'|'column'|'grid';gapToken?:LayoutToken;
  alignment?:'start'|'center'|'end'|'stretch';columns?:1|2|3|4;
  minWidthToken?:LayoutToken;maxWidthToken?:LayoutToken;}
/** Parent-local fractions in [0,1]. Anchors resolve an origin against the parent. */
export interface AbsoluteLayout {mode:'absolute';x:number;y:number;width:number;height:number;
  anchorX:'left'|'center'|'right';anchorY:'top'|'center'|'bottom';
  zIndexToken:'base'|'raised'|'overlay'|'decoration';minSizeToken?:LayoutToken;
  maxSizeToken?:LayoutToken;aspectRatio?:number;
  overflow:'visible-decorative'|'clip-decorative'|'visible-content';}
export interface HybridLayout {mode:'hybrid';placement:AbsoluteLayout;childrenFlow:AutoLayout;}
export type SafeLayout=AutoLayout|AbsoluteLayout|HybridLayout;
export type SafeInteraction={kind:'none'}|{kind:'navigate';routeId:'home'|'projects'|'experience'|'references'|'contact'}|
 {kind:'scrollToSection';sectionId:SectionId}|{kind:'togglePanel'|'openModal';targetNodeId:NodeId}|
 {kind:'switchTab';groupNodeId:NodeId;tabId:string}|
 {kind:'advanceCarousel';carouselNodeId:NodeId;delta:-1|1}|{kind:'openContactForm'};
export type ComponentType='heading'|'text'|'button'|'link'|'image'|'container'|'group'|'grid'|'card'|
 'repeater'|'gallery'|'tabs'|'accordion'|'carousel'|'timeline'|'contactForm'|'comparisonTable';
export type SemanticRole='h1'|'h2'|'h3'|'paragraph'|'article'|'navigation'|'decorative';
export interface VisualNode {nodeId:NodeId;sectionId:SectionId;parentNodeId?:NodeId;
  componentType:ComponentType;componentVersion:1;props:Record<string,unknown>;contentBinding?:ContentBinding;
  layout:SafeLayout;responsiveOverrides?:Partial<Record<Breakpoint,Partial<SafeLayout>>>;
  visualOrder:number;readingOrder:number;semanticRole?:SemanticRole;
  visibilityByBreakpoint?:Partial<Record<Breakpoint,boolean>>;
  interaction:SafeInteraction;locked?:boolean;}
export interface CompositionDocument {schemaVersion:1;nodes:VisualNode[];}
export interface CompilationIssue {path:string;nodeId?:string;sectionId?:string;breakpoint?:Breakpoint;
  severity:'blocker'|'warning';code:string;message:string;repair:string;}
export interface SemanticNode {nodeId:string;sectionId:string;componentType:ComponentType;tag:string;
  role?:SemanticRole;text?:string;richText?:RichTextDoc;href?:string;alt?:string;mediaId?:MediaId;
  props:Readonly<Record<string,unknown>>;interaction:SafeInteraction;
  children:SemanticNode[];items?:readonly {key:string;title:string;description?:string;href?:string}[];}
export interface SemanticSection {sectionId:string;anchor:string;type:string;nodes:SemanticNode[];}
export interface SemanticRenderPlan {schemaVersion:1;compilerVersion:typeof COMPOSITION_COMPILER_VERSION;
  registryVersion:typeof COMPONENT_REGISTRY_VERSION;serializerVersion:typeof COMPOSITION_SERIALIZER_VERSION;
  authoredNodeCount:number;generatedRepeaterItems:number;sections:SemanticSection[];css:string;
  sourceContentIds:ContentId[];}
export interface CompilationResult {ok:boolean;issues:CompilationIssue[];plan?:SemanticRenderPlan;}
export interface CompileOptions {purpose?:'release'|'owner-preview';approvedMediaIds?:ReadonlySet<string>;
  contactFormEnabled?:boolean;maxBytes?:number;}
