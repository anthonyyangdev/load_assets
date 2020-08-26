import generateRequireAllFiles, {RequireAllFilesOptions} from "./load_assets";
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

const options: RequireAllFilesOptions = {};
options.includeExt = [];
options.excludeExt = [];
let directoryName = ""

const optionsMap: Record<string, boolean> = {
  '--input': true,
  '--output': true,
  '--targetLang': true,
  '--indents': true,
  '--excludeExt': true,
  '--includeExt': true
};
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case '--input':
      directoryName = args[++i];
      break;
    case '--output':
      options.outputFile = args[++i]
      break
    case '--targetLang':
      const target = args[++i];
      if (target === 'ts' || target == 'js') {
        options.targetLang = target;
      }
      break
    case '--indents':
      const count = Number.parseInt(args[++i]);
      if (Number.isSafeInteger(count)) {
        options.indents = count;
      }
      break;
    case '--excludeExt': {
      let index = i + 1;
      while (index < args.length && !optionsMap[args[index]]) {
        options.excludeExt.push(args[index])
        index += 1;
      }
      i = index - 1;
      break;
    }
    case '--includeExt': {
      let index = i + 1;
      while (index < args.length && !optionsMap[args[index]]) {
        options.includeExt.push(args[index])
        index += 1;
      }
      i = index - 1;
      break;
    }
    default:
      directoryName = args[i];
  }
}

if (directoryName.trim() !== "") {
  const {filename, content, err} = generateRequireAllFiles(directoryName, options);
  if (err != null) {
    console.log(err);
  } else {
    const directory = path.dirname(filename);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, {recursive: true});
    }
    fs.writeFileSync(filename, content);
  }
} else {
  console.log("No directory given.");
  process.exit(1);
}