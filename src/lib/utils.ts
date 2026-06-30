/**
 * Utility Functions
 */

import type { UserRole } from '@/types';

/** Role hierarchy levels for permission comparisons */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  field_officer: 1,
  editor: 2,
  admin: 3,
  superadmin: 4,
};

/** Check if a role meets the minimum required level */
export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a date string to a human-readable format */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

/** Format a date to relative time (e.g., "2 hours ago") */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d);
}

/** Truncate text to a maximum length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

/** Capitalise first letter */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Format a role enum to display string */
export function formatRole(role: string): string {
  const roleDisplayNames: Record<string, string> = {
    field_officer: 'Field Officer',
    editor: 'Data Editor',
    admin: 'Admin',
    superadmin: 'Super Admin',
    team_lead: 'Team Lead', // Legacy fallback
  };
  return roleDisplayNames[role] || role.split('_').map(capitalize).join(' ');
}

/** Get initials from a name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Generate a random hex color */
export function randomColor(): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#2563eb',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/** Sleep utility for async operations */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Format a number with compact notation */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  return (num / 1000000).toFixed(1) + 'M';
}

/** Calculate percentage */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
