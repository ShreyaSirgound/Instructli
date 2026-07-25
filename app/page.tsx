'use client';

import { useEffect } from 'react';
import { Binary, Cpu, MonitorCogIcon, Rows2, AlertTriangle, Database } from "lucide-react"
import ModuleCard from '@/components/ModuleCard'
import { binaryArithmeticConfig, cachingConfig, hazardsConfig, machineInstructionsConfig, pipelineConfig, singleCycleConfig } from './moduleConfigs';
import { recordAnalyticsVisit } from '../src/utils/analytics';

export default function Dashboard() {
  useEffect(() => {
    recordAnalyticsVisit('app');
  }, []);
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Welcome back, Jane</h1>
          <p className="text-gray-500 mt-2">This app provides short interactive modules to help you practice and develop a deeper understanding of CSC258 concepts. It is not intended to teach new material. Use it to reinforce and explore the topics you are expected to know after lectures.</p>
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
            moduleKey="binary-arithmetic"
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
            moduleKey="single-cycle"
          />

          <ModuleCard
            title="5-Stage Pipeline"
            description="IF, ID, EX, MEM, WB"
            href="/modules/pipeline"
            icon={<Rows2 size={22} />}
            iconBg="#EDECFD"
            barColor="#4F4898"
            progressConfig={pipelineConfig}
            moduleKey="pipeline"
          />

          <ModuleCard
            title="Machine Instructions"
            description="Instruction types, opcodes"
            href="/modules/machine-instructions"
            icon={<MonitorCogIcon size={22} />}
            iconBg="#FEf9E0"
            barColor="#F9AB00"
            progressConfig={machineInstructionsConfig}
            moduleKey="machine-instructions"
          />

          <ModuleCard
            title="Hazards and Detection"
            description="Data, control, structural"
            href="/modules/hazards"
            icon={<AlertTriangle size={22} />}
            iconBg="#FAEEDC"
            barColor="#b6761d"
            progressConfig={hazardsConfig}
            moduleKey="hazards"
          />

          <ModuleCard
            title="Caching"
            description="Direct-mapped, set associative"
            href="/modules/caching"
            icon={<Database size={22} />}
            iconBg="#FBECE6"
            barColor="#b15636"
            progressConfig={cachingConfig}
            moduleKey="caching"
          />
        </div>
      </div>
    </main>
  );
}