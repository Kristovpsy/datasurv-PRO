/**
 * Demo Data Service — Department of Plant Health and Pest Control (DPHPC)
 * -------------------------------------------------------------------------
 * Real-life KPI data collection forms replacing the generic demo content.
 * All service functions follow the same interface as the Supabase-connected version.
 */

import { v4 as uuid } from 'uuid';
import type {
  Project,
  Form,
  FormVersion,
  FormSchema,
  FormField,
  Response as FormResponse,
  ApprovalStatus,
} from '@/types';

// ---- Constants ----
const ORG_ID = 'dphpc-org-001';
const EDITOR_ID = 'dphpc-editor-001';
const OFFICER_ID = 'dphpc-officer-001';

// ---- Reference data ----
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'FCT-Abuja', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export const REGIONS = [
  'North Central', 'North East', 'North West',
  'South East', 'South South', 'South West',
];

const REPORTING_PERIODS = [
  'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025',
  'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026',
];

// ---- Demo Projects ----
export const demoProjects: Project[] = [
  {
    id: 'proj-001',
    org_id: ORG_ID,
    name: 'KPI Data Collection — Plant Pest Surveillance',
    description: 'Nationwide plant pest surveillance and intervention reporting across all 36 states and FCT.',
    created_by: EDITOR_ID,
    is_active: true,
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'proj-002',
    org_id: ORG_ID,
    name: 'Capacity Building — Extension Officers & Farmers',
    description: 'Training programme tracking for crop farmers and agricultural extension officers.',
    created_by: EDITOR_ID,
    is_active: true,
    created_at: '2025-02-01T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'proj-003',
    org_id: ORG_ID,
    name: 'AMR Surveillance in Plant Health',
    description: 'Antimicrobial resistance monitoring across farms — tracking chemical use, disease occurrence, and farmer awareness.',
    created_by: EDITOR_ID,
    is_active: true,
    created_at: '2025-03-15T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'proj-004',
    org_id: ORG_ID,
    name: 'Input Distribution & Empowerment Programme',
    description: 'Beneficiary registration and tracking for pesticide, sprayer, and PPE distribution.',
    created_by: EDITOR_ID,
    is_active: true,
    created_at: '2025-04-01T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'proj-005',
    org_id: ORG_ID,
    name: 'Data Collection Officer Registry',
    description: 'Registration and management of all field data collection officers across regions.',
    created_by: EDITOR_ID,
    is_active: true,
    created_at: '2025-01-05T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
];

// ==========================================================================
// FORM 1: Data Collection Officer Registration
// ==========================================================================
const officerRegFields: FormField[] = [
  {
    id: uuid(),
    type: 'section_header',
    label: 'Officer Registration',
    description: 'Complete all fields to register as a Data Collection Officer.',
    required: false,
    order: 0,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
    order: 1,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Designation',
    placeholder: 'e.g. Agricultural Officer II',
    required: true,
    order: 2,
  },
  {
    id: uuid(),
    type: 'dropdown',
    label: 'Region',
    required: true,
    order: 3,
    options: REGIONS,
  },
  {
    id: uuid(),
    type: 'dropdown',
    label: 'Location/State',
    required: true,
    order: 4,
    options: NIGERIAN_STATES,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Grade Level',
    placeholder: 'e.g. GL-10',
    required: false,
    order: 5,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Email Address',
    placeholder: 'officer@mail.gov.ng',
    required: true,
    order: 6,
    validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' },
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Telephone Number',
    placeholder: '08012345678',
    required: false,
    order: 7,
  },
];

const officerRegSchema: FormSchema = {
  fields: officerRegFields,
  settings: {
    show_progress_bar: true,
    allow_edit_after_submit: false,
    confirmation_message: 'Your registration has been submitted. You will be contacted with your access details.',
  },
};

// ==========================================================================
// FORM 2: Plant Pest Surveillance Report
// ==========================================================================
export const pestSurveillanceFields: FormField[] = [
  {
    id: uuid(),
    type: 'section_header',
    label: 'Programme Details',
    description: 'Provide details about the programme and location.',
    required: false,
    order: 0,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Department',
    placeholder: 'Department of Plant Health and Pest Control',
    required: false,
    order: 1,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Unit',
    placeholder: 'e.g. Pest Surveillance Unit',
    required: false,
    order: 2,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Programme or Project Name',
    placeholder: 'Enter programme name',
    required: true,
    order: 3,
  },
  {
    id: uuid(),
    type: 'dropdown',
    label: 'State',
    required: true,
    order: 4,
    options: NIGERIAN_STATES,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Local Government Area (LGA)',
    placeholder: 'Enter LGA name',
    required: true,
    order: 5,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Community/Location',
    placeholder: 'Enter community or location name',
    required: true,
    order: 6,
  },
  {
    id: uuid(),
    type: 'dropdown',
    label: 'Reporting Period (Quarter/Year)',
    required: false,
    order: 7,
    options: REPORTING_PERIODS,
  },
  {
    id: uuid(),
    type: 'section_header',
    label: 'Pest & Crop Information',
    description: 'Details about the pest and affected crop.',
    required: false,
    order: 8,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Type of Plant Pest',
    placeholder: 'e.g. Fall Armyworm, Cassava Mosaic Virus',
    required: false,
    order: 9,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Name of Crop',
    placeholder: 'e.g. Maize, Cassava, Tomato',
    required: true,
    order: 10,
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Quantity of Crop Affected (kg or ha — specify unit in your response)',
    placeholder: 'Enter quantity',
    required: false,
    order: 11,
  },
  {
    id: uuid(),
    type: 'section_header',
    label: 'Intervention Details',
    required: false,
    order: 12,
  },
  {
    id: uuid(),
    type: 'multi_choice',
    label: 'Type of Intervention',
    required: false,
    order: 13,
    options: ['Chemical spraying', 'Biological control', 'Manual removal', 'Quarantine', 'Other'],
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Name of Pesticide Utilized',
    placeholder: 'e.g. Cypermethrin 10% EC',
    required: false,
    order: 14,
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Quantity of Pesticides Utilized (litres)',
    placeholder: 'Enter quantity',
    required: false,
    order: 15,
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Quantity of Pesticides Unutilized (litres)',
    placeholder: 'Enter quantity',
    required: false,
    order: 16,
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Number of Beneficiaries',
    placeholder: 'Total number of beneficiaries reached',
    required: true,
    order: 17,
  },
  {
    id: uuid(),
    type: 'section_header',
    label: 'Stakeholders & Observations',
    required: false,
    order: 18,
  },
  {
    id: uuid(),
    type: 'long_text',
    label: 'Stakeholders Engaged',
    placeholder: 'List stakeholders engaged and their roles...',
    required: false,
    order: 19,
  },
  {
    id: uuid(),
    type: 'long_text',
    label: 'Challenges Encountered',
    placeholder: 'Describe any challenges faced during the intervention...',
    required: false,
    order: 20,
  },
  {
    id: uuid(),
    type: 'long_text',
    label: 'Recommendations',
    placeholder: 'Provide your recommendations...',
    required: false,
    order: 21,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Evidence Available (report/photo/data source link)',
    placeholder: 'Paste a link or reference to supporting evidence',
    required: false,
    order: 22,
  },
  {
    id: uuid(),
    type: 'date',
    label: 'Date of Data Collection',
    required: true,
    order: 23,
  },
];

const pestSurveillanceSchema: FormSchema = {
  fields: pestSurveillanceFields,
  settings: {
    show_progress_bar: true,
    allow_edit_after_submit: false,
    confirmation_message: 'Your plant pest surveillance report has been submitted successfully.',
  },
};

// ==========================================================================
// FORM 3: Capacity Building — Extension Officers & Farmers
// ==========================================================================
const capacityBuildingFields: FormField[] = [
  {
    id: uuid(),
    type: 'section_header',
    label: 'Programme & Location',
    description: 'Provide details about the training programme and location.',
    required: false,
    order: 0,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Department',
    placeholder: 'Department of Plant Health and Pest Control',
    required: false,
    order: 1,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Unit',
    placeholder: 'e.g. Extension Services Unit',
    required: false,
    order: 2,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Programme or Project Name',
    placeholder: 'Enter training programme name',
    required: true,
    order: 3,
  },
  {
    id: uuid(),
    type: 'dropdown',
    label: 'State',
    required: true,
    order: 4,
    options: NIGERIAN_STATES,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Local Government Area (LGA)',
    placeholder: 'Enter LGA name',
    required: true,
    order: 5,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Community/Location',
    placeholder: 'Enter community or location name',
    required: true,
    order: 6,
  },
  {
    id: uuid(),
    type: 'dropdown',
    label: 'Reporting Period (Quarter/Year)',
    required: false,
    order: 7,
    options: REPORTING_PERIODS,
  },
  {
    id: uuid(),
    type: 'section_header',
    label: 'Training Details',
    description: 'Provide details about the training delivered.',
    required: false,
    order: 8,
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Type of Training',
    required: false,
    order: 9,
    options: ['Hands-on/Practical', 'Field-based', 'Classroom', 'Other'],
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Type of Crop Farmers',
    placeholder: 'e.g. Maize farmers, Tomato growers',
    required: false,
    order: 10,
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Number of Crop Farmers Trained',
    placeholder: 'Total farmers trained',
    required: true,
    order: 11,
  },
  {
    id: uuid(),
    type: 'multi_choice',
    label: 'Age Range of Farmers',
    required: false,
    order: 12,
    options: ['Under 18', '18–35', '36–50', '51–65', 'Over 65'],
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Number of Male Participants',
    placeholder: 'Enter count',
    required: false,
    order: 13,
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Number of Female Participants',
    placeholder: 'Enter count',
    required: false,
    order: 14,
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Number of Extension Workers Involved',
    placeholder: 'Enter count',
    required: false,
    order: 15,
  },
  {
    id: uuid(),
    type: 'section_header',
    label: 'Observations & Evidence',
    required: false,
    order: 16,
  },
  {
    id: uuid(),
    type: 'long_text',
    label: 'Challenges Encountered',
    placeholder: 'Describe challenges faced during the training...',
    required: false,
    order: 17,
  },
  {
    id: uuid(),
    type: 'long_text',
    label: 'Recommendations',
    placeholder: 'Provide recommendations for improvement...',
    required: false,
    order: 18,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Evidence Available (report/photo/data source link)',
    placeholder: 'Paste a link or reference to supporting evidence',
    required: false,
    order: 19,
  },
  {
    id: uuid(),
    type: 'date',
    label: 'Date of Data Collection',
    required: true,
    order: 20,
  },
];

const capacityBuildingSchema: FormSchema = {
  fields: capacityBuildingFields,
  settings: {
    show_progress_bar: true,
    allow_edit_after_submit: false,
    confirmation_message: 'Your capacity building report has been submitted successfully.',
  },
};

// ==========================================================================
// FORM 4: AMR Surveillance in Plant Health (Sections A–H)
// ==========================================================================

// Stable ID for skip-logic reference
const amrSampleCollectedId = uuid();

const amrSurveillanceFields: FormField[] = [
  // ---- Section A ----
  {
    id: uuid(),
    type: 'section_header',
    label: 'Section A — Farm Information',
    description: 'Provide basic information about the farm being surveyed.',
    required: false,
    order: 0,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Farm ID/Code',
    placeholder: 'e.g. KN-AMR-001',
    required: true,
    order: 1,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Name of Farmer or Farm Manager',
    placeholder: 'Enter full name',
    required: true,
    order: 2,
  },
  {
    id: uuid(),
    type: 'dropdown',
    label: 'State',
    required: true,
    order: 3,
    options: NIGERIAN_STATES,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Local Government Area',
    placeholder: 'Enter LGA name',
    required: true,
    order: 4,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Community',
    placeholder: 'Enter community name',
    required: false,
    order: 5,
  },
  {
    id: uuid(),
    type: 'gps',
    label: 'GPS Location of Farm',
    description: 'Capture GPS coordinates from your device (lat, long).',
    required: false,
    order: 6,
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Farm Size (hectares)',
    placeholder: 'Enter farm size',
    required: false,
    order: 7,
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Type of Farming System',
    required: false,
    order: 8,
    options: ['Monocropping', 'Mixed cropping', 'Irrigated', 'Rain-fed', 'Other'],
  },
  // ---- Section B ----
  {
    id: uuid(),
    type: 'section_header',
    label: 'Section B — Crop Information',
    required: false,
    order: 9,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Crop Type',
    placeholder: 'e.g. Tomato, Maize, Pepper',
    required: true,
    order: 10,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Crop Variety',
    placeholder: 'e.g. Roma VF, SUWAN-1',
    required: false,
    order: 11,
  },
  {
    id: uuid(),
    type: 'date',
    label: 'Planting Date',
    required: false,
    order: 12,
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Cropping System',
    required: false,
    order: 13,
    options: ['Monocropping', 'Intercropping', 'Crop rotation', 'Other'],
  },
  // ---- Section C ----
  {
    id: uuid(),
    type: 'section_header',
    label: 'Section C — Plant Disease Occurrence',
    required: false,
    order: 14,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Name of Disease Observed',
    placeholder: 'e.g. Late Blight, Bacterial wilt',
    required: false,
    order: 15,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Suspected Pathogen',
    placeholder: 'e.g. Phytophthora infestans',
    required: false,
    order: 16,
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Disease Severity',
    required: false,
    order: 17,
    options: ['Low', 'Moderate', 'High', 'Severe'],
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Area Affected (hectares)',
    placeholder: 'Enter affected area',
    required: false,
    order: 18,
  },
  // ---- Section D ----
  {
    id: uuid(),
    type: 'section_header',
    label: 'Section D — Antimicrobial/Chemical Use',
    required: false,
    order: 19,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Product Name Used',
    placeholder: 'e.g. Mancozeb 80% WP',
    required: false,
    order: 20,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Active Ingredient',
    placeholder: 'e.g. Mancozeb',
    required: false,
    order: 21,
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Purpose of Use',
    required: false,
    order: 22,
    options: ['Disease control', 'Pest control', 'Preventive', 'Other'],
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Number of Applications',
    placeholder: 'How many times was the product applied?',
    required: false,
    order: 23,
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Method of Application',
    required: false,
    order: 24,
    options: ['Foliar spray', 'Soil drench', 'Seed treatment', 'Other'],
  },
  // ---- Section E ----
  {
    id: uuid(),
    type: 'section_header',
    label: 'Section E — Source of Agrochemical',
    required: false,
    order: 25,
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Source of Product',
    required: false,
    order: 26,
    options: ['Agro-dealer', 'Government-supplied', 'Cooperative', 'Open market', 'Other'],
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Is Product Registered/Approved?',
    required: false,
    order: 27,
    options: ['Yes', 'No', 'Not sure'],
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Professional Advice Received?',
    required: false,
    order: 28,
    options: ['Yes', 'No'],
  },
  // ---- Section F ----
  {
    id: uuid(),
    type: 'section_header',
    label: 'Section F — AMR Sample Collection',
    required: false,
    order: 29,
  },
  {
    id: amrSampleCollectedId,
    type: 'single_choice',
    label: 'Was a Sample Collected?',
    required: false,
    order: 30,
    options: ['Yes', 'No'],
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Sample Type',
    placeholder: 'e.g. Leaf tissue, Soil, Plant root',
    required: false,
    order: 31,
    logic: {
      show_if: {
        field_id: amrSampleCollectedId,
        operator: 'eq',
        value: 'Yes',
      },
    },
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Laboratory Sample ID',
    placeholder: 'Enter lab-assigned sample ID',
    required: false,
    order: 32,
    logic: {
      show_if: {
        field_id: amrSampleCollectedId,
        operator: 'eq',
        value: 'Yes',
      },
    },
  },
  {
    id: uuid(),
    type: 'file',
    label: 'Photo of Diseased Crop',
    description: 'Upload a clear photo of the affected crop (JPG/PNG, max 5 MB).',
    required: false,
    order: 33,
    validation: { file_types: ['image/jpeg', 'image/png'], max_file_size_mb: 5 },
  },
  // ---- Section G ----
  {
    id: uuid(),
    type: 'section_header',
    label: 'Section G — Farmer Awareness on AMR',
    required: false,
    order: 34,
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Has Farmer Heard of AMR?',
    required: false,
    order: 35,
    options: ['Yes', 'No'],
  },
  {
    id: uuid(),
    type: 'multi_choice',
    label: 'Source of Information on AMR',
    required: false,
    order: 36,
    options: ['Extension officer', 'Radio/TV', 'Fellow farmer', 'Agro-dealer', 'Social media', 'Other'],
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Has Farmer Received Training on Safe Chemical Use?',
    required: false,
    order: 37,
    options: ['Yes', 'No'],
  },
  // ---- Section H ----
  {
    id: uuid(),
    type: 'section_header',
    label: 'Section H — Others',
    required: false,
    order: 38,
  },
  {
    id: uuid(),
    type: 'long_text',
    label: 'Challenges Observed',
    placeholder: 'Describe any challenges or issues observed...',
    required: false,
    order: 39,
  },
  {
    id: uuid(),
    type: 'long_text',
    label: 'Recommendations',
    placeholder: 'Provide recommendations based on your findings...',
    required: false,
    order: 40,
  },
  {
    id: uuid(),
    type: 'date',
    label: 'Date of Data Collection',
    required: true,
    order: 41,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Name of Field Officer',
    placeholder: 'Enter your full name',
    required: true,
    order: 42,
  },
];

const amrSurveillanceSchema: FormSchema = {
  fields: amrSurveillanceFields,
  settings: {
    show_progress_bar: true,
    allow_edit_after_submit: false,
    confirmation_message: 'Your AMR surveillance report has been submitted. Thank you for your contribution to plant health monitoring.',
  },
};

// ==========================================================================
// FORM 5: Input Distribution & Empowerment Programme
// ==========================================================================
const inputDistributionFields: FormField[] = [
  {
    id: uuid(),
    type: 'section_header',
    label: 'Beneficiary Information',
    description: "Provide the beneficiary's personal details.",
    required: false,
    order: 0,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Full Name of Beneficiary',
    placeholder: "Enter beneficiary's full name",
    required: true,
    order: 1,
  },
  {
    id: uuid(),
    type: 'single_choice',
    label: 'Gender',
    required: true,
    order: 2,
    options: ['Male', 'Female'],
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Phone Number',
    placeholder: '08012345678',
    required: true,
    order: 3,
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'LGA & Ward',
    placeholder: 'e.g. Kano Municipal — Ward 3',
    required: true,
    order: 4,
  },
  {
    id: uuid(),
    type: 'number',
    label: 'Farm Size (Ha)',
    placeholder: 'Enter farm size in hectares',
    required: false,
    order: 5,
  },
  {
    id: uuid(),
    type: 'gps',
    label: 'GPS Location of Farm',
    description: 'Capture GPS coordinates from your device (lat, long).',
    required: false,
    order: 6,
  },
  {
    id: uuid(),
    type: 'section_header',
    label: 'Input Received',
    description: 'Record the type and quantity of agricultural inputs distributed.',
    required: false,
    order: 7,
  },
  {
    id: uuid(),
    type: 'multi_choice',
    label: 'Type of Input Received',
    required: false,
    order: 8,
    options: ['Pesticides (Litres)', 'Sprayers (Unit)', 'PPE (Set)', 'Other'],
  },
  {
    id: uuid(),
    type: 'short_text',
    label: 'Quantity of Input Received',
    placeholder: 'e.g. 10 Litres / 2 Sprayers / 3 Sets PPE',
    description: 'Match units to the input type(s) selected above.',
    required: false,
    order: 9,
  },
];

const inputDistributionSchema: FormSchema = {
  fields: inputDistributionFields,
  settings: {
    show_progress_bar: false,
    allow_edit_after_submit: false,
    confirmation_message: 'Input distribution record submitted successfully.',
  },
};

// ==========================================================================
// Demo Forms
// ==========================================================================
export const demoForms: Form[] = [
  {
    id: 'form-001',
    project_id: 'proj-005',
    created_by: EDITOR_ID,
    title: 'Data Collection Officer Registration',
    description: 'Register field data collection officers across all regions.',
    status: 'published',
    current_version: 1,
    public_id: 'dco-registration',
    allow_anonymous: false,
    max_responses: null,
    deadline: null,
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'form-002',
    project_id: 'proj-001',
    created_by: EDITOR_ID,
    title: 'Plant Pest Surveillance Report',
    description: 'Report plant pest observations, crop impact, and intervention details.',
    status: 'published',
    current_version: 1,
    public_id: 'plant-pest-surveillance',
    allow_anonymous: false,
    max_responses: null,
    deadline: null,
    created_at: '2025-01-15T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'form-003',
    project_id: 'proj-002',
    created_by: EDITOR_ID,
    title: 'Capacity Building — Extension Officers & Farmers',
    description: 'Document training sessions for crop farmers and extension workers.',
    status: 'published',
    current_version: 1,
    public_id: 'capacity-building-training',
    allow_anonymous: false,
    max_responses: null,
    deadline: null,
    created_at: '2025-02-01T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'form-004',
    project_id: 'proj-003',
    created_by: EDITOR_ID,
    title: 'AMR Surveillance in Plant Health',
    description: 'Comprehensive farm-level antimicrobial resistance monitoring — Sections A through H.',
    status: 'published',
    current_version: 1,
    public_id: 'amr-surveillance',
    allow_anonymous: false,
    max_responses: null,
    deadline: null,
    created_at: '2025-03-15T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'form-005',
    project_id: 'proj-004',
    created_by: EDITOR_ID,
    title: 'Input Distribution & Empowerment Programme',
    description: 'Beneficiary registration for pesticide, sprayer, and PPE distribution.',
    status: 'published',
    current_version: 1,
    public_id: 'input-distribution',
    allow_anonymous: false,
    max_responses: null,
    deadline: null,
    created_at: '2025-04-01T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
];

// ==========================================================================
// Demo Form Versions
// ==========================================================================
export const demoFormVersions: FormVersion[] = [
  {
    id: 'fv-001',
    form_id: 'form-001',
    version_number: 1,
    schema: officerRegSchema,
    created_by: EDITOR_ID,
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
    is_current: true,
  },
  {
    id: 'fv-002',
    form_id: 'form-002',
    version_number: 1,
    schema: pestSurveillanceSchema,
    created_by: EDITOR_ID,
    created_at: '2025-01-15T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
    is_current: true,
  },
  {
    id: 'fv-003',
    form_id: 'form-003',
    version_number: 1,
    schema: capacityBuildingSchema,
    created_by: EDITOR_ID,
    created_at: '2025-02-01T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
    is_current: true,
  },
  {
    id: 'fv-004',
    form_id: 'form-004',
    version_number: 1,
    schema: amrSurveillanceSchema,
    created_by: EDITOR_ID,
    created_at: '2025-03-15T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
    is_current: true,
  },
  {
    id: 'fv-005',
    form_id: 'form-005',
    version_number: 1,
    schema: inputDistributionSchema,
    created_by: EDITOR_ID,
    created_at: '2025-04-01T08:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
    is_current: true,
  },
];

// ==========================================================================
// Demo Responses — realistic plant-health field data
// ==========================================================================
const fieldOfficerNames = [
  'Abdullahi Musa', 'Chidinma Eze', 'Fatima Aliyu', 'Emeka Okonkwo',
  'Bola Adeyemi', 'Hauwa Sule', 'Taiwo Olawale', 'Ngozi Nwosu',
];

const editorNotes = [
  'Field data verified against hard-copy report.',
  'GPS coordinates cross-checked with satellite imagery.',
  'Beneficiary count updated after field verification.',
  'Pesticide quantity appears high — flagged for review.',
  null,
  null,
];

const STATES_SAMPLE = ['Kano', 'Oyo', 'Rivers', 'Kaduna', 'Enugu', 'Borno', 'Delta', 'Plateau'];
const CROPS = ['Maize', 'Tomato', 'Cassava', 'Cowpea', 'Pepper', 'Sorghum', 'Rice', 'Yam'];
const PESTS = ['Fall Armyworm', 'Cassava Mosaic Virus', 'Tuta absoluta', 'Bacterial wilt', 'Aphids', 'Root-knot nematode'];
const PESTICIDES = ['Cypermethrin 10% EC', 'Mancozeb 80% WP', 'Imidacloprid 200 SL', 'Lambda-cyhalothrin'];
const INTERVENTIONS = ['Chemical spraying', 'Biological control', 'Manual removal', 'Quarantine'];
const PERIODS = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateResponses(formVersionId: string, formId: string, count: number): FormResponse[] {
  const activeFields = pestSurveillanceFields.filter((f) => f.type !== 'section_header');

  return Array.from({ length: count }, (_, i) => {
    const answersObj: Record<string, unknown> = {};

    activeFields.forEach((field) => {
      switch (field.type) {
        case 'short_text':
          if (field.label.includes('Department')) answersObj[field.id] = 'Department of Plant Health and Pest Control';
          else if (field.label.includes('Programme')) answersObj[field.id] = 'National Crop Protection Programme';
          else if (field.label.includes('Community')) answersObj[field.id] = pick(['Dangi', 'Oyo East', 'Ikono', 'Gombe Central', 'Awka North']);
          else if (field.label.includes('LGA')) answersObj[field.id] = pick(['Kano Municipal', 'Ibadan North', 'Calabar South', 'Jos North', 'Enugu North']);
          else if (field.label.includes('Pest')) answersObj[field.id] = pick(PESTS);
          else if (field.label.includes('Crop') && field.label.includes('Name')) answersObj[field.id] = pick(CROPS);
          else if (field.label.includes('Pesticide') && field.label.includes('Name')) answersObj[field.id] = pick(PESTICIDES);
          else if (field.label.includes('Evidence')) answersObj[field.id] = `https://dphpc.gov.ng/evidence/${i + 1}`;
          else if (field.label.includes('Unit')) answersObj[field.id] = 'Pest Surveillance Unit';
          else answersObj[field.id] = 'N/A';
          break;

        case 'dropdown':
          if (field.label.includes('State')) answersObj[field.id] = pick(STATES_SAMPLE);
          else if (field.label.includes('Period')) answersObj[field.id] = pick(PERIODS);
          else answersObj[field.id] = field.options?.[0] ?? '';
          break;

        case 'number':
          if (field.label.includes('Beneficiar')) answersObj[field.id] = 20 + Math.floor(Math.random() * 200);
          else if (field.label.includes('Affected')) answersObj[field.id] = parseFloat((1 + Math.random() * 10).toFixed(1));
          else if (field.label.includes('Utilized') && !field.label.includes('Un')) answersObj[field.id] = parseFloat((5 + Math.random() * 45).toFixed(1));
          else if (field.label.includes('Unutilized')) answersObj[field.id] = parseFloat((1 + Math.random() * 10).toFixed(1));
          else answersObj[field.id] = Math.floor(Math.random() * 50);
          break;

        case 'multi_choice':
          answersObj[field.id] = [pick(INTERVENTIONS)];
          break;

        case 'long_text':
          if (field.label.includes('Stakeholders')) {
            answersObj[field.id] = 'State Ministry of Agriculture, Local farmers\' cooperatives, NASC representatives.';
          } else if (field.label.includes('Challenges')) {
            answersObj[field.id] = pick([
              'Inadequate PPE for field officers.',
              'Poor road access to affected communities.',
              'Farmers reluctant to adopt recommended interventions.',
              'Delayed release of pesticides from state stores.',
            ]);
          } else {
            answersObj[field.id] = pick([
              'Increase frequency of surveillance visits.',
              'Provide more PPE to field officers.',
              'Conduct more awareness campaigns for farmers.',
            ]);
          }
          break;

        case 'date':
          answersObj[field.id] = new Date(2025, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 27))
            .toISOString().split('T')[0];
          break;
      }
    });

    const submittedDate = new Date(2025, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 27));
    submittedDate.setHours(7 + Math.floor(Math.random() * 12));
    submittedDate.setMinutes(Math.floor(Math.random() * 60));

    const rand = Math.random();
    let approvalStatus: ApprovalStatus;
    if (rand < 0.55) approvalStatus = 'approved';
    else if (rand < 0.82) approvalStatus = 'pending';
    else approvalStatus = 'rejected';

    const isApprovedOrRejected = approvalStatus !== 'pending';
    const approvedDate = new Date(submittedDate);
    approvedDate.setDate(approvedDate.getDate() + 1 + Math.floor(Math.random() * 4));

    return {
      id: `resp-${i.toString().padStart(4, '0')}`,
      form_id: formId,
      version_id: formVersionId,
      form_version_id: formVersionId,
      form_share_id: null,
      respondent_id: OFFICER_ID,
      respondent_identifier: null,
      answers: answersObj,
      metadata: {
        device: Math.random() > 0.55 ? 'mobile' : 'desktop',
        browser: pick(['Chrome', 'Firefox', 'Safari', 'Edge']),
        offline_submitted: Math.random() > 0.8,
        time_to_complete_seconds: 180 + Math.floor(Math.random() * 600),
      },
      submitted_at: submittedDate.toISOString(),
      is_complete: Math.random() > 0.08,
      gps_lat: 4.5 + Math.random() * 10,
      gps_lng: 3.0 + Math.random() * 12,
      device_info: null,
      approval_status: approvalStatus,
      approved_by: isApprovedOrRejected ? EDITOR_ID : null,
      approved_at: isApprovedOrRejected ? approvedDate.toISOString() : null,
      editor_notes: isApprovedOrRejected
        ? editorNotes[Math.floor(Math.random() * editorNotes.length)]
        : null,
      submitted_by_name: fieldOfficerNames[i % fieldOfficerNames.length],
    };
  });
}

