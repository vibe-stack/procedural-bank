import { useSnapshot } from 'valtio'
import type {
  BuildingArchetype,
  CornerTreatment,
  CrownDecorationStyle,
  CrownFinialRhythm,
  CrownStyle,
  EntranceType,
  FootprintHeightMode,
  FootprintStyle,
  HardInsetSide,
  MassingPattern,
  PodiumStyle,
  RoofStyle,
  ShaftRhythm,
} from '../kit/kit-types'
import {
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
  setNumberSetting,
  setPodiumStyle,
  setRoofStyle,
  setSecondaryFootprintStyle,
  setShaftRhythm,
  setBooleanSetting,
} from '../state/building-actions'
import { buildingState } from '../state/building-state'
import { RangeControl } from './range-control'

export function GrammarControls() {
  const settings = useSnapshot(buildingState)
  return (
    <>
      <select value={settings.buildingArchetype} onChange={(event) => setBuildingArchetype(event.currentTarget.value as BuildingArchetype)}>
        <option value="board-of-trade-tower">Board-of-trade tower</option>
        <option value="temple-bank-podium">Temple bank podium</option>
        <option value="terra-cotta-arcade">Terra-cotta arcade</option>
        <option value="high-rise-pyramid">High-rise pyramid</option>
        <option value="federal-fortress">Federal fortress</option>
      </select>
      <select value={settings.massingPattern} onChange={(event) => setMassingPattern(event.currentTarget.value as MassingPattern)}>
        <option value="single-tower">Single tower massing</option>
        <option value="outer-ring">Outer rectangle / free inner court</option>
        <option value="twin-towers">Twin towers + skybridge</option>
      </select>
      <select value={settings.footprintStyle} onChange={(event) => setFootprintStyle(event.currentTarget.value as FootprintStyle)}>
        <option value="rectangle">Rectangular block</option>
        <option value="l-shape">L shaped bank</option>
        <option value="t-shape">T shaped tower</option>
        <option value="u-shape">U shaped court</option>
        <option value="courtyard-block">Courtyard block</option>
        <option value="high-rise-block">High-rise block</option>
      </select>
      <select value={settings.secondaryFootprintStyle} onChange={(event) => setSecondaryFootprintStyle(event.currentTarget.value as FootprintStyle)}>
        <option value="rectangle">Second tower rectangle</option>
        <option value="l-shape">Second tower L shape</option>
        <option value="t-shape">Second tower T shape</option>
        <option value="u-shape">Second tower U shape</option>
        <option value="courtyard-block">Second tower courtyard</option>
        <option value="high-rise-block">Second tower high-rise block</option>
      </select>
      <select value={settings.footprintHeightMode} onChange={(event) => setFootprintHeightMode(event.currentTarget.value as FootprintHeightMode)}>
        <option value="full-height">Footprint full height</option>
        <option value="lower-tiers-only">Footprint lower tiers only</option>
        <option value="podium-only">Footprint podium only</option>
      </select>
      <select value={settings.hardInsetSide} onChange={(event) => setHardInsetSide(event.currentTarget.value as HardInsetSide)}>
        <option value="none">No directional hard inset</option>
        <option value="front">Hard inset front</option>
        <option value="back">Hard inset back</option>
        <option value="left">Hard inset left</option>
        <option value="right">Hard inset right</option>
      </select>
      <select value={settings.podiumStyle} onChange={(event) => setPodiumStyle(event.currentTarget.value as PodiumStyle)}>
        <option value="colonnade">Colonnade podium</option>
        <option value="corner-entrance">Corner entrance podium</option>
        <option value="service-bank">Service bank podium</option>
      </select>
      <select value={settings.entranceType} onChange={(event) => setEntranceType(event.currentTarget.value as EntranceType)}>
        <option value="center-revolving">Center revolving entry</option>
        <option value="paired-lobby">Paired lobby doors</option>
        <option value="corner-bank">Corner bank entry</option>
      </select>
      <select value={settings.shaftRhythm} onChange={(event) => setShaftRhythm(event.currentTarget.value as ShaftRhythm)}>
        <option value="chicago-grid">Chicago grid</option>
        <option value="regular">Regular office grid</option>
        <option value="paired">Paired shaft rhythm</option>
      </select>
      <select value={settings.crownStyle} onChange={(event) => setCrownStyle(event.currentTarget.value as CrownStyle)}>
        <option value="windowed-crown">Windowed crown</option>
        <option value="flat-parapet">Flat parapet</option>
        <option value="corner-parapets">Corner parapets</option>
      </select>
      <select value={settings.roofStyle} onChange={(event) => setRoofStyle(event.currentTarget.value as RoofStyle)}>
        <option value="statue-tower">Statue tower roof</option>
        <option value="pyramidal-metal">Pyramidal metal roof</option>
        <option value="flat-terrace">Flat setback terrace</option>
        <option value="service-penthouse">Service penthouse</option>
      </select>
      <select value={settings.cornerTreatment} onChange={(event) => setCornerTreatment(event.currentTarget.value as CornerTreatment)}>
        <option value="rounded-piers">Rounded structural corners</option>
        <option value="square-piers">Square structural corners</option>
      </select>
      <select value={settings.crownDecorationStyle} onChange={(event) => setCrownDecorationStyle(event.currentTarget.value as CrownDecorationStyle)}>
        <option value="classical">Classical crown decorations</option>
        <option value="restrained">Restrained crown decorations</option>
        <option value="skyline">Skyline crown decorations</option>
      </select>
      <select value={settings.crownFinialRhythm} onChange={(event) => setCrownFinialRhythm(event.currentTarget.value as CrownFinialRhythm)}>
        <option value="corners-only">Finials corners only</option>
        <option value="edge-sparse">Finials sparse edge rhythm</option>
        <option value="edge-regular">Finials regular edge rhythm</option>
        <option value="edge-dense">Finials dense edge rhythm</option>
        <option value="skyline-spikes">Finials skyline spikes</option>
      </select>
      <RangeControl label="Portico projection" value={settings.porticoProjection} min={0} max={3.2} step={0.05} onChange={(value) => setNumberSetting('porticoProjection', value)} />
      <RangeControl label="Central axis bays" value={settings.centralAxisBays} min={1} max={5} step={2} onChange={(value) => setNumberSetting('centralAxisBays', value)} />
      <RangeControl label="Hard inset amount" value={settings.hardInsetAmount} min={0} max={4} step={0.1} onChange={(value) => setNumberSetting('hardInsetAmount', value)} />
      <RangeControl label="Inner court width" value={settings.innerCourtWidth} min={0.18} max={0.68} step={0.01} onChange={(value) => setNumberSetting('innerCourtWidth', value)} />
      <RangeControl label="Inner court depth" value={settings.innerCourtDepth} min={0.18} max={0.68} step={0.01} onChange={(value) => setNumberSetting('innerCourtDepth', value)} />
      <RangeControl label="Inner court offset X" value={settings.innerCourtOffsetX} min={-0.35} max={0.35} step={0.01} onChange={(value) => setNumberSetting('innerCourtOffsetX', value)} />
      <RangeControl label="Inner court offset Z" value={settings.innerCourtOffsetZ} min={-0.35} max={0.35} step={0.01} onChange={(value) => setNumberSetting('innerCourtOffsetZ', value)} />
      <label>
        <input type="checkbox" checked={settings.skybridgeEnabled} onChange={(event) => setBooleanSetting('skybridgeEnabled', event.currentTarget.checked)} />
        Skybridge
      </label>
      <RangeControl label="Skybridge floor" value={settings.skybridgeFloor} min={3} max={20} step={1} onChange={(value) => setNumberSetting('skybridgeFloor', value)} />
      <RangeControl label="Crown decoration density" value={settings.crownDecorationDensity} min={0} max={1} step={0.01} onChange={(value) => setNumberSetting('crownDecorationDensity', value)} />
      <RangeControl label="Crown finial density" value={settings.crownFinialDensity} min={0} max={1} step={0.01} onChange={(value) => setNumberSetting('crownFinialDensity', value)} />
      <RangeControl label="Ornaments" value={settings.ornamentDensity} min={0} max={1} step={0.01} onChange={(value) => setNumberSetting('ornamentDensity', value)} />
      <RangeControl label="Roof equipment" value={settings.roofEquipmentDensity} min={0} max={1} step={0.01} onChange={(value) => setNumberSetting('roofEquipmentDensity', value)} />
    </>
  )
}
