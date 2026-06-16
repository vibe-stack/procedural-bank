type ToggleControlProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function ToggleControl(props: ToggleControlProps) {
  return (
    <label className="toggle-control">
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(event) => props.onChange(event.currentTarget.checked)}
      />
      <span>{props.label}</span>
    </label>
  )
}