export const demoResponses = generateResponses('fv-002', 'form-002', 142);

// ==========================================================================
// Service Functions (Mock — same interface as Supabase-connected version)
// ==========================================================================
export async function fetchProjects(_orgId: string): Promise<Project[]> {
  await new Promise((r) => setTimeout(r, 300));
  return demoProjects;
}

export async function fetchForms(projectId?: string): Promise<Form[]> {
  await new Promise((r) => setTimeout(r, 300));
  if (projectId) {
    return demoForms.filter((f) => f.project_id === projectId);
  }
  return demoForms;
}

export async function fetchForm(formId: string): Promise<Form | null> {
  await new Promise((r) => setTimeout(r, 200));
  return demoForms.find((f) => f.id === formId) || null;
}

export async function fetchFormVersion(formId: string): Promise<FormVersion | null> {
  await new Promise((r) => setTimeout(r, 200));
  return demoFormVersions.find((fv) => fv.form_id === formId && fv.is_current) || null;
}

export async function fetchResponses(formVersionId: string): Promise<FormResponse[]> {
  await new Promise((r) => setTimeout(r, 400));
  return demoResponses.filter((r) => r.form_version_id === formVersionId);
}

export async function fetchResponseCount(formId: string): Promise<number> {
  await new Promise((r) => setTimeout(r, 100));
  const form = demoForms.find((f) => f.id === formId);
  if (!form) return 0;
  const version = demoFormVersions.find((fv) => fv.form_id === formId && fv.is_current);
  if (!version) return 0;
  return demoResponses.filter((r) => r.form_version_id === version.id).length;
}

/** Fetch responses by approval status */
export async function fetchResponsesByStatus(status: ApprovalStatus): Promise<FormResponse[]> {
  await new Promise((r) => setTimeout(r, 300));
  return demoResponses.filter((r) => r.approval_status === status);
}

/** Fetch responses submitted by a specific user */
export async function fetchMySubmissions(userId: string): Promise<FormResponse[]> {
  await new Promise((r) => setTimeout(r, 300));
  return demoResponses.filter((r) => r.respondent_id === userId);
}

/** Update response approval status (editor action) */
export async function updateResponseApproval(
  responseId: string,
  status: ApprovalStatus,
  editorId: string,
  notes?: string
): Promise<FormResponse | null> {
  await new Promise((r) => setTimeout(r, 200));
  const response = demoResponses.find((r) => r.id === responseId);
  if (!response) return null;
  response.approval_status = status;
  response.approved_by = editorId;
  response.approved_at = new Date().toISOString();
  if (notes !== undefined) response.editor_notes = notes;
  return { ...response };
}

