export type TabId = 'number-systems' | 'signed-integers' | 'addition-overflow' | 'precision';

export interface Tab {
  id: TabId;
  label: string;
}

export const TABS: Tab[] = [
  { id: 'number-systems',    label: '1. Number Systems' },
  { id: 'signed-integers',   label: '2. Signed Integers' },
  { id: 'addition-overflow', label: '3. Addition & Overflow' },
  { id: 'precision',         label: '4. Precision & Representation' },
];

export const colors = {
  blue:   { light: '#E6F1FB', dark: '#195FA5' },
  green:  { light: '#E9F2DD', dark: '#3F681B' },
  purple: { light: '#EDECFD', dark: '#4F4898' },
  yellow: { light: '#FEF9E0', dark: '#B6761D' },
  red:    { light: '#FBECE6', dark: '#B15636' },
};