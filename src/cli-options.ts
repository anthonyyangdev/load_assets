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
  arguments: string
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
    },
    arguments: 'A path string'
  },
  '--output': {
    description: 'The output path name of the converted asset file.',
    alias: '-o',
    apply: (args, index, config) => {
      config.outputFile = args[index + 1]
      return index + 2
    },
    arguments: 'A path string'
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
    },
    arguments: "'ts' or 'js'"
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
    },
    arguments: 'A non-negative number'
  },
  '--excludeExt': {
    description: 'A sequence of all filetype extensions to ignore when traversing the assets directory.',
    apply: (args, index, config) => {
      while (index < args.length - 1 && !ValidFlagsMap[args[index + 1]]) {
        config.excludeExt.push(args[index + 1])
        index += 1
      }
      return index + 1
    },
    arguments: 'A sequence of space-separated strings'
  },
  '--includeExt': {
    description: 'A sequence of all filetype extensions to include when traversing the assets directory.' +
      '\n\t\tBy default, the following extensions are included: jpg, jpeg, png, gif.',
    apply: (args, index, config) => {
      while (index < args.length - 1 && !ValidFlagsMap[args[index + 1]]) {
        config.includeExt.push(args[index + 1])
        index += 1
      }
      return index + 1
    },
    arguments: 'A sequence of space-separated strings'
  }
}

ValidFlagsMap['--help'] = {
  alias: '-h',
  apply (args: string[], index: number, config: RequireAllFilesConfig): number {
    const flags = new Set<string>()
    Object.keys(ValidFlagsMap).forEach(k => {
      const alias = ValidFlagsMap[k].alias
      if (alias == null || (!flags.has(alias) && !flags.has(k))) {
        flags.add(k)
      }
    })
    console.log('\nName: load_assets\n')

    console.log('Description:')
    const description = ['\t\tA command that generates a JavaScript file which contains an object that maps to',
      '\t\tloaded assets from a directory, including static images files, using require(...). Built to support creating',
      '\t\timports for bundlers that load static assets.']
    console.log(description.join('\n'))

    console.log('Usage:')
    console.log('\t\tload_assets <path_to_assets_directory> [...flags]\n')

    console.log('Flags:')
    flags.forEach(flag => {
      const alias = ValidFlagsMap[flag].alias
      const flagArray = [flag]
      if (alias != null) flagArray.push(alias)

      console.log(flagArray.sort().join(', '))
      console.log('\tDescription:\n\t\t' + ValidFlagsMap[flag].description)
      console.log('\tArguments:\n\t\t' + ValidFlagsMap[flag].arguments)
      console.log()
    })
    process.exit(0)
  },
  description: 'Displays a help screen that explains details of flags and usage.',
  arguments: 'none'
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
