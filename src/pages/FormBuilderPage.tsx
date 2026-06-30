/**
 * Form Builder Page — Drag & Drop Form Editor
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GripVertical, Plus, Trash2, Copy, Eye, Save, Send,
  Type, AlignLeft, CircleDot, CheckSquare, ChevronDown,
  Hash, Calendar, Star, Upload, MapPin, Columns, Minus,
  ArrowLeft, X, FileText, EyeOff, Lock,
} from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFormBuilderStore } from '@/stores';
import { useUIStore, useAuthStore } from '@/stores';
import type { FieldType, FormField } from '@/types';

const fieldTypeIcons: Record<FieldType, React.ReactNode> = {
  short_text: <Type size={16} />, long_text: <AlignLeft size={16} />,
  single_choice: <CircleDot size={16} />, multi_choice: <CheckSquare size={16} />,
  dropdown: <ChevronDown size={16} />, number: <Hash size={16} />,
  date: <Calendar size={16} />, rating: <Star size={16} />,
  file: <Upload size={16} />, gps: <MapPin size={16} />,
  section_header: <Minus size={16} />, matrix: <Columns size={16} />,
};

const fieldTypeLabels: Record<FieldType, string> = {
  short_text: 'Short Text', long_text: 'Long Text', single_choice: 'Single Choice',
  multi_choice: 'Multiple Choice', dropdown: 'Dropdown', number: 'Number',
  date: 'Date', rating: 'Rating', file: 'File Upload', gps: 'GPS Location',
  section_header: 'Section Header', matrix: 'Matrix Grid',
};

function SortableFieldCard({ field, isSelected, onSelect, onRemove, onDuplicate }: {
  field: FormField; isSelected: boolean; onSelect: () => void;
  onRemove: () => void; onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform), transition,
    opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        onClick={onSelect}
        role="button"
        tabIndex={0}
        aria-label={`Field: ${field.label}`}
        id={`field-card-${field.id}`}
        style={{
          padding: '1rem', cursor: 'pointer', position: 'relative',
          background: isSelected ? 'var(--color-primary-50)' : 'var(--color-surface-0)',
          border: `1px solid ${isSelected ? 'var(--color-primary-300)' : 'var(--color-surface-200)'}`,
          borderRadius: 'var(--radius-lg)', boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
          transition: 'all var(--transition-fast)',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div {...listeners} style={{ cursor: 'grab', color: 'var(--color-surface-400)', padding: '0.25rem' }}>
            <GripVertical size={16} />
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-md)',
            background: field.type === 'section_header' ? 'var(--color-surface-200)' : 'var(--color-primary-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: field.type === 'section_header' ? 'var(--color-surface-600)' : 'var(--color-primary-600)',
          }}>{fieldTypeIcons[field.type]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-surface-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {field.label}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-surface-400)' }}>
              {fieldTypeLabels[field.type]}{field.required ? ' • Required' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              title="Duplicate"><Copy size={14} /></button>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); onRemove(); }}
              title="Delete" style={{ color: 'var(--color-danger)' }}><Trash2 size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldConfigPanel({ field, onUpdate, onClose }: {
  field: FormField; onUpdate: (updates: Partial<FormField>) => void; onClose: () => void;
}) {
  return (
    <div className="animate-slide-in-right" style={{
      width: 340, background: 'var(--color-surface-0)', borderLeft: '1px solid var(--color-surface-200)',
      padding: '1.5rem', overflowY: 'auto', height: 'calc(100vh - var(--topnav-height))',
      position: 'sticky', top: 'var(--topnav-height)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-surface-800)' }}>Field Settings</h3>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label className="label">Label</label>
          <input className="input" value={field.label} onChange={(e) => onUpdate({ label: e.target.value })} />
        </div>

        {field.type !== 'section_header' && (
          <>
            <div>
              <label className="label">Placeholder</label>
              <input className="input" value={field.placeholder || ''} onChange={(e) => onUpdate({ placeholder: e.target.value })} placeholder="Enter placeholder text..." />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea className="input" value={field.description || ''} onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Optional help text..." rows={2} style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={field.required} onChange={(e) => onUpdate({ required: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: 'var(--color-primary-500)' }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-surface-700)' }}>Required</span>
              </label>
            </div>
          </>
        )}

        {/* Options for choice fields */}
        {['single_choice', 'multi_choice', 'dropdown'].includes(field.type) && (
          <div>
            <label className="label">Options</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(field.options || []).map((opt, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input className="input" value={opt} style={{ fontSize: '0.8125rem' }}
                    onChange={(e) => {
                      const newOpts = [...(field.options || [])];
                      newOpts[i] = e.target.value;
                      onUpdate({ options: newOpts });
                    }} />
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => {
                    const newOpts = (field.options || []).filter((_, idx) => idx !== i);
                    onUpdate({ options: newOpts });
                  }} style={{ color: 'var(--color-danger)', flexShrink: 0 }}><Trash2 size={14} /></button>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}
                onClick={() => onUpdate({ options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] })}>
                <Plus size={14} /> Add Option
              </button>
            </div>
          </div>
        )}

        {/* Validation for number fields */}
        {field.type === 'number' && (
          <div>
            <label className="label">Validation</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-surface-500)' }}>Min</span>
                <input className="input" type="number" value={field.validation?.min ?? ''} style={{ fontSize: '0.8125rem' }}
                  onChange={(e) => onUpdate({ validation: { ...field.validation, min: e.target.value ? Number(e.target.value) : undefined } })} />
              </div>
              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-surface-500)' }}>Max</span>
                <input className="input" type="number" value={field.validation?.max ?? ''} style={{ fontSize: '0.8125rem' }}
                  onChange={(e) => onUpdate({ validation: { ...field.validation, max: e.target.value ? Number(e.target.value) : undefined } })} />
              </div>
            </div>
          </div>
        )}

        <div style={{
          padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-50)',
          border: '1px solid var(--color-primary-100)', fontSize: '0.75rem', color: 'var(--color-primary-700)',
        }}>
          <strong>Field Type:</strong> {fieldTypeLabels[field.type]}
        </div>
      </div>
    </div>
  );
}

