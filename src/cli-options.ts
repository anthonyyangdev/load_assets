// eslint-disable-next-line no-unused-vars
import { RequireAllFilesConfig } from './load_assets'

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
    description: 'The absolute or relative path to the directory to be converted into an asset file.',
    alias: '-i',
    apply: (args, index, config) => {
      config.inputDirectory = args[index + 1]
      return index + 2
    }
  },
  '--output': {
    description: 'The output path name of the converted asset file.',
    alias: '-o',
    apply: (args, index, config) => {
      config.outputFile = args[index + 1]
      return index + 2
    }
  },
  '--targetLang': {
    description: 'The target language of the output asset file.',
    alias: '-t',
    apply: (args, index, config) => {
      const target = args[index + 1]
      if (target === 'ts' || target === 'js') {
        config.targetLang = target
      } else {
        console.log('Illegal Argument: Target language must be one of the following: ts, js')
        process.exit(1)
      }
      return index + 2
    }
  },
  '--indents': {
    description: 'The number of indents in output file.',
    apply: (args, index, config) => {
      const count = Number.parseInt(args[index + 1])
      if (Number.isSafeInteger(count)) {
        config.indents = count
      } else {
        console.log('Illegal Argument: Given argument for --indents is not an integer.')
        process.exit(1)
      }
      return index + 2
    }
  },
  '--excludeExt': {
    description: 'A sequence of all filetype extensions to ignore when traversing the assets directory.',
    apply: (args, index, config) => {
      while (index < args.length && !ValidFlagsMap[args[index + 1]]) {
        config.excludeExt.push(args[index + 1])
        index += 1
      }
      return index + 1
    }
  },
  '--includeExt': {
    description: 'A sequence of all filetype extensions to include when traversing the assets directory.' +
      '\nBy default, the following extensions are included: jpg, jpeg, png, gif.',
    apply: (args, index, config) => {
      while (index < args.length && !ValidFlagsMap[args[index + 1]]) {
        config.includeExt.push(args[index + 1])
        index += 1
      }
      return index + 1
    }
  }
}

Object.keys(ValidFlagsMap).forEach(flag => {
  const alias = ValidFlagsMap[flag].alias
  if (ValidFlagsMap[alias] != null) {
    console.error(`${alias} is already a defined flag`)
    process.exit(1)
  } else if (alias != null) {
    ValidFlagsMap[alias] = {
      ...ValidFlagsMap[flag],
      alias: flag
    }
  }
})

export default ValidFlagsMap as Readonly<Record<string, ParseConfig>>
