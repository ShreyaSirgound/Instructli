import type { ReactNode } from 'react'
import { Binary, Cpu, MonitorCogIcon, Rows2, AlertTriangle, Database } from "lucide-react"
import ModuleCard from '@/components/ModuleCard'
import { ProgressConfig} from './progressConfig';
import { binaryArithmeticConfig, cachingConfig, hazardsConfig, machineInstructionsConfig, pipelineConfig, singleCycleConfig } from './moduleConfigs';

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
            title="Binary Arithmetic"
            description="Addition, overflow, two's complement"
            href="/modules/binary-arithmetic"
            icon={<Binary size={22} />}
            iconBg="#E6F1FB"
            barColor="#195FA5"
            progressConfig={binaryArithmeticConfig}
          />

          <ModuleCard
            title="Single Cycle"
            description="Datapath, control signals"
            href="/modules/single-cycle"
            icon={<Cpu size={22} />}
            iconBg="#E9F2DD"
            barColor="#3F681B"
            progressConfig={singleCycleConfig}
            scrollKey="singleCycleScrollProgress"
          />

          <ModuleCard
            title="5-Stage Pipeline"
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