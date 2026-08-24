"use client";

import React, { useEffect, useState } from "react";

interface PipeLineTerminalProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  onExecute: (index: number) => void;
  onBackward: (currCycle: number) => void;
  onReset: () => void;
  currCycle: number;
  onPresetChange: (preset: {index: number, note: string} | null) => void;
}

// Define interface for preset objects
interface Preset {
  index: number;
  label: string;
  code: string;
  note: string;
  highlight?: { [key: number]: number[] };
}

export default function Terminal({
  code,
  onCodeChange,
  onExecute,
  onBackward,
  onReset,
  currCycle,
  onPresetChange,
}: PipeLineTerminalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = useState(3);

  // Presets with detailed explanations
  const presets: Preset[] = [
    {
      index: 0,
      label: "Data Hazard Example",
      code: `add x28, x29, x31
             sub x5, x28, x6`,
      note: "DATA HAZARD: Suppose that there is no forwarding unit only hazard detection. Instruction 2 depends on x28 from the result of instruction 1 which is only available after WB stage. A bubble is inserted to stall the processor and resolve the data hazard. Initial: x28=0, x29=5, x31=1, x6=4. Final: x28=6, x5=2",
      highlight: {
        0: [0],
        1: [0, 1],
        2: [0, 1, 2],
        3: [0, 1, 2],
        4: [0, 1, 2],
        5: [1, 2],
        6: [2],
      },
    },
    {
      index: 1,
      label: "Control Hazard Example",
      code: `add x30, x31, x5
             beq x1, x0, 40
             addi x28, x0, 10`,
      note: `Control Hazard: Suppose that there is no forwarding unit only hazard detection. Result of branch is not available until the EX stage. If the branch is taken, as assumed in this case, a hazard will occur. A bubble is inserted to flush a stage of the pipeline and handle the control hazard.`,
      highlight: {
        0: [0],
        1: [0, 1],
        2: [0, 1, 2],
        3: [0, 1, 2, 3],
        4: [0,4],
        5: [4],
        6: [4],
        7: [4],
        8: []
      },
    },
    {
      index: 3,
      label: "No Hazards",
      code: `add x28, x29, x31
             li x29, 10
             addi x28, x5, 10`,
      note: "NO HAZARDS: Each instruction uses different registers or has sufficient separation. Initial: x29=5, x31=3, x5=7. Final: x28=17 (last instruction overwrites), x29=10. Pipeline runs smoothly without stalls.",
      highlight: {
        0: [0],
        1: [0, 1],
        2: [0, 1, 2],
        3: [0, 1, 2],
        4: [0, 1, 2],
        5: [1, 2],
        6: [2],
        7: []
      },
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted) {
      const defaultPreset = presets.find((p) => p.label === "No Hazards");
      if (defaultPreset) {
        handlePresetChange({
          target: { value: "No Hazards" }
        } as React.ChangeEvent<HTMLSelectElement>);
      }
    }
    // Only run once after mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) return null;

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPreset = presets.find((p) => p.label === e.target.value);
    if (selectedPreset) {
      setSelectedPreset(selectedPreset.index);
      onCodeChange(selectedPreset.code);
      onReset();
      onPresetChange({index: selectedPreset.index, note: selectedPreset.note});
    }
  };

  const getCurrentPreset = () => {
    return presets.find((p) => p.index === selectedPreset);
  };

  // Split code into lines for individual rendering
  const codeLines = code
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Get the highlight indices for the current cycle
  const currentPreset = getCurrentPreset();
  const highlightIndices = currentPreset?.highlight?.[currCycle] || [];

  return (
    <div className="w-full mx-auto flex flex-col">
      <div className="flex-none bg-white pb-3 pt-2">
        {/* Top bar */}
        <div className="flex justify-between items-center px-6 py-2 text-sm">
          {/* Preset selector */}
          <select
            className="border border-gray-300 bg-gray-50 text-gray-900 text-sm p-1 rounded focus:outline-none"
            onChange={handlePresetChange}
            defaultValue="No Hazards"
          >
            <option value="" disabled>
              Select a preset...
            </option>
            {presets.map((preset) => (
              <option key={preset.label} value={preset.label}>
                {preset.label}
              </option>
            ))}
          </select>

          {/* Buttons */}
          <div className="flex space-x-2 text-blue-600">
            <button
              onClick={onReset}
              className="hover:underline cursor-pointer"
            >
              Reset
            </button>
            <span>|</span>
            <button
              onClick={() => onBackward(currCycle)}
              className={`hover:underline cursor-pointer ${
                selectedPreset === -1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={selectedPreset === -1}
            >
              Backward
            </button>
            <span>|</span>
            <button
              onClick={() => onExecute(selectedPreset)}
              className={`hover:underline cursor-pointer ${
                selectedPreset === -1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={selectedPreset === -1}
            >
              Next
            </button>
          </div>
        </div>

        {/* Code lines */}
        <div className="flex-1 bg-white px-6 overflow-auto relative max-h-32">
          <div className="border border-gray-300 rounded bg-gray-50">
            <div
              className="my-2 mx-2 mb-2 text-sm font-mono text-opacity-80 overflow-auto whitespace-pre"
              style={{
                lineHeight: "1.5",
                tabSize: 2,
              }}
            >
              {codeLines.length > 0 ? (
                codeLines.map((line, index) => {
                  let bgClass = "";
                  let textClass = "text-gray-900";
                  return (
                    <span
                      key={index}
                      className={`block px-2 ${bgClass} ${textClass}`}
                    >
                      {line}
                    </span>
                  );
                })
              ) : (
                <span className="block px-2 text-gray-500 font-medium">
                  Select a Preset value
                </span>
              )}
    
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}