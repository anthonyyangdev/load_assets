import { it, describe } from 'mocha'
import { expect } from 'chai'
import { createContent, createObjectRep } from '../load_assets'

describe('Test suite for createObjectRep', function () {
  const supported = new Set<string>()
  supported.add('.png')
  supported.add('.jpg')
  it('should create empty map representation', function () {
    const rep = createObjectRep('src/test/rep', supported, './')
    expect(rep).has.property('.png')
    expect(rep['.png']).has.keys('earth', 'nested')
    expect(rep).has.property('.jpg')
    expect(rep['.jpg']).has.keys('moon', 'sun', 'nested')
    expect(rep['.jpg'].nested).has.keys('moon')
    expect(rep['.png'].nested).has.keys('earth')
  })
})

describe('Test suite for createContent', function () {
  it('should create empty object string', function () {
    const noContent = {}
    const result = createContent(noContent)
    expect(result).to.have.length(0)
  })
  it('should create a string representation of the object, removing the quotes in require()', function () {
    const content: any = {
      hello: [1, "require('./src/hello.png')"]
    }
    const result = createContent(content)
    expect(result).has.length(3)
  })
  it('should ignore empty nested objects', function () {
    const content: any = {
      hello: [1, "require('./src/hello.png')"],
      cold: {
        bold: {}
      }
    }
    const result = createContent(content, 2)
    expect(result).has.length(3)
    expect(result).deep.equals([
      '{',
      '    "hello": require(\'./src/hello.png\'),',
      '  },'
    ])
  })
  it('should include nested declarations', function () {
    const content: any = {
      hello: [1, "require('./src/hello.png')"],
      cold: {
        world: [2, "require('./src/cold/word.png')"],
        bold: {}
      }
    }
    const results = createContent(content, 2)
    expect(results.sort()).deep.equals([
      '{',
      '    "hello": require(\'./src/hello.png\'),',
      '    "cold": {',
      '      "world": require(\'./src/cold/word.png\'),',
      '    },',
      '  },'
    ].sort())
  })
})
