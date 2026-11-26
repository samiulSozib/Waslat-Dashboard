#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const files = process.argv.slice(2);

const UI_IMPORTS = `import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';`;

function ensureImports(content) {
  if (!content.includes("from '@/components/ui/input'")) {
    const anchor = "from '@/components/admin/form-sheet'";
    if (content.includes(anchor)) {
      content = content.replace(
        /import \{([^}]*)\} from '@\/components\/admin\/form-sheet';/,
        (m) => `${m}\n${UI_IMPORTS}`
      );
    }
  }
  if (content.includes('<Input') && !content.includes("from '@/lib/utils'") && content.includes('cn(')) {
    // skip
  }
  return content;
}

function migrateBlock(block) {
  let b = block;
  b = b.replace(/<InputTextarea/g, '<Textarea');
  b = b.replace(/<\/InputTextarea>/g, '');
  b = b.replace(/<InputText/g, '<Input');
  // drop inputMode on Textarea/Input where harmless
  b = b.replace(/\s+inputMode="[^"]*"/g, '');
  return b;
}

for (const rel of files) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) {
    console.warn('skip missing', rel);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;
  content = content.replace(/<FormSheet[\s\S]*?<\/FormSheet>/g, migrateBlock);
  content = ensureImports(content);
  if (content !== before) {
    fs.writeFileSync(filePath, content);
    console.log('updated', rel);
  } else {
    console.log('unchanged', rel);
  }
}