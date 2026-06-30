/**
 * Respondent Form Page — Public form renderer
 * --------------------------
 * Accessible at /r/:public_id — no auth required.
 * Renders a published form for anonymous respondents.
 * Per Section 3.2: Anonymous respondents never create accounts.
 */

import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Zap, CheckCircle, AlertCircle,
  Send, Loader2, MapPin, Upload as UploadIcon, Star as StarIcon,
} from 'lucide-react';
import { useFormByPublicId, useCurrentVersion, useSubmitResponse } from '@/hooks';
import type { FormField, FormSchema } from '@/types';

// ---- Field Renderers ----

function ShortTextField({ field, value, onChange }: FieldRendererProps) {
  return (
    <input
      className="input"
      type="text"
      placeholder={field.placeholder || 'Type your answer...'}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
      id={`field-${field.id}`}
      maxLength={field.validation?.max}
      minLength={field.validation?.min}
    />
  );
}

function LongTextField({ field, value, onChange }: FieldRendererProps) {
  return (
    <textarea
      className="input"
      placeholder={field.placeholder || 'Type your answer...'}
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
      id={`field-${field.id}`}
      rows={4}
      style={{ resize: 'vertical' }}
    />
  );
}

function SingleChoiceField({ field, value, onChange }: FieldRendererProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {(field.options || []).map((option) => (
        <label
          key={option}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: `1.5px solid ${value === option ? 'var(--color-primary-400)' : 'var(--color-surface-200)'}`,
            background: value === option ? 'var(--color-primary-50)' : 'var(--color-surface-0)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            fontSize: '0.9375rem',
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            border: `2px solid ${value === option ? 'var(--color-primary-500)' : 'var(--color-surface-300)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {value === option && (
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: 'var(--color-primary-500)',
              }} />
            )}
          </div>
          <span style={{ color: 'var(--color-surface-800)' }}>{option}</span>
          <input type="radio" name={field.id} value={option} checked={value === option}
            onChange={() => onChange(option)} style={{ display: 'none' }} />
        </label>
      ))}
    </div>
  );
}

function MultiChoiceField({ field, value, onChange }: FieldRendererProps) {
  const selected = (value as string[]) || [];
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {(field.options || []).map((option) => {
        const isChecked = selected.includes(option);
        return (
          <label
            key={option}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${isChecked ? 'var(--color-primary-400)' : 'var(--color-surface-200)'}`,
              background: isChecked ? 'var(--color-primary-50)' : 'var(--color-surface-0)',
              cursor: 'pointer', transition: 'all var(--transition-fast)',
              fontSize: '0.9375rem',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 4,
              border: `2px solid ${isChecked ? 'var(--color-primary-500)' : 'var(--color-surface-300)'}`,
              background: isChecked ? 'var(--color-primary-500)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {isChecked && <CheckCircle size={14} color="white" />}
            </div>
            <span style={{ color: 'var(--color-surface-800)' }}>{option}</span>
            <input type="checkbox" checked={isChecked} onChange={() => toggle(option)} style={{ display: 'none' }} />
          </label>
        );
      })}
    </div>
  );
}

function DropdownField({ field, value, onChange }: FieldRendererProps) {
  return (
    <select
      className="input"
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
      id={`field-${field.id}`}
      style={{ fontSize: '0.9375rem' }}
    >
      <option value="">Select an option...</option>
      {(field.options || []).map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function NumberField({ field, value, onChange }: FieldRendererProps) {
  return (
    <input
      className="input"
      type="number"
      placeholder={field.placeholder || 'Enter a number...'}
      value={value !== undefined && value !== null ? String(value) : ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      required={field.required}
      id={`field-${field.id}`}
      min={field.validation?.min}
      max={field.validation?.max}
    />
  );
}

function DateField({ field, value, onChange }: FieldRendererProps) {
  return (
    <input
      className="input"
      type="date"
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
      id={`field-${field.id}`}
    />
  );
}

function RatingField({ field, value, onChange }: FieldRendererProps) {
  const rating = (value as number) || 0;
  const maxRating = field.validation?.max || 5;
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.25rem', transition: 'transform var(--transition-fast)',
            transform: rating >= star ? 'scale(1.15)' : 'scale(1)',
          }}
        >
          <StarIcon
            size={32}
            fill={rating >= star ? '#f59e0b' : 'transparent'}
            color={rating >= star ? '#f59e0b' : 'var(--color-surface-300)'}
          />
        </button>
      ))}
      {rating > 0 && (
        <span style={{ fontSize: '0.875rem', color: 'var(--color-surface-500)', marginLeft: '0.5rem' }}>
          {rating} / {maxRating}
        </span>
      )}
    </div>
  );
}

