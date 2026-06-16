import { useSnapshot } from 'valtio'
import {
  randomizeSeed,
  setBooleanSetting,
  setNumberSetting,
} from '../state/building-actions'
import { buildingState } from '../state/building-state'
import { RangeControl } from './range-control'
import { ToggleControl } from './toggle-control'

export function BuildingControls() {
  const settings = useSnapshot(buildingState)
  return (
    <>
      <button className="wide-button" type="button" onClick={randomizeSeed}>Randomize seed</button>
      <RangeControl label="Seed" value={settings.seed} min={1} max={99999} onChange={(value) => setNumberSetting('seed', value)} />
      <RangeControl label="Width bays" value={settings.widthBays} min={5} max={15} onChange={(value) => setNumberSetting('widthBays', value)} />
      <RangeControl label="Depth bays" value={settings.depthBays} min={4} max={12} onChange={(value) => setNumberSetting('depthBays', value)} />
      <RangeControl label="Floors" value={settings.floors} min={7} max={30} onChange={(value) => setNumberSetting('floors', value)} />
      <RangeControl label="Podium floors" value={settings.podiumFloors} min={2} max={5} onChange={(value) => setNumberSetting('podiumFloors', value)} />
      <RangeControl label="Setback floors" value={settings.setbackFloors} min={1} max={4} onChange={(value) => setNumberSetting('setbackFloors', value)} />
      <RangeControl label="Tower scale" value={settings.towerScale} min={0.62} max={1} step={0.01} onChange={(value) => setNumberSetting('towerScale', value)} />
      <div className="toggle-grid">
        <ToggleControl label="Colonnade" checked={settings.colonnade} onChange={(value) => setBooleanSetting('colonnade', value)} />
        <ToggleControl label="Corner entry" checked={settings.cornerEntrance} onChange={(value) => setBooleanSetting('cornerEntrance', value)} />
        <ToggleControl label="Crown" checked={settings.crown} onChange={(value) => setBooleanSetting('crown', value)} />
      </div>
    </>
  )
}
