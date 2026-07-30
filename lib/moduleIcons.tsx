import { Binary, Cpu, Rows2, MonitorCog, AlertTriangle, Database, LucideIcon } from 'lucide-react';

export const MODULE_ICONS: Record<string, LucideIcon> = {
  binary: Binary,
  cpu: Cpu,
  rows: Rows2,
  'monitor-cog': MonitorCog,
  'alert-triangle': AlertTriangle,
  database: Database,
};

export function getModuleIcon(iconKey: string): LucideIcon {
  return MODULE_ICONS[iconKey] ?? Binary;
}
