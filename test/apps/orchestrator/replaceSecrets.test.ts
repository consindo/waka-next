import { describe, expect, it } from 'vitest'

import { replaceSecrets } from '../../../apps/orchestrator/src/lib/replaceSecrets'

const sampleConfig = `
regions:
  blah: SECRET.auckland-secret
  nz-akl:
    something: something
    secret: SECRET.auckland-secret
    another-secret: SECRET.another-secret
`

describe('replaceSecrets', () => {
  it('should return the original config if there are no secrets', () => {
    const result = replaceSecrets({}, sampleConfig)
    expect(result).toEqual(sampleConfig)
  })
  it('should replace config with secrets', () => {
    const result = replaceSecrets(
      {
        'auckland-secret': 'thesecret',
        'another-secret': 'theothersecret',
      },
      sampleConfig
    )
    expect(result).toEqual(`
regions:
  blah: thesecret
  nz-akl:
    something: something
    secret: thesecret
    another-secret: theothersecret
`)
  })
  it('should do partial replacement of config with secrets', () => {
    const result = replaceSecrets(
      {
        'auckland-secret': 'thesecret',
      },
      sampleConfig
    )
    expect(result).toEqual(`
regions:
  blah: thesecret
  nz-akl:
    something: something
    secret: thesecret
    another-secret: SECRET.another-secret
`)
  })
})
