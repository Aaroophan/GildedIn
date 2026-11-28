/** Issue 6 source-of-truth content representation. Content owns no layout coordinates or Mongo selectors. */
import type {ContentId,SectionId,MediaId} from '../../shared/domain/identifiers.ts';
export const CONTENT_CONTRACT_VERSION=1 as const;
export const SECTION_TYPES=['hero','about','projects','experience','education','skills','blog','references',
  'contact','certifications','achievements','services','testimonials','publications','resume','custom'] as const;
export type SectionType=typeof SECTION_TYPES[number];
export const FIELD_TYPES=['text','richText','url','email','date','number','boolean','image','pdf','select','list','object','relation'] as const;
export type FieldType=typeof FIELD_TYPES[number];
export type FieldPolicy='private'|'owner_choice';
export type AiPolicy='denied'|'requires_explicit_approval';
export interface FieldValidation {minLength?:number;maxLength?:number;minimum?:number;maximum?:number;
  precision?:number;minItems?:number;maxItems?:number;allowedSchemes?:('https'|'mailto')[];}
export interface FieldOption {optionId:string;label:string;}
export interface FieldDefinition {
  fieldId:string;name:string;label:string;description?:string;type:FieldType;required:boolean;
  publicVisibility:FieldPolicy;aiVisibility:AiPolicy;searchable:boolean;
  validation?:FieldValidation;defaultValue?:unknown;options?:FieldOption[];
  fields?:FieldDefinition[];item?:FieldDefinition;targetCollectionId?:string;
}
export interface SectionDefinition {
  sectionId:SectionId;type:SectionType;title:string;navigationLabel?:string;order:number;
  visible:boolean;searchEligible:boolean;aiSectionApproved:boolean;canvasRootId:string;
  layoutPreset:string;publicAnchor:string;schemaDefinitionId?:string;customValues?:Record<string,unknown>;
}
export interface CategoryDefinition {categoryId:string;label:string;order:number;}
export interface CollectionDefinition {
  collectionId:string;schemaId:string;schemaVersion:number;displayName:string;
  sectionId?:SectionId;kind:'projects'|'experience'|'education'|'skills'|'references'|'custom';
  itemsLimit:20;fields:FieldDefinition[];categories:CategoryDefinition[];
}
export interface ContentItem {
  contentId:ContentId;collectionId:string;schemaVersion:number;slug?:string;
  fields:Record<string,unknown>;categoryIds:string[];sortOrder:number;featured:boolean;
  ownerVisibility:'draft_only'|'public_candidate';searchable:boolean;
  publicFieldIds:string[];aiApprovedFieldIds:string[];createdAt:string;updatedAt:string;
}
export interface ContentCollection {collectionId:string;items:ContentItem[];}
export interface ContentDraftShape {
  profile:Record<string,unknown>;sections:SectionDefinition[];
  collectionDefinitions:CollectionDefinition[];contentCollections:ContentCollection[];
  nodes:unknown[];mediaRefs:MediaId[];
}
export interface ContentBinding {
  source:'profile'|'collectionItem'|'collection'|'derived';collectionId?:string;
  contentId?:ContentId;fieldId?:string;derivedKey?:'experienceDuration'|'projectDuration'|'formattedDate';fallback?:string;
}
export interface ContentIssue {path:string;code:string;message:string;}
export type VisibilityUse='public'|'search'|'ai';
/** Release candidates MUST be compiled into a validated immutable release before delivery. */
export interface ContentCandidate {
  source:'profile'|'collectionItem';sourceId:string;collectionId?:string;
  fields:Readonly<Record<string,unknown>>;
}
export interface ProjectionCandidates {contentContractVersion:1;purpose:VisibilityUse;items:ContentCandidate[];}
export interface SchemaImpact {schemaId:string;fromVersion:number;toVersion:number;
  compatible:boolean;destructive:boolean;affectedItems:number;affectedPaths:string[];
  dependentNodeIds:string[];lostFieldIds:string[];changedFieldIds:string[];confirmationHash:string;}
export interface DeletionImpact {contentId:ContentId;usedByNodes:string[];usedByItems:string[];
  usedBySections:string[];canDelete:boolean;}
