import type { ReactNode } from 'react'
import { Binary, Cpu, MonitorCogIcon, Rows2, AlertTriangle, Database } from "lucide-react"
import ModuleCard from '@/components/ModuleCard'
import { ProgressConfig} from './progressConfig';

export const binaryArithmeticConfig: ProgressConfig = {
  storageKey: 'binaryArithmeticProgress',
  sectionIds: ['interpreting', 'representation-formats', 'addition-subtraction', 'overflow-saturating'],
  eventName: 'binary-arithmetic-progress-updated',
  legacyKeyMap: {
    'interpreting': 'number-systems',
    'representation-formats': 'signed-integers',
    'addition-subtraction': 'addition-overflow',
    'overflow-saturating': 'precision',
  },
};

export const singleCycleConfig: ProgressConfig = {
  storageKey: 'singleCycleProgress',
  sectionIds: [],
  eventName: 'single-cycle-progress-updated',
  legacyKeyMap: {},
};

export const pipelineConfig: ProgressConfig = {
  storageKey: 'pipelineProgress',
  sectionIds: [],
  eventName: 'pipeline-progress-updated',
  legacyKeyMap: {},
};

export const machineInstructionsConfig: ProgressConfig = {
  storageKey: 'machineInstructionsProgress',
  sectionIds: [],
  eventName: 'machine-instructions-progress-updated',
  legacyKeyMap: {},
};

export const hazardsConfig: ProgressConfig = {
  storageKey: 'hazardsProgress',
  sectionIds: [],
  eventName: 'hazards-progress-updated',
  legacyKeyMap: {},
};

export const cachingConfig: ProgressConfig = {
  storageKey: 'cachingProgress',
  sectionIds: [],
  eventName: 'caching-progress-updated',
  legacyKeyMap: {},
};

type ModuleItem = {
  id: number;
  title: string;
  description: string;
  progress: number;
  icon: ReactNode;
  iconBg: string;
  barColor: string;
  href?: string;
};

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Welcome back Jane</h1>
          <p className="text-gray-500 mt-2">Choose a module to continue working on</p>
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ModuleCard
            title="Binary arithmetic"
            description="Addition, overflow, two's complement"
            href="/modules/binary-arithmetic"
            icon={<Binary size={22} />}
            iconBg="#E6F1FB"
            barColor="#195FA5"
            progressConfig={binaryArithmeticConfig}
          />

          <ModuleCard
            title="Single cycle"
            description="Datapath, control signals"
            href="/modules/single-cycle"
            icon={<Cpu size={22} />}
            iconBg="#E9F2DD"
            barColor="#3F681B"
            progressConfig={singleCycleConfig}
          />

          <ModuleCard
            title="5-stage pipeline"
            description="IF, ID, EX, MEM, WB"
            href="/modules/pipeline"
            icon=<Rows2 size={22} />
            iconBg="#EDECFD"
            barColor="#4F4898"
            progressConfig={pipelineConfig}
          />

          <ModuleCard
            title="Machine Instructions"
            description="Instruction types, opcodes"
            href="/modules/machine-instructions"
            icon=<MonitorCogIcon size={22} />
            iconBg="#FEf9E0"
            barColor="#F9AB00"
            progressConfig={machineInstructionsConfig}
          />

          <ModuleCard
            title="Hazards and Detection"
            description="RAW, WAR, WAW, structural"
            href="/modules/hazards"
            icon=<AlertTriangle size={22} />
            iconBg="#FAEEDC"
            barColor="#b6761d"
            progressConfig={hazardsConfig}
          />

          <ModuleCard
            title="Caching"
            description="Direct-mapped, set associative"
            href="/modules/caching"
            icon=<Database size={22} />
            iconBg="#FBECE6"
            barColor="#b15636"
            progressConfig={cachingConfig}
          />
        </div>
      </div>
    </main>
  );
}