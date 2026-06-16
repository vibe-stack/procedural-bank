type RangeControlProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}

export function RangeControl(props: RangeControlProps) {
  return (
    <label className="control">
      <span>
        {props.label}
        <strong>{formatValue(props.value, props.step)}</strong>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        onChange={(event) => props.onChange(Number(event.currentTarget.value))}
      />
    </label>
  )
}

function formatValue(value: number, step = 1): string {
  return step < 1 ? value.toFixed(2) : String(value)
}
