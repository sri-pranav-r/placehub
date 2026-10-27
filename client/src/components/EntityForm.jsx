import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '../context/FeedbackContext';

// Generic form driven by a field list:
//   { name, label, type: text|email|url|number|date|select|textarea|csv|chips,
//     options: [[value, label]], required, half, step, min, max, placeholder, hint, default }
// Calls onSubmit(body). Empty fields are left out on create and sent as null on update.

function toValues(fields, doc) {
  const values = {};
  for (const f of fields) {
    let v = doc?.[f.name];
    if (v && typeof v === 'object' && !Array.isArray(v)) v = v._id;
    if (f.type === 'csv') values[f.name] = (v || []).join(', ');
    else if (f.type === 'chips') values[f.name] = v || [];
    else if (f.type === 'date') values[f.name] = v ? String(v).slice(0, 10) : '';
    else values[f.name] = v ?? f.default ?? '';
  }
  return values;
}

function toBody(fields, values, isUpdate) {
  const body = {};
  for (const f of fields) {
    const raw = values[f.name];
    let out;
    if (f.type === 'chips') out = raw;
    else if (f.type === 'csv') out = raw.split(',').map((s) => s.trim()).filter(Boolean);
    else if (String(raw).trim() === '') out = isUpdate ? null : undefined;
    else if (f.type === 'number') out = Number(raw);
    else out = String(raw).trim();
    if (out !== undefined) body[f.name] = out;
  }
  return body;
}

function Input({ field: f, value, onChange }) {
  const common = { id: f.name, name: f.name, required: f.required, value, placeholder: f.placeholder };

  if (f.type === 'chips') {
    const toggle = (opt) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
    return (
      <div className="chip-picker">
        {f.options.map(([opt, label]) => (
          <button
            type="button"
            key={opt}
            className={`chip-toggle ${value.includes(opt) ? 'on' : ''}`}
            onClick={() => toggle(opt)}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }
  if (f.type === 'select') {
    return (
      <select {...common} onChange={(e) => onChange(e.target.value)}>
        {!f.noPlaceholder && <option value="">{f.placeholder || 'Select…'}</option>}
        {f.options.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    );
  }
  if (f.type === 'textarea') {
    return <textarea rows={f.rows || 4} {...common} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <input
      type={f.type === 'csv' || !f.type ? 'text' : f.type}
      step={f.step}
      min={f.min}
      max={f.max}
      {...common}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function EntityForm({ fields, initial, onSubmit, onCancel, submitLabel }) {
  const toast = useToast();
  const [values, setValues] = useState(() => toValues(fields, initial));
  const [busy, setBusy] = useState(false);

  // Reset when switching between "add" and editing a different record
  useEffect(() => setValues(toValues(fields, initial)), [initial]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(toBody(fields, values, Boolean(initial?._id)));
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-grid">
        {fields.map((f) => (
          <div key={f.name} className={`field ${f.half ? 'half' : ''}`}>
            <label htmlFor={f.name}>
              {f.label}
              {f.required && <span className="req">*</span>}
            </label>
            <Input field={f} value={values[f.name]} onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))} />
            {f.hint && <small className="hint">{f.hint}</small>}
          </div>
        ))}
      </div>
      <div className="modal-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="btn btn-primary" disabled={busy}>
          {busy && <Loader2 size={16} className="spin" />}
          {submitLabel || (initial?._id ? 'Save changes' : 'Create')}
        </button>
      </div>
    </form>
  );
}
