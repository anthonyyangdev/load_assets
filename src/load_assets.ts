import fs from 'fs';
import path from 'path';
import indent from 'indent-string';

interface ObjectRepType extends Record<string, string | ObjectRepType> {}
type SupportedLangType = 'ts' | 'js';
type UriQueueType = {uri: string, object: Record<string, any>};

export type RequireAllFilesOptions = {
  includeExt?: string[]
  excludeExt?: string[]
  targetLang?: SupportedLangType;
  outputFile?: string
  indents?: number
};

function createObjectRep(directory: string, supported: Set<string>): ObjectRepType {
  const contentObject: ObjectRepType = {};
  const root: UriQueueType = {
    uri: directory,
    object: contentObject
  };
  const queue: UriQueueType[] = [root];
  while (queue.length > 0) {
    const {uri, object} = queue.shift();
    const files = fs.readdirSync(uri);
    for (let file of files) {
      const currentPath = path.join(uri, file);
      const extension = path.extname(file).toLowerCase();
      const stats = fs.lstatSync(currentPath);
      if (stats.isDirectory()) {
        object[file] = {};
        queue.push({
          uri: currentPath,
          object: object[file]
        });
      } else if (stats.isFile() && supported.has(extension)) {
        const key = file.substring(0, file.lastIndexOf(extension)).replace('.', '_');
        object[key] = `require("./${currentPath}")`
      }
    }
  }
  return root.object;
}

export function createContent(object: ObjectRepType, indents: number = 2) {
  const content = [];
  Object.keys(object).forEach(key => {
    if (typeof object[key] === 'string') {
      content.push(`"${key}": ${object[key]},`);
    } else {
      const inner = createContent((object[key] as ObjectRepType));
      if (inner !== '{}') {
        content.push(`"${key}": ${inner},`);
      }
    }
  });
  return content.length > 0 ? "{\n" + indent(content.join("\n"), indents) + "\n}" : "{}";
}

type OutputType = {
  filename: string
  content: string
  err?: string
}

function generateRequireAllFiles(directory: string, options?: RequireAllFilesOptions): OutputType {
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory()) {
    return {err: `${directory} is not a directory.`, filename: "", content: ""};
  }
  const supported = new Set<string>();
  ['.jpg', '.png', '.gif'].forEach(x => supported.add(x));
  if (options != null) {
    options.includeExt?.forEach(x => supported.add('.' + x.toLowerCase()));
    options.excludeExt?.forEach(x => supported.delete('.' + x.toLowerCase()));
  }
  const targetLang = options?.targetLang ?? 'js';
  const objectRep = createObjectRep(directory, supported);
  const content = createContent(objectRep, options?.indents);
  const exportMethod = targetLang === 'js' ? 'module.exports = asset;' : 'export default asset;';
  const asset = 'const asset = ' + content + `;\n\n${exportMethod}`;
  const output = options?.outputFile ?? `assets.${targetLang}`;

  return {
    content: asset,
    filename: output
  };
}

export default generateRequireAllFiles;