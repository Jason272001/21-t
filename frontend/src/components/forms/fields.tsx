export function TextField({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  readOnly = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className="min-h-11 rounded-lg border border-line/10 bg-page px-3 text-foreground outline-none focus:border-accent"
      />
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  required = false,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <textarea
        name={name}
        required={required}
        rows={5}
        className="rounded-lg border border-line/10 bg-page px-3 py-3 text-foreground outline-none focus:border-accent"
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  required = false,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <select
        name={name}
        required={required}
        className="min-h-11 rounded-lg border border-line/10 bg-page px-3 text-foreground outline-none focus:border-accent"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