function GPSField({ field: _field, value, onChange }: FieldRendererProps) {
  const [loading, setLoading] = useState(false);
  const gps = value as { lat: number; lng: number } | undefined;

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div>
      <button type="button" className="btn btn-secondary" onClick={captureLocation} disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
        {gps ? 'Recapture Location' : 'Capture GPS Location'}
      </button>
      {gps && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-success)', marginTop: '0.5rem' }}>
          📍 Lat: {gps.lat.toFixed(6)}, Lng: {gps.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}

function FileUploadField({ field: _field }: FieldRendererProps) {
  return (
    <div style={{
      border: '2px dashed var(--color-surface-300)',
      borderRadius: 'var(--radius-lg)',
      padding: '2rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'border-color var(--transition-fast)',
    }}>
      <UploadIcon size={24} style={{ color: 'var(--color-surface-400)', margin: '0 auto 0.5rem' }} />
      <p style={{ fontSize: '0.875rem', color: 'var(--color-surface-600)' }}>
        Click to upload or drag and drop
      </p>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-surface-400)', marginTop: '0.25rem' }}>
        {_field.validation?.file_types?.join(', ') || 'Any file type'} • Max {_field.validation?.max_file_size_mb || 10}MB
      </p>
    </div>
  );
}

function SectionHeaderField({ field }: FieldRendererProps) {
  return (
    <div style={{ paddingTop: '0.5rem' }}>
      <h3 style={{
        fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-surface-900)',
        fontFamily: 'var(--font-heading)',
      }}>{field.label}</h3>
      {field.description && (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-surface-500)', marginTop: '0.25rem' }}>
          {field.description}
        </p>
      )}
    </div>
  );
}

// ---- Field Renderer Props ----
interface FieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
}

// ---- Field Renderer Map ----
const fieldRenderers: Record<string, React.FC<FieldRendererProps>> = {
  short_text: ShortTextField,
  long_text: LongTextField,
  single_choice: SingleChoiceField,
  multi_choice: MultiChoiceField,
  dropdown: DropdownField,
  number: NumberField,
  date: DateField,
  rating: RatingField,
  gps: GPSField,
  file: FileUploadField,
  section_header: SectionHeaderField,
};

