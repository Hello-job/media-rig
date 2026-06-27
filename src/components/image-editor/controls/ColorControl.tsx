type ColorControlProps = {
  label: string;
  value: string;
  onChange(value: string): void;
};

export default function ColorControl({ label, value, onChange }: ColorControlProps) {
  return (
    <label className="image-editor__color-control" title={label}>
      <span className="sr-only">{label}</span>
      <input
        aria-label={label}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
