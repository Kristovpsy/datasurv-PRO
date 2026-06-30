/**
 * Form Builder Store — Zustand
 * --------------------------
 * Local UI state for the drag-and-drop form builder.
 * Holds field order, selected field, and dirty state.
 * Per Section 7.3: synced to Supabase on explicit Save only (not on every drag).
 */

import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { FormField, FormSettings, FieldType } from '@/types';

interface FormBuilderState {
  // Form metadata
  formId: string | null;
  title: string;
  description: string;

  // Schema state
  fields: FormField[];
  settings: FormSettings;

  // UI state
  selectedFieldId: string | null;
  isDirty: boolean;
  previewMode: boolean;

  // Actions — Fields
  addField: (type: FieldType) => void;
  removeField: (fieldId: string) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  reorderFields: (activeId: string, overId: string) => void;
  duplicateField: (fieldId: string) => void;
  selectField: (fieldId: string | null) => void;

  // Actions — Form
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  updateSettings: (settings: Partial<FormSettings>) => void;
  togglePreview: () => void;
  
  // Actions — State
  loadForm: (formId: string, title: string, description: string, fields: FormField[], settings: FormSettings) => void;
  resetBuilder: () => void;
  markClean: () => void;
}

const defaultSettings: FormSettings = {
  show_progress_bar: true,
  allow_edit_after_submit: false,
  confirmation_message: 'Thank you for your response!',
  redirect_url: undefined,
};

const defaultLabel: Record<FieldType, string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  single_choice: 'Single Choice',
  multi_choice: 'Multiple Choice',
  dropdown: 'Dropdown',
  number: 'Number',
  date: 'Date',
  rating: 'Rating',
  file: 'File Upload',
  gps: 'GPS Location',
  section_header: 'Section Header',
  matrix: 'Matrix Grid',
};

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  formId: null,
  title: 'Untitled Form',
  description: '',
  fields: [],
  settings: { ...defaultSettings },
  selectedFieldId: null,
  isDirty: false,
  previewMode: false,

  addField: (type: FieldType) => {
    const { fields } = get();
    const newField: FormField = {
      id: uuid(),
      type,
      label: defaultLabel[type],
      required: false,
      order: fields.length,
      placeholder: type === 'short_text' ? 'Enter your answer...' : undefined,
      options: ['single_choice', 'multi_choice', 'dropdown'].includes(type)
        ? ['Option 1', 'Option 2', 'Option 3']
        : undefined,
    };
    set({ fields: [...fields, newField], isDirty: true, selectedFieldId: newField.id });
  },

  removeField: (fieldId: string) => {
    const { fields, selectedFieldId } = get();
    const filtered = fields
      .filter((f) => f.id !== fieldId)
      .map((f, i) => ({ ...f, order: i }));
    set({
      fields: filtered,
      isDirty: true,
      selectedFieldId: selectedFieldId === fieldId ? null : selectedFieldId,
    });
  },

  updateField: (fieldId: string, updates: Partial<FormField>) => {
    const { fields } = get();
    set({
      fields: fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
      isDirty: true,
    });
  },

  reorderFields: (activeId: string, overId: string) => {
    const { fields } = get();
    const activeIndex = fields.findIndex((f) => f.id === activeId);
    const overIndex = fields.findIndex((f) => f.id === overId);
    if (activeIndex === -1 || overIndex === -1) return;

    const reordered = [...fields];
    const [moved] = reordered.splice(activeIndex, 1);
    reordered.splice(overIndex, 0, moved);
    const withOrder = reordered.map((f, i) => ({ ...f, order: i }));
    set({ fields: withOrder, isDirty: true });
  },

  duplicateField: (fieldId: string) => {
    const { fields } = get();
    const original = fields.find((f) => f.id === fieldId);
    if (!original) return;
    const idx = fields.indexOf(original);
    const duplicate: FormField = {
      ...original,
      id: uuid(),
      label: `${original.label} (Copy)`,
      order: idx + 1,
    };
    const newFields = [...fields];
    newFields.splice(idx + 1, 0, duplicate);
    const withOrder = newFields.map((f, i) => ({ ...f, order: i }));
    set({ fields: withOrder, isDirty: true, selectedFieldId: duplicate.id });
  },

  selectField: (fieldId: string | null) => set({ selectedFieldId: fieldId }),

  setTitle: (title: string) => set({ title, isDirty: true }),
  setDescription: (description: string) => set({ description, isDirty: true }),

  updateSettings: (updates: Partial<FormSettings>) => {
    const { settings } = get();
    set({ settings: { ...settings, ...updates }, isDirty: true });
  },

  togglePreview: () => set((state) => ({ previewMode: !state.previewMode })),

  loadForm: (formId, title, description, fields, settings) => {
    set({ formId, title, description, fields, settings, isDirty: false, selectedFieldId: null, previewMode: false });
  },

  resetBuilder: () => {
    set({
      formId: null,
      title: 'Untitled Form',
      description: '',
      fields: [],
      settings: { ...defaultSettings },
      selectedFieldId: null,
      isDirty: false,
      previewMode: false,
    });
  },

  markClean: () => set({ isDirty: false }),
}));
