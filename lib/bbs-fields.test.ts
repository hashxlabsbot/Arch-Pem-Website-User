import { describe, expect, it } from 'vitest'
import {
  inputsFromFields, computeFor, issuesFor, errorsOf, hydrateProjectMember,
  PROJECT_SCHEMA_VERSION, type ProjectMember,
} from './bbs-fields'

/**
 * Field sets exactly as the SHIPPED (pre-Phase-1) component wrote them —
 * scalar bar fields, no list keys, no unit key. These are the migration guard.
 */
const LEGACY_BEAM_FIELDS: Record<string, string> = {
  span: '4000', width: '230', depth: '450', cover: '25',
  botDia: '16', botCount: '4', topDia: '12', topCount: '2',
  stirDia: '8', stirSpacing: '150', anchor: '1', nos: '1',
  ldFactor: '50', lapFactor: '50',
}
const LEGACY_COLUMN_FIELDS: Record<string, string> = {
  height: '3000', width: '230', depth: '230', cover: '40',
  mainDia: '16', mainCount: '6', tieDia: '8', tieSpacing: '150',
  lap: '1', nos: '1', ldFactor: '50', lapFactor: '50',
}
const LEGACY_FOOTING_FIELDS: Record<string, string> = {
  length: '1500', width: '1500', cover: '50',
  dir1Dia: '12', dir1Spacing: '150', dir2Dia: '12', dir2Spacing: '150',
  nos: '1', ldFactor: '50', lapFactor: '50',
}

const legacyMember = (type: 'beam' | 'column' | 'footing', fields: Record<string, string>): ProjectMember => {
  const result = computeFor(inputsFromFields(type, fields))
  return { id: 'x', type, label: `${type} 1`, fields, result, addedAt: 1 }
}

describe('legacy field sets still compute exactly what they did before', () => {
  it('reproduces the beam reference total of 58.04 kg', () => {
    const r = computeFor(inputsFromFields('beam', LEGACY_BEAM_FIELDS))
    expect(r.totalKg).toBeCloseTo(58.04, 2)
    expect(r.rows.map((x) => x.mark)).toEqual(['B1', 'B2', 'B3'])
    expect(r.rows[2].nos).toBe(27)
  })

  it('reproduces the footing reference total of 27.38 kg', () => {
    const r = computeFor(inputsFromFields('footing', LEGACY_FOOTING_FIELDS))
    expect(r.totalKg).toBeCloseTo(27.38, 2)
  })

  it('reproduces the column reference cutting length of 3800 mm', () => {
    const r = computeFor(inputsFromFields('column', LEGACY_COLUMN_FIELDS))
    expect(r.rows[0].cuttingLengthMm).toBe(3800)
    expect(r.rows.map((x) => x.mark)).toEqual(['C1', 'C2'])
  })

  it('treats a legacy member as millimetres even when it carries no unit key', () => {
    const mi = inputsFromFields('beam', LEGACY_BEAM_FIELDS)
    if (mi.type !== 'beam') throw new Error('unreachable')
    expect(mi.v.clearSpanMm).toBe(4000)
  })
})

describe('new list fields', () => {
  it('takes the list field in preference to the legacy scalars', () => {
    const mi = inputsFromFields('beam', { ...LEGACY_BEAM_FIELDS, botBars: '2x20,1x16' })
    if (mi.type !== 'beam') throw new Error('unreachable')
    expect(mi.v.botBars).toEqual([{ diaMm: 20, count: 2 }, { diaMm: 16, count: 1 }])
  })

  it('reads stirrup zones and a member mark', () => {
    const mi = inputsFromFields('beam', { ...LEGACY_BEAM_FIELDS, stirZones: '914.4@101.6', mark: 'B7' })
    if (mi.type !== 'beam') throw new Error('unreachable')
    expect(mi.v.stirEndZones).toEqual([{ lengthMm: 914.4, spacingMm: 101.6 }])
    expect(mi.v.markPrefix).toBe('B7')
  })

  it('parses feet-inch fields when the member is saved in that mode', () => {
    const mi = inputsFromFields('beam', {
      ...LEGACY_BEAM_FIELDS, u: 'ftin', span: `15'-4½"`, width: '9', depth: '15', stirSpacing: '6',
    })
    if (mi.type !== 'beam') throw new Error('unreachable')
    expect(mi.v.clearSpanMm).toBeCloseTo(4686.3, 3)
    expect(mi.v.widthMm).toBeCloseTo(228.6, 3)   // bare number in a section field = inches
    expect(mi.v.depthMm).toBeCloseTo(381, 3)
    expect(mi.v.stirSpacingMm).toBeCloseTo(152.4, 3)
    expect(mi.v.coverMm).toBe(25)                 // cover stays mm in both modes
    expect(mi.v.stirDiaMm).toBe(8)
  })

  it('transcribes the reference drawing beam end to end', () => {
    const r = computeFor(inputsFromFields('beam', {
      u: 'ftin', mark: 'B7',
      span: `15'-4½"`, width: '9', depth: '15', cover: '25',
      botBars: '2x20,1x16', topBars: '',
      stirDia: '8', stirSpacing: '6', stirZones: '914.4@101.6',
      anchor: '1', nos: '1', ldFactor: '50', lapFactor: '50',
    }))
    expect(r.rows.map((x) => x.mark)).toEqual(['B7-1', 'B7-2', 'B7-3'])
    expect(r.rows.find((x) => x.shape === 'Rectangular closed stirrup')!.nos).toBe(37)
    expect(r.rows[0].diaMm).toBe(20)
    expect(r.rows[1].diaMm).toBe(16)
  })
})

