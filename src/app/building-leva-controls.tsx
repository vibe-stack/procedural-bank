import { button, folder, useControls } from 'leva'
import type { useCreateStore } from 'leva'
import { useMemo } from 'react'
import { useSnapshot } from 'valtio'
import type {
  BuildingArchetype,
  BuildingVariant,
  CornerTreatment,
  CrownDecorationStyle,
  CrownFinialRhythm,
  CrownStyle,
  EntranceType,
  FootprintHeightMode,
  FootprintStyle,
  HardInsetSide,
  MassingPattern,
  MaterialVariant,
  PodiumStyle,
  RoofStyle,
  ShaftRhythm,
} from '../kit/kit-types'
import { generateFinancialBuilding } from '../kit/building/building-generator'
import {
  randomizeSeed,
  setBooleanSetting,
  setBuildingArchetype,
  setCornerTreatment,
  setCrownDecorationStyle,
  setCrownFinialRhythm,
  setCrownStyle,
  setEntranceType,
  setFootprintHeightMode,
  setFootprintStyle,
  setHardInsetSide,
  setMassingPattern,
  setMaterialVariant,
  setNumberSetting,
  setPodiumStyle,
  setRoofStyle,
  setSecondaryFootprintStyle,
  setShaftRhythm,
  setVariant,
} from '../state/building-actions'
import { buildingState } from '../state/building-state'

type BuildingLevaControlsProps = {
  store: ReturnType<typeof useCreateStore>
}

