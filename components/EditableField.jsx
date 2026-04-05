'use client'

export default function EditableField({ label, value, onChange, multiline = false }) {
  return (
    <div className="editable-field">
      <label className="field-label">{label}</label>
      {multiline ? (
        <textarea
          className="field-input"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      ) : (
        <input
          className="field-input"
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