export function FormBuilderPage() {
  const navigate = useNavigate();
  const { addNotification } = useUIStore();
  const { isReadOnly } = useAuthStore();
  const {
    title, description, fields, selectedFieldId, isDirty, previewMode,
    addField, removeField, updateField, reorderFields, duplicateField,
    selectField, setTitle, setDescription, togglePreview, markClean,
  } = useFormBuilderStore();
  const [showFieldPalette, setShowFieldPalette] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderFields(active.id as string, over.id as string);
    }
  };

  const handleSave = () => {
    markClean();
    addNotification({ type: 'success', message: 'Form saved successfully!' });
  };

  const handlePublish = () => {
    markClean();
    addNotification({ type: 'success', message: 'Form published! Share link is ready.' });
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - var(--topnav-height))', marginTop: '-1.5rem', marginLeft: '-1.5rem', marginRight: '-1.5rem', marginBottom: '-1.5rem' }}>
      {/* Main Builder Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Builder Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--color-surface-200)',
          background: 'var(--color-surface-0)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Back
            </button>
            <div style={{ width: 1, height: 24, background: 'var(--color-surface-200)' }} />
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="input" style={{
                border: 'none', fontSize: '1.125rem', fontWeight: 600, padding: '0.25rem 0.5rem',
                background: 'transparent', width: 300, color: 'var(--color-surface-900)',
              }}
              placeholder="Form title" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isReadOnly && (
              <span className="badge" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Lock size={12} /> Read-Only
              </span>
            )}
            {isDirty && !isReadOnly && <span className="badge badge-warning">Unsaved changes</span>}
            <button className="btn btn-ghost btn-sm" onClick={togglePreview}>
              {previewMode ? <><EyeOff size={16} /> Editor</> : <><Eye size={16} /> Preview</>}
            </button>
            {!isReadOnly && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={handleSave}>
                  <Save size={16} /> Save Draft
                </button>
                <button className="btn btn-primary btn-sm" onClick={handlePublish}>
                  <Send size={16} /> Publish
                </button>
              </>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflow: 'auto', padding: '2rem', background: 'var(--color-surface-50)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {/* Form Header */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="input" style={{
                  border: 'none', fontSize: '1.5rem', fontWeight: 700, padding: 0, marginBottom: '0.5rem',
                  background: 'transparent', color: 'var(--color-surface-900)',
                }} placeholder="Untitled Form" />
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                className="input" style={{
                  border: 'none', fontSize: '0.875rem', padding: 0,
                  background: 'transparent', color: 'var(--color-surface-500)',
                }} placeholder="Add a form description..." />
            </div>

            {/* Fields */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {fields.map(field => (
                    <SortableFieldCard
                      key={field.id} field={field}
                      isSelected={selectedFieldId === field.id}
                      onSelect={() => selectField(field.id)}
                      onRemove={() => removeField(field.id)}
                      onDuplicate={() => duplicateField(field.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add Field Button */}
            {!isReadOnly && (
            <div style={{ marginTop: '1rem', position: 'relative' }}>
              <button className="btn btn-secondary" style={{ width: '100%', padding: '1rem', borderStyle: 'dashed' }}
                onClick={() => setShowFieldPalette(!showFieldPalette)}>
                <Plus size={18} /> Add Field
              </button>
              {showFieldPalette && (
                <div className="card animate-scale-in" style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem',
                  padding: '1rem', zIndex: 20,
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {(Object.keys(fieldTypeLabels) as FieldType[]).map(type => (
                      <button key={type} className="btn btn-ghost btn-sm" style={{
                        justifyContent: 'flex-start', padding: '0.625rem 0.75rem',
                      }} onClick={() => { addField(type); setShowFieldPalette(false); }}>
                        {fieldTypeIcons[type]}
                        <span style={{ fontSize: '0.75rem' }}>{fieldTypeLabels[type]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )}

            {fields.length === 0 && (
              <div className="empty-state" style={{ marginTop: '2rem' }}>
                <FileText size={48} className="empty-state-icon" />
                <h3 className="empty-state-title">Start building your form</h3>
                <p className="empty-state-text">Click "Add Field" above to add your first question.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Config Panel */}
      {selectedField && !previewMode && (
        <FieldConfigPanel
          field={selectedField}
          onUpdate={(updates) => updateField(selectedField.id, updates)}
          onClose={() => selectField(null)}
        />
      )}

      {/* Live Preview Panel */}
      {previewMode && (
        <div style={{
          width: 420, borderLeft: '1px solid var(--color-surface-200)',
          background: 'var(--color-surface-50)', overflow: 'auto',
        }}>
          <div style={{
            padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-surface-200)',
            background: 'var(--color-surface-0)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-surface-700)', fontFamily: 'var(--font-heading)' }}>
              📱 Live Preview
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={togglePreview}>
              <X size={14} />
            </button>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {/* Preview Title Card */}
            <div style={{
              padding: '1.25rem', borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
              marginBottom: '1.25rem',
            }}>
              <h2 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                {title || 'Untitled Form'}
              </h2>
              {description && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem', marginTop: '0.375rem' }}>
                  {description}
                </p>
              )}
            </div>

            {/* Preview Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {fields.map((field) => {
                if (field.type === 'section_header') {
                  return (
                    <div key={field.id} style={{ paddingTop: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{field.label}</h3>
                      {field.description && <p style={{ fontSize: '0.75rem', color: 'var(--color-surface-500)' }}>{field.description}</p>}
                    </div>
                  );
                }

                return (
                  <div key={field.id} className="card" style={{ padding: '1rem' }}>
                    <label style={{
                      display: 'block', fontSize: '0.8125rem', fontWeight: 600,
                      color: 'var(--color-surface-800)', marginBottom: '0.375rem',
                      fontFamily: 'var(--font-heading)',
                    }}>
                      {field.label}
                      {field.required && <span style={{ color: 'var(--color-danger)', marginLeft: 2 }}>*</span>}
                    </label>
                    {field.description && (
                      <p style={{ fontSize: '0.6875rem', color: 'var(--color-surface-500)', marginBottom: '0.5rem' }}>
                        {field.description}
                      </p>
                    )}
                    {/* Render field preview */}
                    {(field.type === 'short_text' || field.type === 'number') && (
                      <input className="input" type={field.type === 'number' ? 'number' : 'text'}
                        placeholder={field.placeholder || 'Type answer...'}
                        value={(previewAnswers[field.id] as string) || ''}
                        onChange={(e) => setPreviewAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                        style={{ fontSize: '0.8125rem' }}
                      />
                    )}
                    {field.type === 'long_text' && (
                      <textarea className="input" placeholder={field.placeholder || 'Type answer...'}
                        value={(previewAnswers[field.id] as string) || ''}
                        onChange={(e) => setPreviewAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                        rows={3} style={{ resize: 'vertical', fontSize: '0.8125rem' }}
                      />
                    )}
                    {field.type === 'date' && (
                      <input className="input" type="date" style={{ fontSize: '0.8125rem' }}
                        value={(previewAnswers[field.id] as string) || ''}
                        onChange={(e) => setPreviewAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                      />
                    )}
                    {(field.type === 'single_choice' || field.type === 'dropdown') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {(field.options || []).map(opt => (
                          <label key={opt} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 0.625rem', borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${previewAnswers[field.id] === opt ? 'var(--color-primary-400)' : 'var(--color-surface-200)'}`,
                            background: previewAnswers[field.id] === opt ? 'var(--color-primary-50)' : 'transparent',
                            cursor: 'pointer', fontSize: '0.8125rem',
                          }}>
                            <input type="radio" name={`preview-${field.id}`} value={opt}
                              checked={previewAnswers[field.id] === opt}
                              onChange={() => setPreviewAnswers(p => ({ ...p, [field.id]: opt }))}
                              style={{ display: 'none' }}
                            />
                            <div style={{
                              width: 14, height: 14, borderRadius: '50%',
                              border: `2px solid ${previewAnswers[field.id] === opt ? 'var(--color-primary-500)' : 'var(--color-surface-300)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {previewAnswers[field.id] === opt && (
                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-primary-500)' }} />
                              )}
                            </div>
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                    {field.type === 'multi_choice' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {(field.options || []).map(opt => {
                          const sel = (previewAnswers[field.id] as string[]) || [];
                          const checked = sel.includes(opt);
                          return (
                            <label key={opt} style={{
                              display: 'flex', alignItems: 'center', gap: '0.5rem',
                              padding: '0.5rem 0.625rem', borderRadius: 'var(--radius-sm)',
                              border: `1px solid ${checked ? 'var(--color-primary-400)' : 'var(--color-surface-200)'}`,
                              background: checked ? 'var(--color-primary-50)' : 'transparent',
                              cursor: 'pointer', fontSize: '0.8125rem',
                            }}>
                              <input type="checkbox" checked={checked}
                                onChange={() => setPreviewAnswers(p => ({
                                  ...p,
                                  [field.id]: checked ? sel.filter(s => s !== opt) : [...sel, opt],
                                }))}
                                style={{ display: 'none' }}
                              />
                              <div style={{
                                width: 14, height: 14, borderRadius: 3,
                                border: `2px solid ${checked ? 'var(--color-primary-500)' : 'var(--color-surface-300)'}`,
                                background: checked ? 'var(--color-primary-500)' : 'transparent',
                              }} />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {field.type === 'rating' && (
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button" onClick={() => setPreviewAnswers(p => ({ ...p, [field.id]: s }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                            <Star size={20}
                              fill={(previewAnswers[field.id] as number) >= s ? '#f59e0b' : 'transparent'}
                              color={(previewAnswers[field.id] as number) >= s ? '#f59e0b' : 'var(--color-surface-300)'}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                    {field.type === 'gps' && (
                      <button className="btn btn-secondary btn-sm" type="button" style={{ fontSize: '0.75rem' }}>
                        <MapPin size={14} /> Capture Location
                      </button>
                    )}
                    {field.type === 'file' && (
                      <div style={{
                        border: '1.5px dashed var(--color-surface-300)', borderRadius: 'var(--radius-md)',
                        padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-surface-400)',
                      }}>
                        <Upload size={18} style={{ margin: '0 auto 0.25rem' }} />
                        Click to upload
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Button Preview */}
            {fields.length > 0 && (
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }} disabled>
                <Send size={16} /> Submit Response
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
