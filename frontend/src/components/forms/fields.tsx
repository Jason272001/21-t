export function TextField({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-200">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="min-h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white outline-none focus:border-cyan-300"
      />
    </label>
  );
}

export function TextAreaField({ label, name, required = false }: { label: string; name: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-200">
      {label}
      <textarea
        name={name}
        required={required}
        rows={5}
        className="rounded-lg border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-300"
      />
    </label>
  );
}

export function SelectField({ label, name, options, required = false }: { label: string; name: string; options: string[]; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-200">
      {label}
      <select
        name={name}
        required={required}
        className="min-h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white outline-none focus:border-cyan-300"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>{option.replaceAll("_", " ")}</option>
        ))}
      </select>
    </label>
  );
}
