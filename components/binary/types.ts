export type TabId = 'interpreting' | 'representation-formats' | 'addition-subtraction' | 'overflow-saturating';

export interface Tab {
  id: TabId;
  label: string;
}

export const TABS: Tab[] = [
  { id: 'interpreting',            label: '1. Interpreting Numbers' },
  { id: 'representation-formats',  label: '2. Representation Formats' },
  { id: 'addition-subtraction',    label: '3. Addition & Subtraction' },
  { id: 'overflow-saturating',     label: '4. Overflow & Saturating' },
];

export const colors = {
  blue:   { light: '#E6F1FB', dark: '#195FA5' },
  green:  { light: '#E9F2DD', dark: '#3F681B' },
  purple: { light: '#EDECFD', dark: '#4F4898' },
  yellow: { light: '#FEF9E0', dark: '#B6761D' },
  red:    { light: '#FBECE6', dark: '#B15636' },
};