import { ADMIN_PERMISSION_OPTIONS, type AdminPermission } from '../../lib/adminPermissions';

type StaffPermissionsEditorProps = {
  value: readonly string[];
  onChange: (permissions: AdminPermission[]) => void;
  disabled?: boolean;
  /** Prefix that keeps checkbox ids unique when two editors are on screen. */
  idPrefix: string;
};

/** Checkbox list for choosing which admin-panel sections a staff member can manage. */
export default function StaffPermissionsEditor({ value, onChange, disabled = false, idPrefix }: StaffPermissionsEditorProps) {
  const granted = new Set(value);

  const toggle = (key: AdminPermission) => {
    const next = ADMIN_PERMISSION_OPTIONS.map((option) => option.key).filter((optionKey) =>
      optionKey === key ? !granted.has(key) : granted.has(optionKey),
    );
    onChange(next);
  };

  return (
    <fieldset disabled={disabled} className="space-y-2 disabled:opacity-60">
      <legend className="text-[11px] font-black uppercase tracking-wider text-ink-500">
        Sections this staff member can manage
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {ADMIN_PERMISSION_OPTIONS.map((option) => {
          const inputId = `${idPrefix}-${option.key}`;
          const isGranted = granted.has(option.key);
          return (
            <label
              key={option.key}
              htmlFor={inputId}
              className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
                isGranted
                  ? 'border-[#344257] bg-[#F0F0F5]'
                  : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50'
              }`}
            >
              <input
                id={inputId}
                type="checkbox"
                checked={isGranted}
                onChange={() => toggle(option.key)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#344257]"
              />
              <span className="min-w-0">
                <span className="block text-xs font-black text-ink-900">{option.label}</span>
                <span className="block text-[11px] text-ink-500 leading-snug">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
