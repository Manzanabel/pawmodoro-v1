interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hint?: string
}

/** Accessible on/off switch built on a native checkbox. */
export function Switch({ checked, onChange, label, hint }: Props) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch__track" aria-hidden="true" />
      <span className="switch__text">
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  )
}
