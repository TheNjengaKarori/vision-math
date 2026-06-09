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
  const [is2nd, setIs2nd] = useState(false);
  const [angleMode, setAngleMode] = useState<"DEG" | "RAD">("DEG");
  const [cursorPos, setCursorPos] = useState(0);

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
        .replace(/ln\(/g, "log(") // Mathjs handles log as ln, log10 for base 10
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

  const handleToggle2nd = () => {
    setIs2nd(!is2nd);
    speakText(
      !is2nd ? "Second function activated" : "Second function deactivated",
    );
  };

  const renderKey = (
    main: React.ReactNode,
    sec: string | null,
    onClick: () => void,
    speakString: string,
    opts: {
      bg?: string;
      color?: string;
      mainTextScale?: string;
      bold?: boolean;
      colSpan?: number;
      rowSpan?: number;
      customId?: string;
    } = {},
  ) => {
    const bgClass = opts.bg || "bg-[#4b4e53]";
    const colClass = opts.colSpan ? `col-span-${opts.colSpan}` : "col-span-1";
    const rowClass = opts.rowSpan ? `row-span-${opts.rowSpan}` : "row-span-1";
    const textColor = opts.color || "text-white";
    const textSize = opts.mainTextScale || "text-xl sm:text-2xl lg:text-3xl";
    return (
      <div
        className={`flex flex-col items-center justify-end p-[2px] ${colClass} ${rowClass} h-full w-full min-h-0`}
      >
        {sec ? (
          <span className="text-[#fbbc04] text-[10px] sm:text-sm lg:text-base font-bold leading-none mb-1 text-center h-3 sm:h-4 lg:h-5 pointer-events-none">
            {sec}
          </span>
        ) : (
          <span className="h-3 sm:h-4 lg:h-5 pointer-events-none mb-1"></span>
        )}
        <button
          onClick={onClick}
          onFocus={() => {
            if (opts.customId !== "2nd") {
              speakText(`${is2nd && sec ? sec : speakString}`);
            } else {
              speakText(speakString);
            }
          }}
          className={`${bgClass} ${textColor} w-full flex-1 rounded text-center shrink-0 shadow-[0_2px_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-[2px] transition-all
            ${opts.bold ? "font-bold" : "font-medium"} ${textSize} outline-none focus:ring-[8px] focus:ring-[#facc15] focus:ring-offset-2 lg:focus:ring-offset-4 focus:ring-offset-[#2b2b2b]`}
          aria-label={is2nd && sec ? sec : speakString}
        >
          {main}
        </button>
      </div>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle if in floating calculator
    const key = e.key;
    if (/^[a-zA-Z0-9^]$/.test(key)) {
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
      className={`fixed inset-0 z-[100] w-full h-full bg-[#112a3d]/90 backdrop-blur-sm sm:pt-[5vh] sm:pb-[5vh] flex flex-col items-center justify-center font-sans select-none overflow-y-auto no-scrollbar`}
      tabIndex={-1}
      role="dialog"
      aria-label="Calculator Window"
    >
      <div className="w-full h-full sm:h-auto sm:max-h-full sm:max-w-2xl lg:max-w-4xl bg-[#2b2b2b] sm:rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex flex-col flex-1 sm:flex-none">
        {/* Title Bar */}
        <div className="flex justify-between items-center bg-[#e0e0e0] px-4 py-3 sm:rounded-t-2xl border-b border-[#a0a0a0]">
          <div className="flex items-center gap-3">
            <span className="text-black text-base lg:text-lg font-bold tracking-wide">
              Calc30
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-black/10 hover:bg-black/20 rounded font-bold text-black text-sm outline-none focus:ring-[4px] focus:ring-[#facc15]"
              aria-label="Close calculator"
            >
              Close / Esc
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-5 lg:p-6 flex flex-col gap-3 lg:gap-5 flex-1 min-h-0">
          {/* Screen */}
          <div
            ref={screenRef}
            className="bg-[#383a3d] border-[3px] sm:border-[4px] border-[#4a4c4f] rounded-lg relative w-full h-[160px] lg:h-[220px] flex flex-col justify-between p-3 sm:p-4 shadow-inner group outline-none focus:ring-[8px] focus:ring-[#facc15]"
            tabIndex={0}
            onFocus={() =>
              speakText(`Screen: ${expression}. Result: ${result || "none"}`)
            }
          >
            <div className="absolute top-2 left-2 flex gap-3">
              <div className="w-5 h-5 bg-pink-500 rounded-sm"></div>
              <div className="w-5 h-5 bg-green-500 border border-green-300 rounded-sm flex items-center justify-center p-[2px]">
                <div className="w-full h-full bg-green-300 rounded-sm opacity-50"></div>
              </div>
              <ChevronDown className="text-white/50" size={16} />
              <ChevronUp className="text-white/50" size={16} />
              <span className="text-white/60 text-[10px] sm:text-xs font-bold tracking-widest leading-none mt-1">
                {angleMode}
              </span>
              <span className="text-white/60 text-[10px] sm:text-xs font-bold tracking-widest leading-none mt-1">
                NORM
              </span>
              <span className="text-white/60 text-[10px] sm:text-xs font-bold tracking-widest leading-none mt-1">
                DECI
              </span>
            </div>

            <div
              className="mt-8 text-white font-mono text-4xl lg:text-5xl tracking-wide flex items-center overflow-x-auto no-scrollbar"
              aria-hidden="true"
            >
              {expression.slice(0, cursorPos)}
              <span className="w-[3px] lg:w-[4px] h-8 lg:h-10 bg-green-400 animate-pulse inline-block mx-[2px]"></span>
              {expression.slice(cursorPos)}
            </div>

            <div className="flex justify-between items-end">
              <div className="flex gap-2">
                <div className="border border-white/30 rounded-full w-5 h-5 flex items-center justify-center text-[10px] sm:text-xs text-white/50">
                  L
                </div>
                <div className="border border-white/30 px-1.5 py-0.5 rounded-sm text-[10px] sm:text-xs text-white/50">
                  More
                </div>
              </div>
              <div
                aria-hidden="true"
                className="text-white/90 text-4xl lg:text-6xl font-mono px-2 tracking-wide"
              >
                {result}
              </div>
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-5 grid-rows-9 gap-1.5 sm:gap-2.5 mt-2 flex-1 min-h-0 pb-2 sm:pb-4">
            {/* Row 1 */}
            {renderKey(
              "2nd",
              null,
              handleToggle2nd,
              "Second function modifier",
              {
                bg: "bg-[#fbbc04]",
                color: "text-black",
                bold: true,
                customId: "2nd",
              },
            )}
            {renderKey(
              "mode",
              "quit",
              () =>
                is2nd ? onClose() : speakText("Mode menu not implemented"),
              "quit",
              { mainTextScale: "text-sm", color: "text-white" },
            )}
            {renderKey(
              <>
                <ClearIcon />
                <span className="ml-[2px] text-sm">del</span>
              </>,
              null,
              handleDelete,
              "Delete",
              { color: "text-white" },
            )}

            {/* D-Pad Cell (spans col 4-5, row 1-2) */}
            <div className="col-span-2 row-span-2 relative bg-[#2a2c2f] rounded-lg shadow-inner flex items-center justify-center p-2 mb-2 sm:mb-1">
              <div className="relative w-full h-full aspect-square max-w-[120px] max-h-[120px] rounded-full border-[3px] border-[#1c1d1f] shadow-lg flex items-center justify-center bg-[#4b4e53]">
                <button
                  className="absolute top-1 cursor-pointer hover:bg-white/10 rounded-sm p-1.5 focus:bg-white/20 outline-none focus:ring-[4px] focus:ring-[#facc15]"
                  onClick={() => {
                    if (cursorPos > 0) {
                      setCursorPos(0);
                      speakText("Cursor start");
                    }
                  }}
                  aria-label="Cursor start"
                >
                  <ArrowUp className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  className="absolute bottom-1 cursor-pointer hover:bg-white/10 rounded-sm p-1.5 focus:bg-white/20 outline-none focus:ring-[4px] focus:ring-[#facc15]"
                  onClick={() => {
                    if (cursorPos < expression.length) {
                      setCursorPos(expression.length);
                      speakText("Cursor end");
                    }
                  }}
                  aria-label="Cursor end"
                >
                  <ArrowDown className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  className="absolute left-1 cursor-pointer hover:bg-white/10 rounded-sm p-1.5 focus:bg-white/20 outline-none focus:ring-[4px] focus:ring-[#facc15]"
                  onClick={() => {
                    if (cursorPos > 0) {
                      setCursorPos(cursorPos - 1);
                      speakText("Cursor left");
                    }
                  }}
                  aria-label="Cursor left"
                >
                  <ArrowLeft className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  className="absolute right-1 cursor-pointer hover:bg-white/10 rounded-sm p-1.5 focus:bg-white/20 outline-none focus:ring-[4px] focus:ring-[#facc15]"
                  onClick={() => {
                    if (cursorPos < expression.length) {
                      setCursorPos(cursorPos + 1);
                      speakText("Cursor right");
                    }
                  }}
                  aria-label="Cursor right"
                >
                  <ArrowRight className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#383a3d] shadow-inner flex items-center justify-center">
                  <div className="w-[1.5px] h-4 bg-black/40"></div>
                  <div className="w-4 h-[1.5px] bg-black/40 absolute"></div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            {renderKey(
              "log",
              "10^x",
              () =>
                is2nd
                  ? insertText("10^", "Ten to the power of")
                  : insertText("log(", "log base 10 left parenthesis"),
              "log",
            )}
            {renderKey(
              "prb",
              "angle",
              () => speakText("Probability menu not implemented"),
              "prb",
            )}
            {renderKey(
              "data",
              "stat-reg",
              () => speakText("Data menu not implemented"),
              "data",
            )}

            {/* Row 3 */}
            {renderKey(
              "ln",
              "e^x",
              () =>
                is2nd
                  ? insertText("e^", "e to the power of")
                  : insertText("ln(", "natural log left parenthesis"),
              "ln",
            )}
            {renderKey(
              "n/d",
              "U n/d",
              () => speakText("Fraction not implemented"),
              "fraction",
            )}
            {renderKey(
              <span>
                <span className="text-sm">×10</span>
                <sup className="text-[10px]">n</sup>
              </span>,
              "n/d ◄► U n/d",
              () => insertText("*10^", "times ten to the power of"),
              "scientific notation",
            )}
            {renderKey(
              "table",
              "f ◄► d",
              () => speakText("Table not implemented"),
              "table",
            )}
            {renderKey("clear", null, handleClear, "Clear", {
              bg: "bg-[#43952f]",
              mainTextScale: "text-[15px]",
            })}

            {/* Row 4 */}
            {renderKey(
              "π",
              "hyp",
              () =>
                is2nd
                  ? speakText("Hyperbolic not implemented")
                  : insertText("π", "pi"),
              "pi",
              { mainTextScale: "text-2xl font-serif italic" },
            )}
            {renderKey(
              "Sin",
              "Sin⁻¹",
              () =>
                is2nd
                  ? insertText("asin(", "arc sine left parenthesis")
                  : insertText("sin(", "sine left parenthesis"),
              "sin",
            )}
            {renderKey(
              "Cos",
              "Cos⁻¹",
              () =>
                is2nd
                  ? insertText("acos(", "arc cosine left parenthesis")
                  : insertText("cos(", "cosine left parenthesis"),
              "cos",
            )}
            {renderKey(
              "Tan",
              "Tan⁻¹",
              () =>
                is2nd
                  ? insertText("atan(", "arc tangent left parenthesis")
                  : insertText("tan(", "tangent left parenthesis"),
              "tan",
            )}
            {renderKey(
              "÷",
              "set op",
              () => insertText("÷", "divided by"),
              "divided by",
              { bg: "bg-[#27282b]" },
            )}

            {/* Row 5 */}
            {renderKey(
              <span>
                x
                <span className="inline-block w-2 h-2 border border-white translate-y-[-6px] ml-0.5"></span>
              </span>,
              "x√",
              () =>
                is2nd
                  ? insertText("√(", "square root left parenthesis")
                  : insertText("^", "to the power of"),
              "power",
            )}
            {renderKey(
              "x⁻¹",
              "math",
              () =>
                is2nd
                  ? speakText("Math menu not implemented")
                  : insertText("^-1", "to the power of negative one"),
              "inverse",
            )}
            {renderKey(
              "(",
              "%",
              () =>
                is2nd
                  ? insertText("%", "percent")
                  : insertText("(", "left parenthesis"),
              "left parenthesis",
            )}
            {renderKey(
              ")",
              "►%",
              () =>
                is2nd
                  ? speakText("Format percent not implemented")
                  : insertText(")", "right parenthesis"),
              "right parenthesis",
            )}
            {renderKey("×", null, () => insertText("×", "times"), "times", {
              bg: "bg-[#27282b]",
            })}

            {/* Row 6 */}
            {renderKey(
              "x²",
              "√",
              () =>
                is2nd
                  ? insertText("√(", "square root")
                  : insertText("^2", "squared"),
              "squared",
            )}
            {renderKey("7", "matrix", () => insertText("7", "seven"), "seven", {
              bg: "bg-[#333538]",
            })}
            {renderKey("8", "vector", () => insertText("8", "eight"), "eight", {
              bg: "bg-[#333538]",
            })}
            {renderKey("9", "table", () => insertText("9", "nine"), "nine", {
              bg: "bg-[#333538]",
            })}
            {renderKey("−", null, () => insertText("-", "minus"), "minus", {
              bg: "bg-[#27282b]",
            })}

            {/* Row 7 */}
            {renderKey(
              <div className="leading-tight text-xs">
                xyzt
                <br />
                abcd
              </div>,
              "clear-var",
              () => speakText("Variables not implemented"),
              "Variables",
            )}
            {renderKey("4", "num-solv", () => insertText("4", "four"), "four", {
              bg: "bg-[#333538]",
            })}
            {renderKey(
              "5",
              "poly-solv",
              () => insertText("5", "five"),
              "five",
              {
                bg: "bg-[#333538]",
              },
            )}
            {renderKey("6", "sys-solv", () => insertText("6", "six"), "six", {
              bg: "bg-[#333538]",
            })}
            {renderKey(
              "+",
              "i",
              () =>
                is2nd
                  ? insertText("i", "imaginary unit")
                  : insertText("+", "plus"),
              "plus",
              { bg: "bg-[#27282b]" },
            )}

            {/* Row 8 */}
            {renderKey(
              <div className="flex items-center text-sm">
                sto <ArrowRight size={12} className="ml-1" />
              </div>,
              "recall",
              () => {
                if (result) {
                  onInsert(result);
                } else {
                  speakText("No result to insert");
                }
              },
              "Insert to Canvas",
            )}
            {renderKey("1", "n_∫dx", () => insertText("1", "one"), "one", {
              bg: "bg-[#333538]",
            })}
            {renderKey("2", "n_d/dx", () => insertText("2", "two"), "two", {
              bg: "bg-[#333538]",
            })}
            {renderKey(
              "3",
              "algebra",
              () => insertText("3", "three"),
              "three",
              {
                bg: "bg-[#333538]",
              },
            )}
            {renderKey(
              <div className="flex items-center flex-col -gap-1">
                <ArrowUp size={14} />
                <ArrowDown size={14} />
              </div>,
              null,
              () => speakText("Scroll not implemented"),
              "Scroll",
              { bg: "bg-[#27282b]" },
            )}

            {/* Row 9 */}
            {renderKey(
              <div className="flex flex-col gap-1 w-4 h-4">
                <div className="h-[2px] w-full bg-white"></div>
                <div className="h-[2px] w-full bg-white"></div>
                <div className="h-[2px] w-full bg-white"></div>
              </div>,
              null,
              () => speakText("Menu not implemented"),
              "Menu",
            )}
            {renderKey("0", "reset", () => insertText("0", "zero"), "zero", {
              bg: "bg-[#333538]",
            })}
            {renderKey(".", ",", () => insertText(".", "point"), "point", {
              bg: "bg-[#333538]",
              mainTextScale: "text-2xl font-bold",
            })}
            {renderKey(
              "(-)",
              "ans",
              () =>
                is2nd
                  ? insertText(result || "", "Answer")
                  : insertText("-", "negative"),
              "negative",
              { bg: "bg-[#27282b]" },
            )}
            {renderKey("enter", "op", compute, "Enter", {
              bg: "bg-[#27282b]",
              mainTextScale: "text-sm font-semibold",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronDown({
  className,
  size,
}: {
  className?: string;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

function ChevronUp({ className, size }: { className?: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
      <line x1="18" y1="9" x2="12" y2="15"></line>
      <line x1="12" y1="9" x2="18" y2="15"></line>
    </svg>
  );
}
