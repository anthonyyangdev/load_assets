import {RequireAllFilesConfig} from "./load_assets";

type ParseConfig = {
  description: string
  /**
   * A function that processes the arguments for a CLI flag.
   * @param args The arguments given in the CLI.
   * @param index The index of the flag of interest.
   * @param config Configuration object.
   * @param The index af the next CLI argument to be parsed.
   */
  apply: (args: string[], index: number, config: RequireAllFilesConfig) => number
  alias?: string
};

/**
 * Map of valid flags for the cli.
 */
const ValidFlagsMap: Record<string, ParseConfig> = {
  '--input': {
    description: 'Input absolute or relative path to the directory to be converted into an asset file.',
    alias: '-i',
    apply: (args, index, config) => {
      config.inputDirectory = args[index + 1];
      return index + 2;
    }
  },
  '--output': {
    description: 'Output path of the converted asset file.',
    alias: '-o',
    apply: ((args, index, config) => {
      config.outputFile = args[index + 1];
      return index + 2;
    })
  },
  '--targetLang': {
    description: 'Target language of the output asset file.',
    alias: '-t',
    apply: ((args, index, config) => {
      const target = args[index + 1];
      if (target === 'ts' || target == 'js') {
        config.targetLang = target;
      } else {
        console.log("Illegal Argument: Target language must be one of the following: ts, js");
        process.exit(1);
      }
      return index + 2;
    })
  },
  '--indents': {
    description: "Number of indents in output file.",
    apply: (((args, index, config) => {
      const count = Number.parseInt(args[index + 1]);
      if (Number.isSafeInteger(count)) {
        config.indents = count;
      } else {
        console.log("Illegal Argument: Given argument for --indents is not an integer.");
        process.exit(1);
      }
      return index + 2;
    }))
  },
  '--excludeExt': {
    description: "Exclude all extensions following the flag until the end or the next flag.",
    apply: ((args, index, config) => {
      while (index < args.length && !ValidFlagsMap[args[index + 1]]) {
        config.excludeExt.push(args[index])
        index += 1;
      }
      return index;
    })
  },
  '--includeExt': {
    description: "Include all extensions following the flag until the end or the next flag." +
      "\nBy default, the following extensions are included: jpg, jpeg, png, gif.",
    apply: ((args, index, config) => {
      while (index < args.length && !ValidFlagsMap[args[index + 1]]) {
        config.includeExt.push(args[index])
        index += 1;
      }
      return index;
    })
  }
};

Object.keys(ValidFlagsMap).forEach(flag => {
  const alias = ValidFlagsMap[flag].alias;
  if (ValidFlagsMap[alias] != null) {
    console.error(`${alias} is already a defined flag`);
    process.exit(1);
  } else if (alias != null) {
    ValidFlagsMap[alias] = {
      ...ValidFlagsMap[flag],
      alias: flag
    }
  }
});

export default ValidFlagsMap as Readonly<Record<string, ParseConfig>>;