// ---- Main Respondent Form Page ----
export function RespondentFormPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  // Fetch form by public ID from Supabase
  const { data: form, isLoading: formLoading } = useFormByPublicId(publicId || '');
  const { data: version, isLoading: versionLoading } = useCurrentVersion(form?.id || '');
  const { mutateAsync: submitResponse, isPending: submitting } = useSubmitResponse();

  const isLoading = formLoading || versionLoading;
  const schema: FormSchema | null = version?.schema || null;

  // Filter visible fields (basic conditional logic)
  const visibleFields = useMemo(() => {
    if (!schema) return [];
    return schema.fields.filter((field) => {
      if (!field.logic?.show_if) return true;
      const { field_id, operator, value } = field.logic.show_if;
      const answerVal = answers[field_id];
      switch (operator) {
        case 'eq': return answerVal === value;
        case 'ne': return answerVal !== value;
        case 'is_empty': return !answerVal;
        case 'is_not_empty': return !!answerVal;
        default: return true;
      }
    });
  }, [schema, answers]);

  // Progress calculation
  const requiredFields = visibleFields.filter((f) => f.required && f.type !== 'section_header');
  const answeredRequired = requiredFields.filter((f) => {
    const val = answers[f.id];
    if (val === undefined || val === null || val === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  });
  const progress = requiredFields.length > 0 ? Math.round((answeredRequired.length / requiredFields.length) * 100) : 100;

  const updateAnswer = (fieldId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    const missing = requiredFields.filter((f) => {
      const val = answers[f.id];
      return val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
    });

    if (missing.length > 0) {
      setError(`Please complete all required fields. Missing: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }

    if (!form || !version) {
      setError('Form data is not available. Please refresh and try again.');
      return;
    }

    try {
      await submitResponse({
        formId: form.id,
        versionId: version.id,
        answers,
        metadata: {
          startTime,
          device: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        },
      });
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit. Please check your connection and try again.');
    }
  };

  // ---- Loading State ----
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-50)' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary-500)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-surface-400)' }}>Loading form...</p>
        </div>
      </div>
    );
  }

  // ---- Error States ----
  if (!form) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-50)' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <AlertCircle size={48} style={{ color: 'var(--color-danger)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-surface-900)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            Form Not Found
          </h2>
          <p style={{ color: 'var(--color-surface-500)' }}>
            This form link may be invalid or the form may have been closed.
          </p>
        </div>
      </div>
    );
  }

  if (form.status !== 'published') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-50)' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <AlertCircle size={48} style={{ color: 'var(--color-warning)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-surface-900)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            Form Unavailable
          </h2>
          <p style={{ color: 'var(--color-surface-500)' }}>
            This form is currently {form.status}. Please contact the form owner.
          </p>
        </div>
      </div>
    );
  }

  // ---- Submission Success ----
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-50)' }}>
        <div className="animate-scale-in" style={{ textAlign: 'center', maxWidth: 440, padding: '3rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-accent-100), var(--color-accent-200))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <CheckCircle size={40} style={{ color: 'var(--color-accent-600)' }} />
          </div>
          <h2 style={{
            fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-surface-900)',
            marginBottom: '0.75rem', fontFamily: 'var(--font-heading)',
          }}>
            {schema?.settings.confirmation_message || 'Thank you for your response!'}
          </h2>
          <p style={{ color: 'var(--color-surface-500)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Your response has been recorded successfully. You may close this page.
          </p>
          <div style={{
            marginTop: '2rem', padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)', background: 'var(--color-surface-100)',
            fontSize: '0.8125rem', color: 'var(--color-surface-500)',
          }}>
            Submitted in {Math.round((Date.now() - startTime) / 1000)}s
          </div>
        </div>
      </div>
    );
  }

  // ---- Form Renderer ----
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-50)' }}>
      {/* Header Bar */}
      <div style={{
        background: 'var(--color-surface-0)',
        borderBottom: '1px solid var(--color-surface-200)',
        padding: '0.875rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-surface-700)', fontFamily: 'var(--font-heading)' }}>
            Datasurv
          </span>
        </div>
        {schema?.settings.show_progress_bar && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 120, height: 6, borderRadius: 3,
              background: 'var(--color-surface-200)', overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress}%`, height: '100%',
                background: progress === 100
                  ? 'var(--color-accent-500)'
                  : 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-400))',
                borderRadius: 3, transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-surface-500)', fontWeight: 500, minWidth: 32 }}>
              {progress}%
            </span>
          </div>
        )}
      </div>

      {/* Form Content */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        {/* Form Title Card */}
        <div style={{
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <h1 style={{
            color: 'white', fontSize: '1.5rem', fontWeight: 700,
            marginBottom: '0.5rem', position: 'relative',
            fontFamily: 'var(--font-heading)',
          }}>
            {form.title}
          </h1>
          {form.description && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', position: 'relative' }}>
              {form.description}
            </p>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
            background: '#fee2e2', border: '1px solid #fecaca',
            color: '#991b1b', fontSize: '0.8125rem',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        {/* Fields */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {visibleFields.map((field) => {
              const Renderer = fieldRenderers[field.type];
              if (!Renderer) return null;

              if (field.type === 'section_header') {
                return <Renderer key={field.id} field={field} value={undefined} onChange={() => {}} />;
              }

              return (
                <div
                  key={field.id}
                  className="card"
                  style={{ padding: '1.5rem' }}
                >
                  <label
                    htmlFor={`field-${field.id}`}
                    style={{
                      display: 'block', fontSize: '1rem', fontWeight: 600,
                      color: 'var(--color-surface-800)', marginBottom: '0.375rem',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {field.label}
                    {field.required && (
                      <span style={{ color: 'var(--color-danger)', marginLeft: '0.25rem' }}>*</span>
                    )}
                  </label>
                  {field.description && (
                    <p style={{
                      fontSize: '0.8125rem', color: 'var(--color-surface-500)',
                      marginBottom: '0.75rem',
                    }}>
                      {field.description}
                    </p>
                  )}
                  <Renderer
                    field={field}
                    value={answers[field.id]}
                    onChange={(val) => updateAnswer(field.id, val)}
                  />
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
              disabled={submitting}
              id="submit-response"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Response
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center', marginTop: '2.5rem',
          fontSize: '0.75rem', color: 'var(--color-surface-400)',
        }}>
          Powered by <span style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>Datasurv Pro</span>
        </div>
      </div>
    </div>
  );
}
