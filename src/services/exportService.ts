/**
 * Export Service — CSV & Excel data export
 * --------------------------
 * Client-side export for demo mode.
 * In production, heavy exports should use Edge Functions.
 */

import type { FormField, Response } from '@/types';

/**
 * Export responses as CSV
 */
export function exportToCSV(
  fields: FormField[],
  responses: Response[],
  filename: string = 'responses'
): void {
  const dataFields = fields.filter((f) => f.type !== 'section_header');

  // Header row
  const headers = [
    '#',
    ...dataFields.map((f) => f.label),
    'Status',
    'Submitted At',
    'Device',
    'Time (s)',
  ];

  // Data rows
  const rows = responses.map((resp, i) => {
    const row: string[] = [String(i + 1)];

    dataFields.forEach((field) => {
      const answer = (resp.answers as Record<string, unknown>)[field.id];
      if (answer === undefined || answer === null) {
        row.push('');
      } else if (Array.isArray(answer)) {
        row.push(answer.join('; '));
      } else if (typeof answer === 'object') {
        const gps = answer as { lat?: number; lng?: number };
        row.push(gps.lat && gps.lng ? `${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}` : JSON.stringify(answer));
      } else {
        row.push(String(answer));
      }
    });

    row.push(resp.is_complete ? 'Complete' : 'Partial');
    row.push(new Date(resp.submitted_at).toLocaleString());
    row.push(resp.metadata?.device as string || '');
    row.push(String(resp.metadata?.time_to_complete_seconds || ''));

    return row;
  });

  // Build CSV content
  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(','))
    .join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export responses as Excel-compatible TSV (opens directly in Excel)
 */
export function exportToExcel(
  fields: FormField[],
  responses: Response[],
  filename: string = 'responses'
): void {
  const dataFields = fields.filter((f) => f.type !== 'section_header');

  const headers = [
    '#',
    ...dataFields.map((f) => f.label),
    'Status',
    'Submitted At',
    'Device',
    'Time (s)',
  ];

  const rows = responses.map((resp, i) => {
    const row: string[] = [String(i + 1)];

    dataFields.forEach((field) => {
      const answer = (resp.answers as Record<string, unknown>)[field.id];
      if (answer === undefined || answer === null) {
        row.push('');
      } else if (Array.isArray(answer)) {
        row.push(answer.join('; '));
      } else if (typeof answer === 'object') {
        const gps = answer as { lat?: number; lng?: number };
        row.push(gps.lat && gps.lng ? `${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}` : JSON.stringify(answer));
      } else {
        row.push(String(answer));
      }
    });

    row.push(resp.is_complete ? 'Complete' : 'Partial');
    row.push(new Date(resp.submitted_at).toLocaleString());
    row.push(resp.metadata?.device as string || '');
    row.push(String(resp.metadata?.time_to_complete_seconds || ''));

    return row;
  });

  // Build TSV with BOM for Excel compatibility
  const BOM = '\uFEFF';
  const tsvContent = BOM + [headers, ...rows]
    .map((row) => row.map(escapeTSV).join('\t'))
    .join('\n');

  downloadFile(tsvContent, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
}

/**
 * Export analytics summary as CSV
 */
export function exportAnalyticsSummary(
  formTitle: string,
  analytics: {
    totalResponses: number;
    completedResponses: number;
    completionRate: number;
    avgTime: number;
    fieldAnalytics: Array<{
      field: FormField;
      type: string;
      data: Array<{ name: string; value: number }>;
    }>;
  }
): void {
  const lines: string[] = [
    `Form,${escapeCSV(formTitle)}`,
    `Total Responses,${analytics.totalResponses}`,
    `Completed,${analytics.completedResponses}`,
    `Completion Rate,${analytics.completionRate}%`,
    `Average Time,${Math.floor(analytics.avgTime / 60)}m ${analytics.avgTime % 60}s`,
    '',
    '--- Per-Field Breakdown ---',
    '',
  ];

  analytics.fieldAnalytics.forEach((fa) => {
    lines.push(`Field: ${escapeCSV(fa.field.label)}`);
    if (fa.type === 'pie' || fa.type === 'bar') {
      lines.push('Option,Count');
      (fa.data as Array<{ name: string; value: number }>).forEach((d) => {
        lines.push(`${escapeCSV(String(d.name))},${d.value}`);
      });
    }
    lines.push('');
  });

  downloadFile(lines.join('\n'), `${formTitle.replace(/[^a-zA-Z0-9]/g, '_')}_analytics.csv`, 'text/csv;charset=utf-8;');
}

// ---- Helpers ----

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function escapeTSV(value: string): string {
  return value.replace(/\t/g, ' ').replace(/\n/g, ' ');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