export function BuildingLevaControls({ store }: BuildingLevaControlsProps) {
  const settings = useSnapshot(buildingState)
  const metrics = useMemo(() => generateFinancialBuilding({ ...settings }), [settings])

  useControls(
    () => ({
      Building: folder(
        {
          randomizeSeed: button(randomizeSeed, { disabled: false }),
          variant: {
            value: settings.variant,
            options: {
              'Classic bank': 'classic-bank',
              'Setback tower': 'setback-tower',
              'Corner HQ': 'corner-hq',
            },
            label: 'Variant',
            onChange: (value: BuildingVariant) => setVariant(value),
          },
          material: {
            value: settings.materialVariant,
            options: {
              'Light limestone': 'light-limestone',
              'Dark granite': 'dark-granite',
              'Aged terra-cotta': 'aged-terra-cotta',
            },
            label: 'Material',
            onChange: (value: MaterialVariant) => setMaterialVariant(value),
          },
          seed: numberInput(settings.seed, 1, 99999, 1, (value) => setNumberSetting('seed', value)),
          widthBays: numberInput(settings.widthBays, 5, 15, 1, (value) => setNumberSetting('widthBays', value), 'Width bays'),
          depthBays: numberInput(settings.depthBays, 4, 12, 1, (value) => setNumberSetting('depthBays', value), 'Depth bays'),
          floors: numberInput(settings.floors, 7, 30, 1, (value) => setNumberSetting('floors', value)),
          podiumFloors: numberInput(settings.podiumFloors, 2, 5, 1, (value) => setNumberSetting('podiumFloors', value), 'Podium'),
          setbackFloors: numberInput(settings.setbackFloors, 1, 4, 1, (value) => setNumberSetting('setbackFloors', value), 'Setback'),
          towerScale: numberInput(settings.towerScale, 0.62, 1, 0.01, (value) => setNumberSetting('towerScale', value), 'Tower scale'),
          colonnade: booleanInput(settings.colonnade, (value) => setBooleanSetting('colonnade', value)),
          cornerEntrance: booleanInput(settings.cornerEntrance, (value) => setBooleanSetting('cornerEntrance', value), 'Corner entry'),
          crown: booleanInput(settings.crown, (value) => setBooleanSetting('crown', value)),
        },
        { order: 1 }
      ),
      Grammar: folder(
        {
          archetype: {
            value: settings.buildingArchetype,
            options: {
              'Board-of-trade': 'board-of-trade-tower',
              'Temple bank': 'temple-bank-podium',
              'Terra-cotta': 'terra-cotta-arcade',
              'High-rise pyramid': 'high-rise-pyramid',
              'Federal fortress': 'federal-fortress',
            },
            label: 'Archetype',
            onChange: (value: BuildingArchetype) => setBuildingArchetype(value),
          },
          massing: {
            value: settings.massingPattern,
            options: {
              'Single tower': 'single-tower',
              'Outer ring': 'outer-ring',
              'Twin towers': 'twin-towers',
            },
            label: 'Massing',
            onChange: (value: MassingPattern) => setMassingPattern(value),
          },
          footprint: footprintInput(settings.footprintStyle, 'Footprint', setFootprintStyle),
          secondaryFootprint: footprintInput(settings.secondaryFootprintStyle, 'Second tower', setSecondaryFootprintStyle),
          footprintHeight: {
            value: settings.footprintHeightMode,
            options: {
              'Full height': 'full-height',
              'Lower tiers': 'lower-tiers-only',
              Podium: 'podium-only',
            },
            label: 'Height mode',
            onChange: (value: FootprintHeightMode) => setFootprintHeightMode(value),
          },
          hardInsetSide: {
            value: settings.hardInsetSide,
            options: {
              None: 'none',
              Front: 'front',
              Back: 'back',
              Left: 'left',
              Right: 'right',
            },
            label: 'Hard inset',
            onChange: (value: HardInsetSide) => setHardInsetSide(value),
          },
          podium: {
            value: settings.podiumStyle,
            options: {
              Colonnade: 'colonnade',
              'Corner entrance': 'corner-entrance',
              Service: 'service-bank',
            },
            label: 'Podium',
            onChange: (value: PodiumStyle) => setPodiumStyle(value),
          },
          entrance: {
            value: settings.entranceType,
            options: {
              'Center revolving': 'center-revolving',
              'Paired lobby': 'paired-lobby',
              'Corner bank': 'corner-bank',
            },
            label: 'Entry',
            onChange: (value: EntranceType) => setEntranceType(value),
          },
          shaft: {
            value: settings.shaftRhythm,
            options: {
              Chicago: 'chicago-grid',
              Regular: 'regular',
              Paired: 'paired',
            },
            label: 'Shaft',
            onChange: (value: ShaftRhythm) => setShaftRhythm(value),
          },
          crownStyle: {
            value: settings.crownStyle,
            options: {
              Windowed: 'windowed-crown',
              Flat: 'flat-parapet',
              Corners: 'corner-parapets',
            },
            label: 'Crown',
            onChange: (value: CrownStyle) => setCrownStyle(value),
          },
          roof: {
            value: settings.roofStyle,
            options: {
              Statue: 'statue-tower',
              Pyramid: 'pyramidal-metal',
              Terrace: 'flat-terrace',
              Penthouse: 'service-penthouse',
            },
            label: 'Roof',
            onChange: (value: RoofStyle) => setRoofStyle(value),
          },
          corners: {
            value: settings.cornerTreatment,
            options: {
              Rounded: 'rounded-piers',
              Square: 'square-piers',
            },
            label: 'Corners',
            onChange: (value: CornerTreatment) => setCornerTreatment(value),
          },
          crownDecor: {
            value: settings.crownDecorationStyle,
            options: {
              Classical: 'classical',
              Restrained: 'restrained',
              Skyline: 'skyline',
            },
            label: 'Decoration',
            onChange: (value: CrownDecorationStyle) => setCrownDecorationStyle(value),
          },
          finials: {
            value: settings.crownFinialRhythm,
            options: {
              Corners: 'corners-only',
              Sparse: 'edge-sparse',
              Regular: 'edge-regular',
              Dense: 'edge-dense',
              Skyline: 'skyline-spikes',
            },
            label: 'Finials',
            onChange: (value: CrownFinialRhythm) => setCrownFinialRhythm(value),
          },
          porticoProjection: numberInput(settings.porticoProjection, 0, 3.2, 0.05, (value) => setNumberSetting('porticoProjection', value), 'Portico'),
          centralAxisBays: numberInput(settings.centralAxisBays, 1, 5, 2, (value) => setNumberSetting('centralAxisBays', value), 'Axis bays'),
          hardInsetAmount: numberInput(settings.hardInsetAmount, 0, 4, 0.1, (value) => setNumberSetting('hardInsetAmount', value), 'Inset amount'),
          innerCourtWidth: numberInput(settings.innerCourtWidth, 0.18, 0.68, 0.01, (value) => setNumberSetting('innerCourtWidth', value), 'Court width'),
          innerCourtDepth: numberInput(settings.innerCourtDepth, 0.18, 0.68, 0.01, (value) => setNumberSetting('innerCourtDepth', value), 'Court depth'),
          innerCourtOffsetX: numberInput(settings.innerCourtOffsetX, -0.35, 0.35, 0.01, (value) => setNumberSetting('innerCourtOffsetX', value), 'Court X'),
          innerCourtOffsetZ: numberInput(settings.innerCourtOffsetZ, -0.35, 0.35, 0.01, (value) => setNumberSetting('innerCourtOffsetZ', value), 'Court Z'),
          skybridge: booleanInput(settings.skybridgeEnabled, (value) => setBooleanSetting('skybridgeEnabled', value)),
          skybridgeFloor: numberInput(settings.skybridgeFloor, 3, 20, 1, (value) => setNumberSetting('skybridgeFloor', value), 'Bridge floor'),
          crownDecorationDensity: numberInput(settings.crownDecorationDensity, 0, 1, 0.01, (value) => setNumberSetting('crownDecorationDensity', value), 'Decor density'),
          crownFinialDensity: numberInput(settings.crownFinialDensity, 0, 1, 0.01, (value) => setNumberSetting('crownFinialDensity', value), 'Finial density'),
          ornaments: numberInput(settings.ornamentDensity, 0, 1, 0.01, (value) => setNumberSetting('ornamentDensity', value)),
          roofEquipment: numberInput(settings.roofEquipmentDensity, 0, 1, 0.01, (value) => setNumberSetting('roofEquipmentDensity', value), 'Roof equip'),
        },
        { collapsed: true, order: 2 }
      ),
      Diagnostics: folder(
        {
          placements: disabledText(`${metrics.moduleCount}`),
          triangles: disabledText(Math.round(metrics.triangleCount).toLocaleString()),
          tiers: disabledText(`${metrics.plan.tiers.length}`),
        },
        { collapsed: true, order: 4 }
      ),
    }),
    { store },
    [settings, metrics, store]
  )

  return null
}

function numberInput(
  value: number,
  min: number,
  max: number,
  step: number,
  onChange: (value: number) => void,
  label?: string
) {
  return { value, min, max, step, label, onChange }
}

function booleanInput(value: boolean, onChange: (value: boolean) => void, label?: string) {
  return { value, label, onChange }
}

function disabledText(value: string) {
  return { value, disabled: true, editable: false }
}

function footprintInput(
  value: FootprintStyle,
  label: string,
  onChange: (value: FootprintStyle) => void
) {
  return {
    value,
    label,
    options: {
      Rectangle: 'rectangle',
      'L shape': 'l-shape',
      'T shape': 't-shape',
      'U shape': 'u-shape',
      Courtyard: 'courtyard-block',
      'High-rise': 'high-rise-block',
    },
    onChange,
  }
}
