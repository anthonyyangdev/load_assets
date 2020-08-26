import fs from 'fs';
import path from 'path';
import indent from 'indent-string';
import {mapValues} from 'lodash';
import indentString from "indent-string";

interface ObjectRepType extends Record<string, string | ObjectRepType> {}
type SupportedLangType = 'ts' | 'js';
type UriQueueType = {
  pathFromCall: string
  object: Record<string, any>
  pathFromOutput: string
};

export type RequireAllFilesConfig = {
  inputDirectory: string
  includeExt: string[]
  excludeExt: string[]
  targetLang?: SupportedLangType;
  outputFile?: string
  indents?: number
};

type MainOutputType = {
  filename: string
  content: string
  err?: string
}

/**
 * Creates the literal object that maps to string representation of an asset loaded by require().
 * For example: {
 *   "home": "require('./home.png')"
 * }
 *
 * Traverses the directories via BFS.
 *
 * @param directory
 * @param supported
 * @param pathPrefix
 */
export function createObjectRep(directory: string,
                                supported: Set<string>,
                                pathPrefix: string,
): Record<string, ObjectRepType> {
  const supportedExtensions: [string, object][] = [];
  supported.forEach(ext => supportedExtensions.push([ext, {}]))
  const filenameToObject = Object.fromEntries(supportedExtensions);
  const root: UriQueueType = {
    pathFromCall: directory,
    object: filenameToObject,
    pathFromOutput: pathPrefix
  };
  const queue: UriQueueType[] = [root];
  while (queue.length > 0) {
    const {pathFromCall, object, pathFromOutput} = queue.shift();
    const files = fs.readdirSync(pathFromCall);
    for (let file of files) {
      const currentPath = path.join(pathFromCall, file);
      let fullPath = path.join(pathFromOutput, file);
      const extension = path.extname(file).toLowerCase();
      const stats = fs.lstatSync(currentPath);
      if (stats.isDirectory()) {
        const updatedMapping = mapValues(object, v => {
          v[file] = {};
          return v[file];
        });
        queue.push({
          pathFromCall: currentPath,
          object: updatedMapping,
          pathFromOutput: fullPath
        });
      }
      else if (stats.isFile() && supported.has(extension)) {
        const key = file.substring(0, file.lastIndexOf(extension));
        if (fullPath.length === 0) {
          fullPath = '.';
        } else if (fullPath[0] !== '.') {
          fullPath = './' + fullPath;
        }
        object[extension][key] = `require("${fullPath}")`
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
      const inner = createContent((object[key] as ObjectRepType), indents);
      if (inner !== '{}') {
        content.push(`"${key}": ${inner},`);
      }
    }
  });
  return content.length > 0 ? "{\n" + indent(content.join("\n"), indents) + "\n}" : "{}";
}

/**
 * Generate all files supported in this process.
 * @param include
 * @param exclude
 */
const getSupportedFiles = (include: string[], exclude: string[]): Set<string> => {
  const supported = new Set<string>();
  ['.jpg', '.jpeg', '.png', '.gif'].forEach(x => supported.add(x));
  include.forEach(x => supported.add('.' + x.toLowerCase()));
  exclude.forEach(x => supported.delete('.' + x.toLowerCase()));
  return supported;
}

/**
 * Returns the string representation of the object, which maps from the extension type
 * to the object of loaded assets.
 * @param objectRep
 * @param indents
 */
const getFullObjectBody = (objectRep: Record<string, ObjectRepType>, indents: number): string => {
  const content: string[] = [];
  Object.keys(objectRep).forEach(k => {
    const ext = k.substring(1);
    const object = createContent(objectRep[k], indents);
    if (object != '{}') {
      content.push(`${ext}: ` + createContent(objectRep[k], indents) + ',');
    }
  })
  if (content.length == 0) {
     return '{}'
  } else {
    return  '{\n' + indentString(content.join("\n"), indents) + "\n}";
  }

}


/**
 * Returns the content and path of the asset file of the target language
 * if an inputDirectory is given. If an inputDirectory is not given,
 * then this function returns an error string.
 *
 * The default target language is JavaScript. The default indentation of the
 * output file is 2.
 *
 * @param config Configuration object.
 */
function generateRequireAllFiles(config: RequireAllFilesConfig): MainOutputType {
  const directory = config.inputDirectory ?? "";
  if (!fs.existsSync(directory) || !fs.lstatSync(directory).isDirectory()) {
    return {err: `${directory} is not a directory.`, filename: "", content: ""};
  }
  const supportedExt = getSupportedFiles(config.includeExt, config.excludeExt);
  let outputPath: string;
  let targetLang = config.targetLang ?? 'js';
  if (config.outputFile != null) {
    outputPath = config.outputFile;
    const actualExtension = path.extname(outputPath).substring(1);
    if (actualExtension && actualExtension === 'js' || actualExtension === 'ts') {
      targetLang = actualExtension;
    }
  } else {
    outputPath = `assets.${targetLang}`;
  }

  let pathPrefix = path.relative(path.dirname(outputPath), directory);
  const objectRep = createObjectRep(directory, supportedExt, pathPrefix);
  const content = getFullObjectBody(objectRep, config.indents ?? 2);
  const asset = (targetLang === 'js' ? 'module.asset = ' : 'export const asset = ') + content + `;`;
  return {
    content: asset,
    filename: outputPath
  };
}

export default generateRequireAllFiles;