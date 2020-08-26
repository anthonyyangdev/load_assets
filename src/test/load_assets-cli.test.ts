import { it, describe, before, afterEach } from 'mocha'
import { expect } from 'chai'
import { exec } from 'child_process'
import fs from 'fs'

describe('load assets cli test suite', function () {
  const testResultDir = 'dump'
  before(() => {
    if (fs.existsSync(testResultDir) && fs.lstatSync(testResultDir).isDirectory()) {
      console.log(`Remove the contents in ${testResultDir} and the directory itself before testing.`)
      process.exit(1)
    }
  })
  afterEach(() => {
    fs.rmdirSync(testResultDir, { recursive: true })
  })
  it('should generate a valid JavaScript file using the assets subdirectory', function (done) {
    exec('ts-node src/load_assets-cli.ts src/test/assets', (err) => {
      if (err != null) {
        done(err)
        return
      }
      exec('node --check assets.js', (err) => {
        if (err == null) {
          fs.unlinkSync('assets.js')
        }
        done(err)
      })
    })
  })

  it('should generate a valid JavaScript file using the assets subdirectory', function (done) {
    const filename = 'duke.js'
    exec(`ts-node src/load_assets-cli.ts src/test/assets --output dump/${filename}`, (err) => {
      if (err != null) {
        done(err)
        return
      }
      exec(`node --check dump/${filename}`, (err) => {
        done(err)
      })
    })
  })

  it('should generate valid TypeScript using assets subdirectory', function (done) {
    exec('ts-node src/load_assets-cli.ts src/test/assets --targetLang ts --output dump/assets.ts', (err) => {
      done(err)
    })
  })

  it('should create file with an empty object', function (done) {
    exec('ts-node src/load_assets-cli.ts src/test/assets --targetLang ts --output dump/empty.ts --excludeExt jpg', err => {
      if (err != null) {
        done(err)
        return
      }
      const file = fs.readFileSync('dump/empty.ts').toString()
      expect(file).includes('const asset = {}')
      done(err)
    })
  })

  it('should exit with code 1 if the directory does not exist', function (done) {
    exec('ts-node src/load_assets-cli.ts something/that/does/not/exist', err => {
      // eslint-disable-next-line no-unused-expressions
      expect(err).to.not.be.null
      expect(err.code).to.equal(1)
      done()
    })
  })
})
