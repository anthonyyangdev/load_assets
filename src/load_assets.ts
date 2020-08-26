import fs from 'fs';
import path from 'path';
import indent from 'indent-string';

interface ObjectRepType extends Record<string, string | ObjectRepType> {}
type SupportedLangType = 'ts' | 'js';
type UriQueueType = {uri: string, object: Record<string, any>};

export type RequireAllFilesConfig = {
  inputDirectory?: string
  includeExt?: string[]
  excludeExt?: string[]
  targetLang?: SupportedLangType;
  outputFile?: string
  indents?: number
};

/**
 * Creates the literal object that maps to string representation of an asset loaded by require().
 *
 * For example: {
 *   "home": "require('./home.png')"
 * }
 *
 * @param directory
 * @param supported
 */
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

/**
 * Creates the string representation of the JavaScript object that maps to all assets
 * loaded with require().
 * @param object
 * @param indents
 */
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

/**
 * Generates an asset file of the target language if an inputDirectory is given.
 * If an inputDirectory is not given, then this function returns an error value.
 *
 * The default target language is JavaScript. The default indentation of the
 * output file is 2.
 *
 * @param config Configuration object.
 */
function generateRequireAllFiles(config: RequireAllFilesConfig): OutputType {
  const directory = config.inputDirectory ?? "";
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory()) {
    return {err: `${directory} is not a directory.`, filename: "", content: ""};
  }
  const supported = new Set<string>();
  ['.jpg', '.jpeg', '.png', '.gif'].forEach(x => supported.add(x));
  config.includeExt?.forEach(x => supported.add('.' + x.toLowerCase()));
  config.excludeExt?.forEach(x => supported.delete('.' + x.toLowerCase()));
  const targetLang = config?.targetLang ?? 'js';
  const objectRep = createObjectRep(directory, supported);
  const content = createContent(objectRep, config?.indents);
  const exportMethod = targetLang === 'js' ? 'module.exports = asset;' : 'export default asset;';
  const asset = 'const asset = ' + content + `;\n\n${exportMethod}`;
  const output = config?.outputFile ?? `assets.${targetLang}`;
  return {
    content: asset,
    filename: output
  };
}

export default generateRequireAllFiles;