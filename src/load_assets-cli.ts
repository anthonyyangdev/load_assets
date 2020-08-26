#! /usr/bin/env node

import generateRequireAllFiles from './load_assets'
import fs from 'fs'
import path from 'path'
import optionsMap from './cli-options'

const params = process.argv.slice(2)

const config = {
  includeExt: [],
  excludeExt: [],
  inputDirectory: ''
}

let index = 0
while (index < params.length) {
  const optionObject = optionsMap[params[index]]
  if (optionObject != null) {
    index = optionObject.apply(params, index, config)
  } else {
    config.inputDirectory = params[index]
    index++
  }
}

if (config.inputDirectory.trim() !== '') {
  const { filename, content, err } = generateRequireAllFiles(config)
  if (err != null) {
    console.log(err)
    process.exit(1)
  } else {
    const directory = path.dirname(filename)
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true })
    }
    fs.writeFileSync(filename, content)
  }
} else {
  console.log('No directory given.')
  process.exit(1)
}
