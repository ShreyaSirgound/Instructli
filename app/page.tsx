import { Binary, Cpu, MonitorCogIcon, Rows2, AlertTriangle, Database } from "lucide-react"

const modules = [
  {
    id: 1,
    title: "Binary arithmetic",
    description: "Addition, overflow, two's complement",
    progress: 80,
    href: "/modules/binary-arithmetic",
    icon: <Binary size={22} />,
    iconBg: "#E6F1FB",
    barColor: "#195FA5",
  },
  {
    id: 2,
    title: "Single cycle",
    description: "Datapath, control signals",
    progress: 55,
    icon: <Cpu size={22} />,
    iconBg: "#E9F2DD",
    barColor: "#3F681B",
  },
  {
    id: 3,
    title: "5-stage pipeline",
    description: "IF, ID, EX, MEM, WB",
    progress: 40,
    icon: <Rows2 size={22} />,
    iconBg: "#EDECFD",
    barColor: "#4F4898",
  },
  {
    id: 4,
    title: "Machine Instructions",
    description: "Instruction types, opcodes",
    progress: 20,
    icon: <MonitorCogIcon size={22} />,
    iconBg: "#fef9e0",
    barColor: "#f9ab00",
  },
  {
    id: 5,
    title: "Hazards and Detection",
    description: "RAW, WAR, WAW, structural",
    progress: 20,
    icon: <AlertTriangle size={22} />,
    iconBg: "#FAEEDC",
    barColor: "#b6761d",
  },
  {
    id: 6,
    title: "Caching",
    description: "Direct-mapped, set associative",
    progress: 10,
    icon: <Database size={22} />,
    iconBg: "#FBECE6",
    barColor: "#b15636",
  },
];

function ModuleCard({ mod }: { mod: (typeof modules)[0] }) {
  return (
    <a
      href={mod.href ?? `/modules/${mod.id}`}
      className="group block bg-white border border-gray-200 rounded-2xl p-6 min-w-74 hover:shadow-md hover:border-gray-300 transition-all duration-200"
    >
      {/* Icon */}
      <div
        style={{ backgroundColor: mod.iconBg, color: mod.barColor }}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
      >
        {mod.icon}
      </div>

      {/* Title & description */}
      <h3 className="text-lg font-semibold text-gray-900">
        {mod.title}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{mod.description}</p>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
        <div
          style={{ width: `${mod.progress}%`, backgroundColor: mod.barColor }}
          className="h-1.5 rounded-full transition-all duration-500"
        />
      </div>

      <p className="text-sm text-gray-400 mt-2">{mod.progress}% complete</p>
    </a>
  );
}

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
          {modules.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} />
          ))}
        </div>
      </div>
    </main>
  );
}