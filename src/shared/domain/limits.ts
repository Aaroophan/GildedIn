import { assertSafeJsonValue, InputValidationError } from './validation.ts';

/** Exactly the product-fixed values from spec 02; owner UI may display but never override these. */
export const PRODUCT_LIMITS = Object.freeze({
  schemaNestingDepth: 3,
  customFieldsPerSection: 20,
  authoredVisualNodesPerPortfolio: 20,
  collectionItems: 20,
  publishedReleaseBytes: 102_400,
  publishedReleasesRetained: 3,
  mediaOriginalBytesPerPortfolio: 15 * 1_048_576,
  originalMediaFilesPerPortfolio: 30,
  imageBytes: 1_048_576,
  pdfBytes: 2 * 1_048_576,
  maxImageWidth: 4096,
  maxImageHeight: 4096,
  gildenVisitorDailyMessages: 15,
  contactRetentionDays: 30,
});

export interface AuthoredVisualNode { readonly children?: readonly AuthoredVisualNode[]; readonly [property: string]: unknown; }
/** Counts every explicitly authored node recursively, even forged "platform" markers. Repeater output is not an authored tree. */
export function countAuthoredNodes(nodes: readonly AuthoredVisualNode[]): number {
  const visiting = new WeakSet<object>();
  const visit = (list: readonly AuthoredVisualNode[]): number => {
    if (!Array.isArray(list)) throw new InputValidationError('INVALID_NODE', 'Visual nodes must be a list.');
    return list.reduce((count, node) => {
      if (typeof node !== 'object' || node === null || Array.isArray(node) || visiting.has(node)) throw new InputValidationError('INVALID_NODE', 'Invalid or cyclic visual node.');
      if (Object.getPrototypeOf(node) !== Object.prototype && Object.getPrototypeOf(node) !== null) throw new InputValidationError('INVALID_NODE', 'Unsupported node object.');
      const children = Object.getOwnPropertyDescriptor(node,'children');
      if (children && (!('value' in children) || !Array.isArray(children.value))) throw new InputValidationError('INVALID_NODE', 'Invalid child node list.');
      visiting.add(node);
      const result = 1 + visit((children?.value ?? []) as readonly AuthoredVisualNode[]);
      visiting.delete(node);
      return count + result;
    }, 0);
  };
  return visit(nodes);
}
export function validateAuthoredNodes(nodes: readonly AuthoredVisualNode[]): number {
  const count = countAuthoredNodes(nodes);
  if (count > PRODUCT_LIMITS.authoredVisualNodesPerPortfolio) throw new InputValidationError('BLOCK_LIMIT', 'Too many authored visual blocks.');
  return count;
}

/** Count nested object/list schema containers (not visual parent groups). */
export type SchemaNode =
  | { readonly kind: 'scalar' }
  | { readonly kind: 'object'; readonly fields: Readonly<Record<string, SchemaNode>> }
  | { readonly kind: 'list'; readonly item: SchemaNode };
export function schemaContainerDepth(schema: SchemaNode): number {
  const visiting = new WeakSet<object>();
  const walk = (node: SchemaNode, depth: number): number => {
    if (visiting.has(node)) throw new InputValidationError('DEPTH_LIMIT', 'Circular schema is not permitted.');
    visiting.add(node);
    let result = depth;
    if (node.kind === 'object') {
      result = depth + 1;
      for (const key of Object.keys(node.fields)) result = Math.max(result, walk(node.fields[key], depth + 1));
    } else if (node.kind === 'list') result = Math.max(depth + 1, walk(node.item, depth + 1));
    visiting.delete(node);
    return result;
  };
  return walk(schema, 0);
}
export function validateSchemaDepth(schema: SchemaNode): number {
  const depth = schemaContainerDepth(schema);
  if (depth > PRODUCT_LIMITS.schemaNestingDepth) throw new InputValidationError('DEPTH_LIMIT', 'Schema nesting exceeds three containers.');
  return depth;
}

export function validateCustomFieldCount(customFields: readonly unknown[]): number {
  if (customFields.length > PRODUCT_LIMITS.customFieldsPerSection) throw new InputValidationError('FIELD_LIMIT', 'Too many custom fields.');
  return customFields.length;
}
export function validateCollectionSize(items: readonly unknown[]): number {
  if (items.length > PRODUCT_LIMITS.collectionItems) throw new InputValidationError('COLLECTION_LIMIT', 'Too many collection items.');
  return items.length;
}

/** Deterministic sorted-key JSON serializer for the future publication pipeline; actual release envelope in Issue 13. */
export function canonicalJson(value: unknown): string {
  assertSafeJsonValue(value);
  function normalize(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(normalize);
    if (v !== null && typeof v === 'object') {
      const sorted: Record<string, unknown> = Object.create(null);
      for (const key of Object.keys(v).sort()) sorted[key] = normalize((v as Record<string, unknown>)[key]);
      return sorted;
    }
    return v;
  }
  return JSON.stringify(normalize(value));
}
export const utf8ByteCount = (text: string): number => new TextEncoder().encode(text).byteLength;
export function validatePublishedByteCount(release: unknown): number {
  const count = utf8ByteCount(canonicalJson(release));
  if (count > PRODUCT_LIMITS.publishedReleaseBytes) throw new InputValidationError('PUBLISHED_SIZE_LIMIT', 'Published release is too large.');
  return count;
}

export type MediaInputKind = 'image' | 'pdf';
/** Pure preflight only. Concurrent/global reservations require the authoritative repository in Issue 12. */
export function validateMediaPreflight(input: {
  kind: MediaInputKind; verifiedBytes: number; originalCount: number; originalTotalBytes: number;
  width?: number; height?: number;
}): void {
  const { kind, verifiedBytes, originalCount, originalTotalBytes, width, height } = input;
  if (![verifiedBytes, originalCount, originalTotalBytes].every(v => Number.isSafeInteger(v) && v >= 0)) {
    throw new InputValidationError('INVALID_MEDIA', 'Invalid media size/count.');
  }
  if (verifiedBytes > (kind === 'image' ? PRODUCT_LIMITS.imageBytes : PRODUCT_LIMITS.pdfBytes)) {
    throw new InputValidationError('MEDIA_FILE_LIMIT', 'Media exceeds the individual file limit.');
  }
  if (originalCount + 1 > PRODUCT_LIMITS.originalMediaFilesPerPortfolio ||
      originalTotalBytes + verifiedBytes > PRODUCT_LIMITS.mediaOriginalBytesPerPortfolio) {
    throw new InputValidationError('MEDIA_QUOTA', 'Portfolio media allowance exceeded.');
  }
  if (kind === 'image') {
    if (![width, height].every(v => typeof v === 'number' && Number.isSafeInteger(v) && v > 0) ||
        width! > PRODUCT_LIMITS.maxImageWidth || height! > PRODUCT_LIMITS.maxImageHeight) {
      throw new InputValidationError('IMAGE_DIMENSIONS', 'Invalid image dimensions.');
    }
  }
}