describe('hydrateProjectMember — never rewrites a saved schedule', () => {
  it('adopts the recompute for a legacy member, preserving totals and marks', () => {
    const pm = legacyMember('beam', LEGACY_BEAM_FIELDS)
    const before = pm.result.totalKg
    const after = hydrateProjectMember(pm)
    expect(after.schemaVersion).toBe(PROJECT_SCHEMA_VERSION)
    expect(after.result.totalKg).toBeCloseTo(before, 6)
    expect(after.result.rows.map((r) => r.mark)).toEqual(pm.result.rows.map((r) => r.mark))
  })

  it('keeps the stored rows when the stored total has been tampered with', () => {
    const pm = legacyMember('beam', LEGACY_BEAM_FIELDS)
    const tampered: ProjectMember = { ...pm, result: { ...pm.result, totalKg: pm.result.totalKg + 1 } }
    const after = hydrateProjectMember(tampered)
    expect(after.result.totalKg).toBe(tampered.result.totalKg)
    expect(after.schemaVersion).toBeUndefined()
  })

  it('keeps the stored rows when the fields are missing or corrupt', () => {
    const pm = legacyMember('beam', LEGACY_BEAM_FIELDS)
    const broken: ProjectMember = { ...pm, fields: undefined as unknown as ProjectMember['fields'] }
    const after = hydrateProjectMember(broken)
    expect(after.result.totalKg).toBeCloseTo(pm.result.totalKg, 6)
    expect(after.schemaVersion).toBeUndefined()
  })

  it('refuses a recompute that would relabel the schedule', () => {
    const pm = legacyMember('beam', LEGACY_BEAM_FIELDS)
    // Adding a mark changes every row's mark; totals still match, so only the
    // mark guard can catch this.
    const relabelled: ProjectMember = { ...pm, fields: { ...pm.fields, mark: 'B7' } }
    const after = hydrateProjectMember(relabelled)
    expect(after.result.rows.map((r) => r.mark)).toEqual(['B1', 'B2', 'B3'])
    expect(after.schemaVersion).toBeUndefined()
  })

  it('leaves an already-current member untouched', () => {
    const pm = legacyMember('column', LEGACY_COLUMN_FIELDS)
    const once = hydrateProjectMember(pm)
    expect(once.schemaVersion).toBe(PROJECT_SCHEMA_VERSION)
    expect(hydrateProjectMember(once)).toBe(once)
  })

  it('hydrates a millimetre-era member correctly regardless of any live UI mode', () => {
    const pm = legacyMember('beam', LEGACY_BEAM_FIELDS)
    const after = hydrateProjectMember(pm)
    expect(after.result.totalKg).toBeCloseTo(58.04, 2)
  })
})

describe('issue plumbing', () => {
  it('separates blocking errors from advisory checks', () => {
    const issues = issuesFor(inputsFromFields('beam', { ...LEGACY_BEAM_FIELDS, botDia: '18' }))
    expect(errorsOf(issues)).toEqual([])
    expect(issues.some((x) => x.level === 'check')).toBe(true)
  })

  it('blocks on a zone that overruns the span', () => {
    const issues = issuesFor(inputsFromFields('beam', { ...LEGACY_BEAM_FIELDS, span: '1800', stirZones: '1067@102' }))
    expect(errorsOf(issues).some((m) => m.includes('exceed the span'))).toBe(true)
  })
})

describe('degenerate field sets never throw or produce NaN totals', () => {
  it('sweeps empty, junk and partial field sets across every member type', () => {
    const nasty: Record<string, string>[] = [
      {}, { span: '' }, { span: 'abc', width: 'NaN' }, { u: 'ftin' },
      { span: '-5', width: '0', cover: 'x', botBars: 'junk', stirZones: '@' },
    ]
    for (const type of ['beam', 'column', 'slab', 'footing'] as const) {
      for (const f of nasty) {
        const r = computeFor(inputsFromFields(type, f))
        expect(Number.isFinite(r.totalKg), `${type} ${JSON.stringify(f)}`).toBe(true)
        expect(r.totalKg).toBeGreaterThanOrEqual(0)
        for (const row of r.rows) expect(Number.isFinite(row.totalWtKg)).toBe(true)
      }
    }
  })
})
