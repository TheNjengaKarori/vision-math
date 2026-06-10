import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Minus,
  Square,
  Copy,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Delete,
} from "lucide-react";
import { evaluate } from "mathjs";

interface FloatingCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (value: string) => void;
  speakText: (text: string) => void;
}

export function FloatingCalculator({
  isOpen,
  onClose,
  onInsert,
  speakText,
}: FloatingCalculatorProps) {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<"DEG" | "RAD">("DEG");
  const [cursorPos, setCursorPos] = useState(0);
  const [viewMode, setViewMode] = useState<"standard" | "scientific">(
    "standard",
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      speakText(
        "Advanced Scientific Calculator opened. Focus is on the input screen.",
      );
      setTimeout(() => screenRef.current?.focus(), 100);
    }
  }, [isOpen, speakText]);

  if (!isOpen) return null;

  const insertText = (str: string, speak: string) => {
    const newExpr =
      expression.slice(0, cursorPos) + str + expression.slice(cursorPos);
    setExpression(newExpr);
    setCursorPos(cursorPos + str.length);
    setResult(null);
    speakText(speak);
  };

  const handleClear = () => {
    setExpression("");
    setCursorPos(0);
    setResult(null);
    speakText("Cleared");
  };

  const handleDelete = () => {
    if (cursorPos > 0) {
      const newExpr =
        expression.slice(0, cursorPos - 1) + expression.slice(cursorPos);
      setExpression(newExpr);
      setCursorPos(cursorPos - 1);
      setResult(null);
      speakText("Deleted");
    } else {
      speakText("Nothing to delete");
    }
  };

  const compute = () => {
    try {
      if (!expression.trim()) return;
      // Pre-process for mathjs
      let t = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "pi")
        .replace(/√\(/g, "sqrt(")
        .replace(/≤/g, "<=")
        .replace(/≥/g, ">=")
        .replace(/≠/g, "!=")
        .replace(/ln\(/g, "log(")
        .replace(/log\(/g, "log10(");

      const res = evaluate(t);
      const val =
        typeof res === "number" && !Number.isInteger(res)
          ? Number(res.toFixed(6))
          : res;
      setResult(String(val));
      speakText(`Result corresponds to ${val}`);
    } catch (err) {
      setResult("Error");
      speakText("Invalid expression");
    }
  };

  const renderKey = (
    main: React.ReactNode,
    onClick: () => void,
    speakString: string,
    opts: {
      color?: string;
      mainTextScale?: string;
      colSpan?: number;
      rowSpan?: number;
    } = {},
  ) => {
    const colClass = opts.colSpan ? `col-span-${opts.colSpan}` : "col-span-1";
    const rowClass = opts.rowSpan ? `row-span-${opts.rowSpan}` : "row-span-1";
    const textColor = opts.color || "text-[#e5f3ff]";
    const textSize = opts.mainTextScale || "text-xl";
    return (
      <div
        className={`flex flex-col items-center justify-center ${colClass} ${rowClass} h-full w-full min-h-0`}
      >
        <button
          onClick={onClick}
          onFocus={() => {
            speakText(speakString);
          }}
          className={`bg-transparent ${textColor} hover:bg-white/5 active:bg-white/10 w-full h-full flex flex-col items-center justify-center transition-all rounded-full outline-none focus:ring-[4px] focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#0c1f2e]`}
          aria-label={speakString}
        >
          <span className={`${textSize}`}>{main}</span>
        </button>
      </div>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle if in floating calculator
    const key = e.key;

    // Prevent global keydown handlers from intercepting arrow keys in calculator
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }

    if ((e.ctrlKey || e.metaKey) && e.code === "Digit1") {
      e.preventDefault();
      setViewMode("standard");
      speakText("Standard View activated");
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.code === "Digit2") {
      e.preventDefault();
      setViewMode("scientific");
      speakText("Scientific View activated");
      return;
    }

    if (/^[a-zA-Z0-9^]$/.test(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      insertText(key, key);
    } else if (key === "+") {
      insertText("+", "plus");
    } else if (key === "-") {
      insertText("-", "minus");
    } else if (key === "*") {
      insertText("×", "times");
    } else if (key === "/") {
      insertText("÷", "divided by");
    } else if (key === "." || key === ",") {
      insertText(".", "point");
    } else if (key === "(") {
      insertText("(", "left parenthesis");
    } else if (key === ")") {
      insertText(")", "right parenthesis");
    } else if (key === "Enter" || key === "=") {
      e.preventDefault();
      compute();
    } else if (key === "Backspace") {
      e.preventDefault();
      handleDelete();
    } else if (key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (key === "ArrowLeft") {
      e.preventDefault();
      if (cursorPos > 0) {
        setCursorPos(cursorPos - 1);
        speakText("Cursor left");
      }
    } else if (key === "ArrowRight") {
      e.preventDefault();
      if (cursorPos < expression.length) {
        setCursorPos(cursorPos + 1);
        speakText("Cursor right");
      }
    } else if (key === "ArrowUp") {
      e.preventDefault();
      if (cursorPos > 0) {
        setCursorPos(0);
        speakText("Cursor start");
      }
    } else if (key === "ArrowDown") {
      e.preventDefault();
      if (cursorPos < expression.length) {
        setCursorPos(expression.length);
        speakText("Cursor end");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`fixed inset-0 z-[100] w-full h-full bg-[#0c1f2e] flex flex-col font-sans select-none overflow-y-auto no-scrollbar`}
      tabIndex={-1}
      role="dialog"
      aria-label="Calculator Window"
    >
      <div
        className={`w-full h-full mx-auto flex flex-col flex-1 pb-4 sm:pb-8 transition-[max-width,width] duration-300 ease-in-out ${
          viewMode === "scientific" ? "max-w-4xl" : "max-w-md"
        }`}
      >
        {/* Title Bar */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-[#1e405a]/50">
          <div className="flex items-center gap-1 sm:gap-2 bg-[#081014] p-1 rounded-lg">
            <button
              onClick={() => {
                setViewMode("standard");
                speakText("Standard View");
              }}
              title="Cmd/Ctrl + 1"
              className={`px-3 py-1.5 rounded-md font-semibold text-sm outline-none transition-colors ${
                viewMode === "standard"
                  ? "bg-[#163e5b] text-cyan-400"
                  : "text-white/50 hover:text-white"
              }`}
              aria-pressed={viewMode === "standard"}
            >
              Standard
            </button>
            <button
              onClick={() => {
                setViewMode("scientific");
                speakText("Scientific View");
              }}
              title="Cmd/Ctrl + 2"
              className={`px-3 py-1.5 rounded-md font-semibold text-sm outline-none transition-colors ${
                viewMode === "scientific"
                  ? "bg-[#163e5b] text-cyan-400"
                  : "text-white/50 hover:text-white"
              }`}
              aria-pressed={viewMode === "scientific"}
            >
              Scientific
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#163e5b] hover:bg-[#1a4a6e] rounded-lg font-bold text-cyan-400 outline-none focus:ring-[4px] focus:ring-cyan-500 transition-colors"
              aria-label="Close calculator"
            >
              Close / Esc
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-4 lg:gap-6 flex-1 min-h-0">
          {/* Screen */}
          <div
            ref={screenRef}
            className="bg-[#081014] border-[2px] border-[#1e405a] rounded-2xl relative w-full h-[140px] lg:h-[180px] flex flex-col justify-end p-4 sm:p-6 shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] group outline-none focus:ring-[6px] focus:ring-cyan-500"
            tabIndex={0}
            onFocus={() =>
              speakText(`Screen: ${expression}. Result: ${result || "none"}`)
            }
          >
            <div
              className={`text-white font-mono ${
                viewMode === "scientific"
                  ? "text-5xl lg:text-6xl"
                  : "text-4xl lg:text-5xl"
              } tracking-wide flex items-center overflow-x-auto no-scrollbar`}
              aria-hidden="true"
            >
              {expression.slice(0, cursorPos)}
              <span className="w-[3px] lg:w-[4px] h-8 lg:h-10 bg-green-400 animate-pulse inline-block mx-[2px]"></span>
              {expression.slice(cursorPos)}
            </div>

            <div className="flex justify-end mt-4">
              <div
                aria-hidden="true"
                className={`text-white/90 ${
                  viewMode === "scientific"
                    ? "text-6xl lg:text-8xl"
                    : "text-5xl lg:text-7xl"
                } font-mono tracking-wide`}
              >
                {result}
              </div>
            </div>
          </div>

          {/* Keypad Grid */}
          <div
            className={`grid ${
              viewMode === "scientific" ? "grid-cols-7" : "grid-cols-4"
            } grid-rows-5 gap-2 sm:gap-3 lg:gap-4 mt-2 flex-1 min-h-0 transition-all duration-300`}
          >
            {/* Row 1 */}
            {viewMode === "scientific" && (
              <>
                {renderKey(
                  "(",
                  () => insertText("(", "left parenthesis"),
                  "left parenthesis",
                  { mainTextScale: "text-3xl sm:text-4xl font-medium" },
                )}
                {renderKey(
                  ")",
                  () => insertText(")", "right parenthesis"),
                  "right parenthesis",
                  { mainTextScale: "text-3xl sm:text-4xl font-medium" },
                )}
                {renderKey(
                  "e",
                  () => insertText("e", "euler's number"),
                  "euler's number",
                  { mainTextScale: "text-3xl sm:text-4xl font-serif italic" },
                )}
              </>
            )}
            {renderKey("AC", handleClear, "All Clear", {
              color: "text-[#ffb3b3]",
              mainTextScale: "text-2xl sm:text-3xl font-medium",
            })}
            {renderKey(
              <Delete className="w-6 sm:w-8 h-6 sm:h-8 mx-auto" />,
              handleDelete,
              "delete",
              {
                color: "text-[#ffb3b3]",
                mainTextScale: "text-2xl sm:text-3xl font-medium",
              },
            )}
            {renderKey("%", () => insertText("%", "percent"), "percent", {
              color: "text-cyan-400",
              mainTextScale: "text-3xl sm:text-4xl font-medium",
            })}
            {renderKey("÷", () => insertText("÷", "divided by"), "divided by", {
              color: "text-cyan-400",
              mainTextScale: "text-4xl sm:text-5xl font-medium",
            })}

            {/* Row 2 */}
            {viewMode === "scientific" && (
              <>
                {renderKey(
                  "sin",
                  () => insertText("sin(", "sine left parenthesis"),
                  "sine",
                  { mainTextScale: "text-2xl sm:text-3xl font-medium" },
                )}
                {renderKey(
                  "cos",
                  () => insertText("cos(", "cosine left parenthesis"),
                  "cosine",
                  { mainTextScale: "text-2xl sm:text-3xl font-medium" },
                )}
                {renderKey(
                  "tan",
                  () => insertText("tan(", "tangent left parenthesis"),
                  "tangent",
                  { mainTextScale: "text-2xl sm:text-3xl font-medium" },
                )}
              </>
            )}
            {renderKey("7", () => insertText("7", "seven"), "seven", {
              mainTextScale: "text-3xl sm:text-4xl font-medium",
            })}
            {renderKey("8", () => insertText("8", "eight"), "eight", {
              mainTextScale: "text-3xl sm:text-4xl font-medium",
            })}
            {renderKey("9", () => insertText("9", "nine"), "nine", {
              mainTextScale: "text-3xl sm:text-4xl font-medium",
            })}
            {renderKey("×", () => insertText("×", "times"), "times", {
              color: "text-cyan-400",
              mainTextScale: "text-4xl sm:text-5xl font-medium",
            })}

            {/* Row 3 */}
            {viewMode === "scientific" && (
              <>
                {renderKey(
                  "ln",
                  () => insertText("ln(", "natural log left parenthesis"),
                  "natural log",
                  { mainTextScale: "text-2xl sm:text-3xl font-medium" },
                )}
                {renderKey(
                  "log",
                  () => insertText("log(", "log base 10 left parenthesis"),
                  "log base 10",
                  { mainTextScale: "text-2xl sm:text-3xl font-medium" },
                )}
                {renderKey(
                  "√",
                  () => insertText("sqrt(", "square root left parenthesis"),
                  "square root",
                  { mainTextScale: "text-3xl sm:text-4xl font-medium" },
                )}
              </>
            )}
            {renderKey("4", () => insertText("4", "four"), "four", {
              mainTextScale: "text-3xl sm:text-4xl font-medium",
            })}
            {renderKey("5", () => insertText("5", "five"), "five", {
              mainTextScale: "text-3xl sm:text-4xl font-medium",
            })}
            {renderKey("6", () => insertText("6", "six"), "six", {
              mainTextScale: "text-3xl sm:text-4xl font-medium",
            })}
            {renderKey("−", () => insertText("-", "minus"), "minus", {
              color: "text-cyan-400",
              mainTextScale: "text-4xl sm:text-5xl font-medium",
            })}

            {/* Row 4 */}
            {viewMode === "scientific" && (
              <>
                {renderKey("π", () => insertText("pi", "pi"), "pi", {
                  mainTextScale: "text-3xl sm:text-4xl font-serif italic",
                })}
                {renderKey("xⁿ", () => insertText("^", "power"), "power", {
                  mainTextScale: "text-2xl sm:text-3xl font-medium",
                })}
                {renderKey(
                  "x!",
                  () => insertText("!", "factorial"),
                  "factorial",
                  { mainTextScale: "text-2xl sm:text-3xl font-medium" },
                )}
              </>
            )}
            {renderKey("1", () => insertText("1", "one"), "one", {
              mainTextScale: "text-3xl sm:text-4xl font-medium",
            })}
            {renderKey("2", () => insertText("2", "two"), "two", {
              mainTextScale: "text-3xl sm:text-4xl font-medium",
            })}
            {renderKey("3", () => insertText("3", "three"), "three", {
              mainTextScale: "text-3xl sm:text-4xl font-medium",
            })}
            {renderKey("+", () => insertText("+", "plus"), "plus", {
              color: "text-cyan-400",
              mainTextScale: "text-4xl sm:text-5xl font-medium",
            })}

            {/* Row 5 */}
            {viewMode === "scientific" && (
              <>
                {renderKey("x²", () => insertText("^2", "squared"), "squared", {
                  mainTextScale: "text-2xl sm:text-3xl font-medium",
                })}
                {renderKey("x³", () => insertText("^3", "cubed"), "cubed", {
                  mainTextScale: "text-2xl sm:text-3xl font-medium",
                })}
                {renderKey(
                  "|x|",
                  () => insertText("abs(", "absolute value left parenthesis"),
                  "absolute value",
                  { mainTextScale: "text-2xl sm:text-3xl font-medium" },
                )}
              </>
            )}
            {renderKey("0", () => insertText("0", "zero"), "zero", {
              mainTextScale: "text-3xl sm:text-4xl font-medium",
              colSpan: 2,
            })}
            {renderKey(".", () => insertText(".", "point"), "point", {
              mainTextScale: "text-4xl sm:text-5xl font-medium",
            })}
            {renderKey("=", compute, "equals", {
              color: "text-green-400",
              mainTextScale: "text-4xl sm:text-5xl font-medium",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
