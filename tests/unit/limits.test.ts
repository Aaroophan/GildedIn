import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCT_LIMITS, validateAuthoredNodes, validateCollectionSize, validateCustomFieldCount, validateSchemaDepth, schemaContainerDepth, canonicalJson, utf8ByteCount, validatePublishedByteCount, validateMediaPreflight } from '../../src/shared/domain/limits.ts';
import { InputValidationError } from '../../src/shared/domain/validation.ts';

test('all non-negotiable byte and count constants are exact',()=>{
  assert.equal(PRODUCT_LIMITS.publishedReleaseBytes,102400);
  assert.equal(PRODUCT_LIMITS.mediaOriginalBytesPerPortfolio,15728640);
  assert.equal(PRODUCT_LIMITS.imageBytes,1048576);
  assert.equal(PRODUCT_LIMITS.pdfBytes,2097152);
  assert.equal(PRODUCT_LIMITS.authoredVisualNodesPerPortfolio,20);
  assert.equal(PRODUCT_LIMITS.publishedReleasesRetained,3);
});
test('authored nodes count nested groups, and forged platform markers still count',()=>{
  const deep={origin:'platform',children:[{type:'text'},{type:'repeater',generatedRepeatCount:20}]};
  const nineteen=[deep,...Array.from({length:16},()=>({type:'text'}))];
  assert.equal(validateAuthoredNodes(nineteen),19);
  assert.equal(validateAuthoredNodes([...nineteen,{type:'text'}]),20);
  assert.throws(()=>validateAuthoredNodes([...nineteen,{type:'text'},{type:'text'}]),/Too many authored/);
  assert.equal(validateAuthoredNodes([{type:'repeater',generatedRepeatCount:10_000}]),1);
});
test('authored node cycles are rejected, even if the loop avoids the first level',()=>{
  const node:any={type:'group'};node.children=[node];
  assert.throws(()=>validateAuthoredNodes([node]),InputValidationError);
  assert.throws(()=>validateAuthoredNodes([{children:'not-an-array'} as any]),InputValidationError);
});
test('schema depth counts object/list containers, not scalar fields or visual groups',()=>{
  const scalar={kind:'scalar' as const};
  const one={kind:'object' as const, fields:{name:scalar}};
  const three={kind:'object' as const,fields:{x:{kind:'list' as const,item:one}}};
  const four={kind:'object' as const,fields:{x:three}};
  assert.equal(schemaContainerDepth(three),3);
  assert.equal(validateSchemaDepth(three),3);
  assert.throws(()=>validateSchemaDepth(four),InputValidationError);
});
test('field and collection caps accept exactly 20 but reject 21',()=>{
  for(const n of [0,19,20]){
    assert.equal(validateCustomFieldCount(Array(n).fill('field')),n);
    assert.equal(validateCollectionSize(Array(n).fill('item')),n);
  }
  assert.throws(()=>validateCustomFieldCount(Array(21).fill(1)),/Too many custom/);
  assert.throws(()=>validateCollectionSize(Array(21).fill(1)),/Too many collection/);
});
test('canonical release bytes count real UTF-8, not JS characters or bytes of media',()=>{
  assert.equal(canonicalJson({b:2,a:'a'}),'{"a":"a","b":2}');
  assert.equal(utf8ByteCount('🎯'),4);
  const exactly102400={x:'a'.repeat(102400-8)}; // {"x":""} adds 8 bytes
  assert.equal(validatePublishedByteCount(exactly102400),102400);
  assert.throws(()=>validatePublishedByteCount({x:'a'.repeat(102400-7)}),InputValidationError);
  assert.throws(()=>canonicalJson(JSON.parse('{"__proto__":{}}')),InputValidationError);
});
test('media preflight enforces verified file/original caps and dimensions, and is not quota reservation',()=>{
  validateMediaPreflight({kind:'image',verifiedBytes:1_048_576,originalCount:29,originalTotalBytes:10_000,width:4096,height:4096});
  validateMediaPreflight({kind:'pdf',verifiedBytes:2*1_048_576,originalCount:29,originalTotalBytes:0});
  for(const inp of [
    {kind:'image' as const,verifiedBytes:1_048_577,originalCount:0,originalTotalBytes:0,width:100,height:100},
    {kind:'pdf' as const,verifiedBytes:2_097_153,originalCount:0,originalTotalBytes:0},
    {kind:'image' as const,verifiedBytes:1,originalCount:30,originalTotalBytes:0,width:100,height:100},
    {kind:'image' as const,verifiedBytes:1,originalCount:0,originalTotalBytes:15*1_048_576,width:100,height:100},
    {kind:'image' as const,verifiedBytes:1,originalCount:0,originalTotalBytes:0,width:4097,height:10},
  ])assert.throws(()=>validateMediaPreflight(inp),InputValidationError);
});
