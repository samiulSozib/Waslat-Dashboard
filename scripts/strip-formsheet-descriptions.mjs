#!/usr/bin/env node
/**
 * Remove description props from <FormSheet> and <FormSection> opening tags only.
 * Usage: node scripts/strip-formsheet-descriptions.mjs app/(main)/pages/balance/page.tsx ...
 */
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const files = process.argv.slice(2).map((f) => (path.isAbsolute(f) ? f : path.join(root, f)));

function skipWs(s, i) {
  while (i < s.length && (s[i] === ' ' || s[i] === '\t' || s[i] === '\n' || s[i] === '\r')) i++;
  return i;
}

function readBalanced(s, i, openCh, closeCh) {
  let depth = 0;
  let inString = null;
  let inTemplate = false;
  let start = i;
  while (i < s.length) {
    const ch = s[i];
    const prev = s[i - 1];
    if (inString) {
      if (ch === inString && prev !== '\\') inString = null;
      i++;
      continue;
    }
    if (inTemplate) {
      if (ch === '`' && prev !== '\\') inTemplate = false;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      i++;
      continue;
    }
    if (ch === '`') {
      inTemplate = true;
      i++;
      continue;
    }
    if (ch === openCh) depth++;
    if (ch === closeCh) {
      depth--;
      if (depth === 0) return { end: i + 1 };
    }
    i++;
  }
  return null;
}

function removeDescriptionFromOpeningTag(source, tagName) {
  const tagRe = new RegExp(`<${tagName}\\b`, 'g');
  let result = '';
  let lastIndex = 0;
  let m;
  while ((m = tagRe.exec(source)) !== null) {
    const start = m.index;
    let i = start + m[0].length;
    let inString = null;
    let inTemplate = false;
    let braceDepth = 0;
    let foundClose = false;
    while (i < source.length) {
      const ch = source[i];
      const prev = source[i - 1];
      if (inString) {
        if (ch === inString && prev !== '\\') inString = null;
        i++;
        continue;
      }
      if (inTemplate) {
        if (ch === '`' && prev !== '\\') inTemplate = false;
        i++;
        continue;
      }
      if (ch === '"' || ch === "'") {
        inString = ch;
        i++;
        continue;
      }
      if (ch === '`') {
        inTemplate = true;
        i++;
        continue;
      }
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
      if (ch === '>' && braceDepth === 0) {
        foundClose = true;
        break;
      }
      i++;
    }
    if (!foundClose) break;
    const end = i + 1;
    let chunk = source.slice(start, end);

    chunk = chunk.replace(/\s+description="[^"]*"/g, '');

    let out = '';
    let ci = 0;
    while (ci < chunk.length) {
      const descIdx = chunk.indexOf('description=', ci);
      if (descIdx === -1) {
        out += chunk.slice(ci);
        break;
      }
      out += chunk.slice(ci, descIdx);
      let j = descIdx + 'description='.length;
      j = skipWs(chunk, j);
      if (chunk[j] === '"') {
        const qEnd = chunk.indexOf('"', j + 1);
        ci = qEnd + 1;
        continue;
      }
      if (chunk[j] === '{') {
        const bal = readBalanced(chunk, j, '{', '}');
        if (!bal) {
          out += chunk.slice(descIdx);
          break;
        }
        ci = bal.end;
        while (ci < chunk.length && /[\t ]/.test(chunk[ci])) ci++;
        continue;
      }
      out += chunk.slice(descIdx);
      break;
    }
    chunk = out;

    result += source.slice(lastIndex, start) + chunk;
    lastIndex = end;
    tagRe.lastIndex = end;
  }
  result += source.slice(lastIndex);
  return result;
}

let changed = 0;
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.warn('skip missing', file);
    continue;
  }
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  after = removeDescriptionFromOpeningTag(after, 'FormSheet');
  after = removeDescriptionFromOpeningTag(after, 'FormSection');
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
    console.log('updated:', path.relative(root, file));
  }
}
console.log('total updated:', changed);