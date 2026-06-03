"use client";

import { useEffect, useState } from "react";

interface TerminalProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  onExecute: (selectedInstruction: string, selectedCategory: string) => void;
  onReset: () => void;
}

const PRESET_INSTRUCTIONS: Record<string, string[]> = {
  "R-Type": ["add x28, x6, x7", "sub x28, x6, x7"],
  "I-Type": ["addi x7, x6, 5", "lw x6, 4(x9)"],
  "B-Type": ["beq x28, x27, 8", "bne x28, x27, 8"],
  "S-Type": ["sw x9, 4(x18)"]
};

export default function Terminal({
  code,
  onCodeChange,
  onExecute,
  onReset,
}: TerminalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("R-Type");
  const [selectedInstruction, setSelectedInstruction] = useState<string>(
    PRESET_INSTRUCTIONS["R-Type"][0]
  );
  const [highlight, sethighlight] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Update code in parent when instruction changes
    onCodeChange(selectedInstruction);
    sethighlight(false);
  }, [selectedInstruction, onCodeChange]);

  if (!mounted) return null;

  // Split code into lines for highlighting
  const lines = code.split("\n").map((line) => line || " "); // Ensure empty lines are rendered

  return (
    <div className="w-full mx-auto flex flex-col h-[110px]">
      <div className="flex-none bg-white pb-3 pt-2">
        {/* Combined top bar with dropdowns and buttons on same line */}
        <div className="flex justify-between items-center px-6 py-2">
          {/* Dropdowns on the left */}
          <div className="flex space-x-4">
            <select
              className="border border-gray-300 bg-gray-50 text-gray-900 text-sm p-1 rounded focus:outline-none"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedInstruction(PRESET_INSTRUCTIONS[e.target.value][0]);
                // console.log("[Terminal Debug] Category changed:", e.target.value);
              }}
            >
              {Object.keys(PRESET_INSTRUCTIONS).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-300 bg-gray-50 text-gray-900 text-sm p-1 rounded focus:outline-none"
              value={selectedInstruction}
              onChange={(e) => {
                setSelectedInstruction(e.target.value);
                // console.log("[Terminal Debug] Instruction changed:", e.target.value);
              }}
            >
              {PRESET_INSTRUCTIONS[selectedCategory].map((instruction) => (
                <option key={instruction} value={instruction}>
                  {instruction}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons on the right */}
          <div className="flex space-x-2 text-sm text-blue-600">
            <button
              onClick={() => {
                onReset();
                sethighlight(false);
              }}
              className="hover:underline cursor-pointer"
            >
              Reset
            </button>
            <span>|</span>
            <button
              onClick={() => {
                // console.log("[Terminal Debug] Execute clicked");
                onExecute(selectedInstruction, selectedCategory);
                sethighlight(true);
              }}
              className="hover:underline cursor-pointer"
            >
              Execute Command
            </button>
          </div>
        </div>

        {/* Terminal box */}
        <div className="flex-1 bg-white px-6 overflow-auto relative">
          <div className="border border-gray-300 rounded bg-gray-50">
            <div
              className="mx-2 mb-2 text-sm font-mono text-opacity-80 overflow-auto whitespace-pre"
              style={{
                lineHeight: "1.5",
                tabSize: 2,
              }}
            >
              {lines.map((line, index) => {
                let bgClass = "";
                let textClass = "text-gray-900";

                if (index === 0 && highlight) {
                  bgClass = "bg-gray-200";
                  textClass = "text-gray-900 font-semibold";
                }

                return (
                  <span
                    key={index}
                    className={`block ${bgClass} ${textClass}`}
                  >
                    {line}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}