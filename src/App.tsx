import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Calculator,
  Volume2,
  VolumeX,
  Save,
  FilePlus,
  X,
  Hand,
  MessageSquare,
  RefreshCw,
  Send,
  PlayCircle,
  ArrowRight,
} from "lucide-react";
import { evaluate } from "mathjs";
import { FloatingCalculator } from "./components/FloatingCalculator";
import { TeacherFeedView } from "./components/TeacherFeedView";

const playErrorSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.value = 100;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(
      0.00001,
      audioCtx.currentTime + 0.5,
    );
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio API not supported");
  }
};

const playCloneSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();

    // First click
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(
      800,
      audioCtx.currentTime + 0.05,
    );
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.05);

    // Second click
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(800, audioCtx.currentTime + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(
      1200,
      audioCtx.currentTime + 0.13,
    );
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    gain2.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.13);
    osc2.start(audioCtx.currentTime + 0.08);
    osc2.stop(audioCtx.currentTime + 0.13);
  } catch (e) {
    console.error("Audio API not supported");
  }
};

const playScratchpadOpenSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const bufferSize = audioCtx.sampleRate * 0.2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1000;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioCtx.currentTime + 0.2,
    );

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noise.start();
  } catch (e) {
    console.error("Audio API not supported");
  }
};

const playScratchpadCloseSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioCtx.currentTime + 0.1,
    );

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.error("Audio API not supported");
  }
};

const playAlertSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();

    // Tone 1
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(300, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.15);

    // Tone 2
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(450, audioCtx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 0.35);
  } catch (err) {
    console.error("Audio API not supported", err);
  }
};

const playBellSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 1);

    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const playDoorbellSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();

    // Ding
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
    gain1.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.5);

    // Dong
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.4); // C5
    gain2.gain.setValueAtTime(0.5, audioCtx.currentTime + 0.4);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.0);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.4);
    osc2.stop(audioCtx.currentTime + 1.0);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const playWhooshLockSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();

    // Whoosh
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.15);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);

    // Lock click
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(800, audioCtx.currentTime + 0.3);
    gain2.gain.setValueAtTime(0, audioCtx.currentTime + 0.3);
    gain2.gain.setValueAtTime(0.5, audioCtx.currentTime + 0.31);
    gain2.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.3);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.3);
    osc2.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const playWhooshUnlockSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();

    // Unlock click
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(600, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0.5, audioCtx.currentTime + 0.01);
    gain2.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);

    // Whoosh up
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(100, audioCtx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(
      400,
      audioCtx.currentTime + 0.35,
    );
    gain.gain.setValueAtTime(0, audioCtx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.2);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.35);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime);
    osc2.stop(audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + 0.05);
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const playPingSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioCtx.currentTime + 0.5,
    );
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const MATH_SYMBOLS = [
  { symbol: "0", name: "Zero Number" },
  { symbol: "1", name: "One Number" },
  { symbol: "2", name: "Two Number" },
  { symbol: "3", name: "Three Number" },
  { symbol: "4", name: "Four Number" },
  { symbol: "5", name: "Five Number" },
  { symbol: "6", name: "Six Number" },
  { symbol: "7", name: "Seven Number" },
  { symbol: "8", name: "Eight Number" },
  { symbol: "9", name: "Nine Number" },
  { symbol: "+", name: "Plus / Addition Operator" },
  { symbol: "-", name: "Minus / Subtraction Operator" },
  { symbol: "×", name: "Multiply / Times Operator" },
  { symbol: "÷", name: "Divide Operator" },
  { symbol: "=", name: "Equals Operator" },
  { symbol: "≠", name: "Not Equal Operator" },
  { symbol: "<", name: "Less Than Operator" },
  { symbol: ">", name: "Greater Than Operator" },
  { symbol: "≤", name: "Less Than or Equal Operator" },
  { symbol: "≥", name: "Greater Than or Equal Operator" },
  { symbol: "(", name: "Left Parenthesis Bracket" },
  { symbol: ")", name: "Right Parenthesis Bracket" },
  { symbol: "{", name: "Left Brace Bracket" },
  { symbol: "}", name: "Right Brace Bracket" },
  { symbol: "[", name: "Left Bracket" },
  { symbol: "]", name: "Right Bracket" },
  { symbol: "π", name: "Pi Constant function" },
  { symbol: "e", name: "Euler's Number Constant function" },
  { symbol: "√", name: "Square Root function" },
  { symbol: "^", name: "Exponent / Power Operator" },
  { symbol: "°", name: "Degree Symbol" },
  { symbol: "%", name: "Percent Symbol" },
  { symbol: "sin", name: "Sine Trigonometry function" },
  { symbol: "cos", name: "Cosine Trigonometry function" },
  { symbol: "tan", name: "Tangent Trigonometry function" },
  { symbol: "log", name: "Logarithm (Base 10) function" },
  { symbol: "ln", name: "Natural Log / ln function" },
  { symbol: ".", name: "Decimal / Period Punctuation" },
  { symbol: ",", name: "Comma Punctuation" },
  {
    symbol: "🙋‍♂️",
    name: "Raise Hand (Queue)",
    action: "raise_hand",
  },
  {
    symbol: "📡",
    name: "Broadcast Line (Type 'bbb')",
    action: "broadcast_line",
  },
  {
    symbol: "📝",
    name: "Toggle Scratchpad (Type 'rrr')",
    action: "toggle_scratchpad",
  },
  {
    symbol: "🧭",
    name: "Where Am I? Context Locator (Double-Click 'Shift')",
    action: "context_locator",
  },
  {
    symbol: "👥",
    name: "Start Group Work",
    action: "start_group_work",
  },
  {
    symbol: "🚀",
    name: "Submit (Ctrl + S)",
    action: "toggle_submission",
  },
  {
    symbol: "½",
    name: "Insert Fraction",
    action: "insert_fraction",
  },
  {
    symbol: "🔄",
    name: "Reset for Next User (Ctrl + R)",
    action: "reset_next_user",
  },
  {
    symbol: "💾",
    name: "Save Lesson",
    action: "save_lesson",
  },
  {
    symbol: "🔁",
    name: "Refresh to Default Equation",
    action: "refresh_equation",
  },
  {
    symbol: "📄",
    name: "Start New Lesson",
    action: "start_new_lesson",
  },
  {
    symbol: "▶️",
    name: "Hear Explanation",
    action: "hear_explanation",
  },
  {
    symbol: "⏭️",
    name: "Next Question",
    action: "next_question",
  },
  {
    symbol: "🔇",
    name: "Toggle Audio Engine",
    action: "toggle_mute",
  },
  {
    symbol: "🎯",
    name: "Focus Navbar",
    action: "focus_navbar",
  },
  {
    symbol: "🧮",
    name: "Voice-Assisted Calculator (Alt + C)",
    action: "open_calculator",
  },
];

const AUTOCOMPLETE_DICT = [
  { prefix: "pi", symbol: "π", name: "Pi" },
  { prefix: "sin", symbol: "sin", name: "Sine" },
  { prefix: "cos", symbol: "cos", name: "Cosine" },
  { prefix: "tan", symbol: "tan", name: "Tangent" },
  { prefix: "log", symbol: "log", name: "Logarithm" },
  { prefix: "sqrt", symbol: "√", name: "Square Root" },
  { prefix: "sq", symbol: "√", name: "Square Root" },
  { prefix: "qr", symbol: "√", name: "Square Root" },
  { prefix: "alpha", symbol: "α", name: "Alpha" },
  { prefix: "beta", symbol: "β", name: "Beta" },
  { prefix: "theta", symbol: "θ", name: "Theta" },
  { prefix: "inf", symbol: "∞", name: "Infinity" },
  { prefix: "sum", symbol: "∑", name: "Summation" },
  { prefix: "int", symbol: "∫", name: "Integral" },
];

const NEMETH_DICT = [
  { ascii: ".p", symbol: "π", name: "Pi" },
  { ascii: ",i", symbol: "∞", name: "Infinity" },
  { ascii: ".s", symbol: "∑", name: "Summation" },
  { ascii: ",I", symbol: "∫", name: "Integral" },
  { ascii: ".a", symbol: "α", name: "Alpha" },
  { ascii: ".b", symbol: "β", name: "Beta" },
  { ascii: ".t", symbol: "θ", name: "Theta" },
  { ascii: ">r", symbol: "√", name: "Square Root" },
  { ascii: "<", symbol: "⟨", name: "Left Angle Bracket" },
  { ascii: ">", symbol: "⟩", name: "Right Angle Bracket" },
  { ascii: "!=", symbol: "≠", name: "Not Equal" },
  { ascii: "<=", symbol: "≤", name: "Less Than or Equal" },
  { ascii: ">=", symbol: "≥", name: "Greater Than or Equal" },
  { ascii: "->", symbol: "→", name: "Right Arrow" },
];

const HELP_MENU_ITEMS = [
  {
    name: "Focus Navbar",
    shortcut: "Alt / Option + T",
    text: "To focus the main navigation bar: Alt T",
    action: "focus_navbar",
  },
  {
    name: "Toggle Audio Engine",
    shortcut: "Ctrl / Cmd",
    text: "To toggle audio: Tap Control or Command",
    action: "toggle_mute",
  },
  {
    name: "Command Palette",
    shortcut: "Ctrl / Cmd + M",
    text: "To open the command palette: Control or Command, M",
    action: "command_palette",
  },
  {
    name: "Evaluate Math",
    shortcut: "Ctrl / Cmd + =",
    text: "To evaluate math: Control or Command, Equals",
    action: "evaluate_math",
  },
  {
    name: "Calculator",
    shortcut: "Alt / Option + C",
    text: "To open voice-assisted calculator: Alt or Option, C",
    action: "open_calculator",
  },
  {
    name: "Raise Hand (Queue)",
    shortcut: "H H H",
    text: "To raise hand: press H three times quickly",
    action: "raise_hand",
  },
  {
    name: "Broadcast Line",
    shortcut: "B B B",
    text: "To broadcast line: press B three times quickly",
    action: "broadcast_line",
  },
  {
    name: "Pass Control (Group)",
    shortcut: "Ctrl / Cmd + P",
    text: "To pass control in group work: Control or Command, P",
    action: "pass_control",
  },
  {
    name: "Toggle Scratchpad (Rough Work)",
    shortcut: "Alt / Opt + R",
    text: "To open rough work: Alt or Option, R",
    action: "toggle_scratchpad",
  },
  {
    name: "Where Am I? Context Locator",
    shortcut: "Double Shift",
    text: "For context locator: Double-click Shift",
    action: "context_locator",
  },
  {
    name: "Undo",
    shortcut: "Ctrl / Cmd + Z",
    text: "To undo: Control or Command, Z",
    action: "undo",
  },
  {
    name: "Redo",
    shortcut: "Ctrl / Cmd + Y",
    text: "To redo: Control or Command, Y",
    action: "redo",
  },
  {
    name: "Group Work",
    shortcut: "Ctrl / Cmd + G",
    text: "To toggle group work: Control or Command, G",
    action: "start_group_work",
  },
  {
    name: "Submit Work",
    shortcut: "Ctrl / Cmd + S",
    text: "To submit your work: Control or Command, S",
    action: "toggle_submission",
  },
  {
    name: "Reset Grid",
    shortcut: "Ctrl / Cmd + R",
    text: "To reset grid for next user: Control or Command, R",
    action: "reset_next_user",
  },
  {
    name: "Help Menu",
    shortcut: "Shift + ?",
    text: "To open this help menu: Shift, Question Mark",
    action: "help_menu",
  },
];

interface MathBlock {
  id: string;
  r: number;
  minC: number;
  maxC: number;
  text: string;
  cells: { c: number; val: string }[];
}

const getEquationBlocks = (data: Record<string, string>): MathBlock[] => {
  const rows: Record<number, { c: number; val: string }[]> = {};
  for (const [key, val] of Object.entries(data)) {
    if (!val) continue;
    const [r, c] = key.split(",").map(Number);
    if (!rows[r]) rows[r] = [];
    rows[r].push({ c, val });
  }

  const blocks: MathBlock[] = [];
  let blockIdCounter = 0;
  for (const rStr of Object.keys(rows).sort((a, b) => Number(a) - Number(b))) {
    const r = Number(rStr);
    rows[r].sort((a, b) => a.c - b.c);
    let currentBlock: { c: number; val: string }[] = [];

    for (let i = 0; i < rows[r].length; i++) {
      const cell = rows[r][i];
      if (currentBlock.length === 0) {
        currentBlock.push(cell);
      } else {
        const lastCell = currentBlock[currentBlock.length - 1];
        if (cell.c - lastCell.c <= 2) {
          currentBlock.push(cell);
        } else {
          blocks.push(createBlock(currentBlock, r, blockIdCounter++));
          currentBlock = [cell];
        }
      }
    }
    if (currentBlock.length > 0) {
      blocks.push(createBlock(currentBlock, r, blockIdCounter++));
    }
  }
  return blocks;
};

const createBlock = (
  cells: { c: number; val: string }[],
  r: number,
  id: number,
): MathBlock => {
  const minC = cells[0].c;
  const maxC = cells[cells.length - 1].c;
  let text = "";
  for (let i = 0; i < cells.length; i++) {
    if (i > 0) {
      const spaces = cells[i].c - cells[i - 1].c - 1;
      text += " ".repeat(spaces);
    }
    text += cells[i].val;
  }
  return {
    id: `math-block-${id}`,
    r,
    minC,
    maxC,
    text,
    cells,
  };
};

const defaultEq = "5+(-3)=5-3";
const defaultGridData: Record<string, string> = {};
for (let i = 0; i < defaultEq.length; i++) {
  defaultGridData[`0,${i}`] = defaultEq[i];
}

export default function App() {
  const [className, setClassName] = useState("Algebra");
  const [year, setYear] = useState("2026");
  const [subject, setSubject] = useState("");
  const [lesson, setLesson] = useState("Lesson 4");
  const [date, setDate] = useState(() => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  });
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [activeCell, setActiveCell] = useState({ r: 0, c: defaultEq.length });
  const [gridData, setGridData] =
    useState<Record<string, string>>(defaultGridData);
  const [bgType, setBgType] = useState<"grid" | "blank">("grid");

  const [currentView, setCurrentView] = useState<"student" | "teacher">(
    "student",
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [missingPingAlert, setMissingPingAlert] = useState(false);

  const [isGroupWork, setIsGroupWork] = useState(false);
  const [hasControl, setHasControl] = useState(true);
  const [activePeer, setActivePeer] = useState("Amina");
  const groupWorkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [helpMenuSelectedIndex, setHelpMenuSelectedIndex] = useState(0);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuInputRef = useRef<HTMLInputElement>(null);

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calculatorInput, setCalculatorInput] = useState("");
  const [calculatorResult, setCalculatorResult] = useState<string | null>(null);
  const calculatorInputRef = useRef<HTMLInputElement>(null);

  const [isFractionDialogOpen, setIsFractionDialogOpen] = useState(false);
  const [fractionNum, setFractionNum] = useState("");
  const [fractionDen, setFractionDen] = useState("");
  const fractionNumRef = useRef<HTMLInputElement>(null);

  const [isBroadcastPaletteOpen, setIsBroadcastPaletteOpen] = useState(false);
  const [broadcastSelectedIndex, setBroadcastSelectedIndex] = useState(0);
  const broadcastStudentList = [
    "Amina",
    "David Ochieng",
    "Sarah Njoroge",
    "John Doe",
  ];
  const broadcastInputRef = useRef<HTMLInputElement>(null);
  const broadcastRef = useRef<HTMLDivElement>(null);
  const [broadcastReply, setBroadcastReply] = useState<{
    student: string;
    lineText: string;
    mockFeedback: string;
  } | null>(null);

  interface RaisedHand {
    id: string;
    name: string;
    timestamp: string;
    currentLineText?: string;
  }
  const [queue, setQueue] = useState<RaisedHand[]>([
    {
      id: "mock_1",
      name: "Amina Hassan",
      timestamp: "5 mins ago",
      currentLineText: "3x - 6 = 9",
    },
    {
      id: "mock_2",
      name: "Brian Ochieng",
      timestamp: "2 mins ago",
      currentLineText: "y = 3",
    },
  ]);
  const [teacherReadyAlert, setTeacherReadyAlert] = useState<boolean>(false);

  // Moved useEffect below speakText

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [paletteSelectedIndex, setPaletteSelectedIndex] = useState(0);

  const [blocks, setBlocks] = useState<MathBlock[]>([]);
  const lastBlockRef = useRef<string | null>(null);
  const blocksRef = useRef(blocks);
  const gridDataRef = useRef(gridData);
  const computedAnswersRef = useRef<
    {
      id: string;
      text: string;
      r: number;
      c: number;
      type: "success" | "error";
    }[]
  >([]);

  const [suggestion, setSuggestion] = useState<{
    symbol: string;
    name: string;
    length: number;
    startC: number;
  } | null>(null);
  const suggestionRef = useRef(suggestion);
  const lastSpokenSuggestionRef = useRef<string | null>(null);

  const [computeStatus, setComputeStatus] = useState("");
  const [computedAnswers, setComputedAnswers] = useState<
    {
      id: string;
      text: string;
      r: number;
      c: number;
      type: "success" | "error";
    }[]
  >([]);

  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const isScratchpadOpenRef = useRef(isScratchpadOpen);
  const [mainWorkspace, setMainWorkspace] = useState({
    gridData: {} as Record<string, string>,
    activeCell: { r: 0, c: 0 },
    computedAnswers: [] as any[],
    blocks: [] as MathBlock[],
  });
  const [scratchpadWorkspace, setScratchpadWorkspace] = useState({
    gridData: {} as Record<string, string>,
    activeCell: { r: 0, c: 0 },
    computedAnswers: [] as any[],
    blocks: [] as MathBlock[],
  });

  const [inputError, setInputError] = useState<{ r: number; c: number } | null>(
    null,
  );

  const historyRef = useRef<{
    main: {
      gridData: Record<string, string>;
      activeCell: { r: number; c: number };
      desc: string;
    }[];
    scratch: {
      gridData: Record<string, string>;
      activeCell: { r: number; c: number };
      desc: string;
    }[];
  }>({
    main: [
      {
        gridData: {},
        activeCell: { r: 0, c: 0 },
        desc: "Initial empty worksheet",
      },
    ],
    scratch: [
      {
        gridData: {},
        activeCell: { r: 0, c: 0 },
        desc: "Initial empty scratchpad",
      },
    ],
  });
  const historyIndexRef = useRef<{ main: number; scratch: number }>({
    main: 0,
    scratch: 0,
  });
  const isUndoRedoActionRef = useRef(false);

  const consecutiveRCount = useRef(0);
  const lastRPressTime = useRef(0);

  const consecutiveShiftCount = useRef(0);
  const lastShiftPressTime = useRef(0);

  const consecutiveHCount = useRef(0);
  const lastHPressTime = useRef(0);

  const consecutiveBCount = useRef(0);
  const lastBPressTime = useRef(0);

  const startNewLesson = () => {
    setGridData({});
    setBlocks([]);
    setComputedAnswers([]);
    setActiveCell({ r: 0, c: 0 });
    setLesson("New Lesson");
    setComputeStatus("New lesson started.");
  };

  const refreshEquation = () => {
    setGridData(defaultGridData);
    setBlocks([]);
    setComputedAnswers([]);
    setActiveCell({ r: 0, c: defaultEq.length });
    setComputeStatus("Equation refreshed.");
  };

  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const isAudioMutedRef = useRef(isAudioMuted);
  useEffect(() => {
    isAudioMutedRef.current = isAudioMuted;
  }, [isAudioMuted]);

  const handleToolbarKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        const target = e.target as HTMLElement;

        if (
          !e.altKey &&
          target.tagName === "INPUT" &&
          (target as HTMLInputElement).type !== "button" &&
          (target as HTMLInputElement).type !== "date"
        ) {
          const input = target as HTMLInputElement;
          if (
            e.key === "ArrowLeft" &&
            input.selectionStart !== null &&
            input.selectionStart > 0
          ) {
            return; // Let caret move left
          }
          if (
            e.key === "ArrowRight" &&
            input.selectionEnd !== null &&
            input.selectionEnd < input.value.length
          ) {
            return; // Let caret move right
          }
        }

        e.preventDefault();
        const focusables = Array.from(
          e.currentTarget.querySelectorAll<HTMLElement>("button, input"),
        ).filter(
          (el) =>
            !el.hasAttribute("disabled") &&
            el.offsetParent !== null &&
            (el.tagName !== "INPUT" ||
              (el as HTMLInputElement).type === "button" ||
              (el as HTMLInputElement).type === "text" ||
              (el as HTMLInputElement).type === "date"),
        );

        let currentIndex = focusables.indexOf(target);
        if (currentIndex === -1 && focusables.length > 0) currentIndex = 0;

        if (currentIndex > -1) {
          let nextIndex =
            e.key === "ArrowRight" ? currentIndex + 1 : currentIndex - 1;
          if (nextIndex >= focusables.length) nextIndex = 0;
          if (nextIndex < 0) nextIndex = focusables.length - 1;

          focusables.forEach((el, i) => {
            el.tabIndex = i === nextIndex ? 0 : -1;
          });
          focusables[nextIndex].focus();
        }
      }

      if (e.key === "Enter" && e.altKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "BUTTON" ||
          (target.tagName === "INPUT" &&
            (target as HTMLInputElement).type === "button")
        ) {
          e.preventDefault();
          target.click();
        }
      }
    },
    [],
  );

  const speakText = useCallback((text: string) => {
    if (isAudioMutedRef.current) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const speechText = text
        .replace(/\(/g, " open bracket ")
        .replace(/\)/g, " close bracket ")
        .replace(/\//g, " forward slash ")
        .replace(/\\/g, " backward slash ")
        .replace(/-/g, " minus ")
        .replace(/\+/g, " plus ")
        .replace(/=/g, " equals ");
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = 0.85; // slower speech rate
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const resetForNextUser = useCallback(() => {
    setGridData(defaultGridData);
    setBlocks([]);
    setComputedAnswers([]);
    setActiveCell({ r: 0, c: defaultEq.length });
    setIsSubmitted(false);
    setComputeStatus("Reset for next user");
    speakText("Inputs cleared for the next student.");
  }, [speakText]);

  const giveHint = useCallback(() => {
    const hint =
      "Hint: Remember the rules of integers. Adding a negative is like subtracting a positive. Try evaluating 5 minus 3.";
    setComputeStatus(hint);
    speakText(hint);
  }, [speakText]);

  const saveLesson = () => {
    const msg = `${lesson || "Lesson"} saved successfully.`;
    setComputeStatus(msg);
  };

  const nextQuestion = () => {
    setIsSubmitted(false);
    const newEq = "2x - 8 = 12";
    const newGrid: Record<string, string> = {};
    for (let i = 0; i < newEq.length; i++) {
      newGrid[`0,${i}`] = newEq[i];
    }
    setGridData(newGrid);
    setBlocks([]);
    setComputedAnswers([]);
    setActiveCell({ r: 0, c: newEq.length });
    setComputeStatus("New question loaded.");
    speakText("New question loaded. 2x - 8 = 12.");
  };

  const hearExplanation = useCallback(() => {
    const lines: string[] = [];
    const keys = Object.keys(gridData);
    let maxR = 0;
    if (keys.length > 0) {
      maxR = Math.max(...keys.map((k) => parseInt(k.split(",")[0], 10)));
    }
    for (let r = 0; r <= maxR; r++) {
      const lineText = Object.keys(gridData)
        .filter((k) => k.startsWith(`${r},`))
        .sort((a, b) => parseInt(a.split(",")[1]) - parseInt(b.split(",")[1]))
        .map((k) => gridData[k])
        .join("")
        .trim();
      if (lineText) {
        lines.push(`Line ${r + 1}: ${lineText}`);
      }
    }

    let explanationText = "";
    if (lines.length > 0) {
      explanationText = `Here is the explanation of your work. ${lines.join(". Next step: ")}`;
    } else {
      explanationText = "There is no work to explain.";
    }

    speakText(explanationText);
    setComputeStatus("Playing explanation.");
  }, [gridData, speakText]);

  useEffect(() => {
    if (isScratchpadOpen && broadcastReply) {
      // Small delay to let the "Scratchpad open" message finish or interrupt it smoothly
      setTimeout(() => {
        speakText(
          `Peer Reply from ${broadcastReply.student}: ${broadcastReply.lineText}. Note: ${broadcastReply.mockFeedback}`,
        );
      }, 1000);
    }
  }, [isScratchpadOpen, broadcastReply, speakText]);

  useEffect(() => {
    if (teacherReadyAlert) {
      playDoorbellSound();
      speakText("Mrs. Mutuku is ready for you.");
      setComputeStatus("Mrs. Mutuku is ready for you.");
      setTeacherReadyAlert(false);
    }
  }, [teacherReadyAlert, speakText]);

  const executeRaiseHand = useCallback(() => {
    const currentR = activeCellRef.current.r;
    const currentLineText = Object.keys(gridDataRef.current)
      .filter((key) => key.startsWith(`${currentR},`))
      .sort((a, b) => parseInt(a.split(",")[1]) - parseInt(b.split(",")[1]))
      .map((key) => gridDataRef.current[key])
      .join("");

    setQueue((prev) => {
      if (prev.find((q) => q.id === "student_1")) {
        speakText("Hand is already raised.");
        return prev;
      }
      const newQueue = [
        ...prev,
        {
          id: "student_1",
          name: "Kelvin Mwangi",
          timestamp: "Just now",
          currentLineText,
        },
      ];
      playBellSound();
      speakText(`Hand raised. You are number ${newQueue.length} in the queue.`);
      setComputeStatus(`Hand raised. Queue position: ${newQueue.length}`);
      return newQueue;
    });
  }, [speakText]);

  const simulateBroadcastReply = useCallback(
    (student: string) => {
      const r = activeCellRef.current.r;
      let lineText = "";
      Object.keys(gridDataRef.current)
        .filter((key) => key.startsWith(`${r},`))
        .sort((a, b) => parseInt(a.split(",")[1]) - parseInt(b.split(",")[1]))
        .forEach((key) => (lineText += gridDataRef.current[key]));
      lineText = lineText.trim() || "(Empty line)";

      setIsBroadcastPaletteOpen(false);
      speakText(`Sent line to ${student}.`);
      setComputeStatus(`Sent line to ${student}.`);

      setTimeout(() => {
        playDoorbellSound();
        speakText(
          `Received reply from ${student} in rough work. Click the reply button to view.`,
        );
        setComputeStatus(`Received reply from ${student} in rough work.`);
        setBroadcastReply({
          student,
          lineText,
          mockFeedback:
            student === "Amina"
              ? "Hey I think you missed a negative sign when moving the 4 over"
              : "Are you sure that's simplified? Try multiplying both sides by 2.",
        });
      }, 8000);
    },
    [speakText],
  );

  const openBroadcastDialog = useCallback(() => {
    setIsBroadcastPaletteOpen(true);
    setBroadcastSelectedIndex(0);
    speakText("Ask who? Use arrows to scroll through classmates.");
    setComputeStatus("Broadcast line. Ask who?");
  }, [speakText]);

  const toggleGroupWork = useCallback(() => {
    setIsGroupWork((prev) => {
      if (!prev) {
        setHasControl(true);
        setActivePeer("Amina");
        speakText("Group work started. You have control.");
        setComputeStatus("Group work started. You have control.");
        return true;
      } else {
        if (groupWorkTimeoutRef.current)
          clearTimeout(groupWorkTimeoutRef.current);
        speakText("Group work ended.");
        setComputeStatus("Group work ended.");
        setHasControl(true);
        return false;
      }
    });
  }, [speakText]);

  const passControl = useCallback(() => {
    if (!isGroupWork || !hasControl) return;
    setHasControl(false);
    speakText(`Control passed to ${activePeer}.`);
    setComputeStatus(`Control passed to ${activePeer}.`);

    // Simulate peer working and passing control back
    if (groupWorkTimeoutRef.current) clearTimeout(groupWorkTimeoutRef.current);
    groupWorkTimeoutRef.current = setTimeout(() => {
      if (isGroupWork) {
        setHasControl(true);
        playDoorbellSound();
        speakText("You have control.");
        setComputeStatus("You have control.");
      }
    }, 15000); // 15 seconds simulate
  }, [isGroupWork, hasControl, activePeer, speakText]);

  useEffect(() => {
    if (missingPingAlert) {
      playPingSound();
      speakText("Reminder: Please submit your assignment.");
      setComputeStatus("Reminder: Please submit your assignment.");
      setMissingPingAlert(false);
    }
  }, [missingPingAlert, speakText]);

  const toggleSubmission = useCallback(() => {
    setIsSubmitted((prev) => {
      const next = !prev;
      if (next) {
        playWhooshLockSound();
        speakText(
          "Assignment submitted successfully. Entering read-only mode.",
        );
        setComputeStatus(
          "Assignment submitted successfully. Entering read-only mode.",
        );
      } else {
        playWhooshUnlockSound();
        speakText("Submission recalled. Editing restored.");
        setComputeStatus("Submission recalled. Editing restored.");
      }
      return next;
    });
  }, [speakText]);

  const toggleScratchpad = useCallback(() => {
    setIsScratchpadOpen((prev) => {
      if (!prev) {
        setMainWorkspace({
          gridData: gridDataRef.current,
          activeCell: activeCellRef.current,
          computedAnswers: computedAnswersRef.current,
          blocks: blocksRef.current,
        });
        setGridData(scratchpadWorkspace.gridData);
        setActiveCell(scratchpadWorkspace.activeCell);
        setComputedAnswers(scratchpadWorkspace.computedAnswers);
        setBlocks(scratchpadWorkspace.blocks);
        playScratchpadOpenSound();
        speakText("Scratchpad open. Work here is not saved or graded.");
        return true;
      } else {
        setScratchpadWorkspace({
          gridData: gridDataRef.current,
          activeCell: activeCellRef.current,
          computedAnswers: computedAnswersRef.current,
          blocks: blocksRef.current,
        });
        setGridData(mainWorkspace.gridData);
        setActiveCell(mainWorkspace.activeCell);
        setComputedAnswers(mainWorkspace.computedAnswers);
        setBlocks(mainWorkspace.blocks);
        playScratchpadCloseSound();
        speakText(`Returned to Line ${mainWorkspace.activeCell.r + 1}`);
        return false;
      }
    });
    setTimeout(() => document.getElementById("grid-input")?.focus(), 50);
  }, [mainWorkspace, scratchpadWorkspace, speakText]);

  useEffect(() => {
    suggestionRef.current = suggestion;
    if (suggestion) {
      if (lastSpokenSuggestionRef.current !== suggestion.symbol) {
        speakText(`Suggestion: ${suggestion.name}. Press Tab to accept.`);
        lastSpokenSuggestionRef.current = suggestion.symbol;
      }
    } else {
      lastSpokenSuggestionRef.current = null;
    }
  }, [suggestion, speakText]);

  const activeCellRef = useRef(activeCell);
  const commandPaletteInputRef = useRef<HTMLInputElement>(null);
  const paletteListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeCellRef.current = activeCell;
  }, [activeCell]);

  useEffect(() => {
    gridDataRef.current = gridData;
    setBlocks(getEquationBlocks(gridData));
  }, [gridData]);

  const generateDiffDescription = (
    prev: Record<string, string>,
    next: Record<string, string>,
    activeCellRow: number,
    isUndo: boolean = false,
  ) => {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);

    const added: string[] = [];
    const removed: string[] = [];

    for (const key of nextKeys) {
      if (prev[key] !== next[key]) added.push(key);
    }
    for (const key of prevKeys) {
      if (!(key in next)) removed.push(key);
    }

    const getSymbolName = (char: string) => {
      const match =
        MATH_SYMBOLS.find((s) => s.symbol === char) ||
        AUTOCOMPLETE_DICT.find((d) => d.symbol === char);
      return match ? match.name : char;
    };

    const verbAdd = isUndo ? "Restored" : "Added";
    const verbRemove = isUndo ? "Reverted addition of" : "Deleted";
    const verbModify = isUndo ? "Restored" : "Modified";

    if (added.length === 1 && removed.length === 0) {
      const char = next[added[0]];
      const r = parseInt(added[0].split(",")[0]) + 1;
      return `${verbAdd} ${getSymbolName(char)} on line ${r}`;
    } else if (removed.length === 1 && added.length === 0) {
      const char = prev[removed[0]];
      const r = parseInt(removed[0].split(",")[0]) + 1;
      return `${verbRemove} ${getSymbolName(char)} on line ${r}`;
    } else if (added.length === 0 && removed.length === 0) {
      return "no changes";
    } else if (added.length > 0 && removed.length > 0) {
      return `${verbModify} contents on line ${parseInt(added[0].split(",")[0]) + 1}`;
    } else if (added.length > 1) {
      return `${verbAdd} multiple items on line ${parseInt(added[0].split(",")[0]) + 1}`;
    } else if (removed.length > 1) {
      return `${verbRemove} multiple items on line ${parseInt(removed[0].split(",")[0]) + 1}`;
    }

    return "updated grid";
  };

  useEffect(() => {
    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      return;
    }

    const isScratch = isScratchpadOpenRef.current;
    const workspaceKey = isScratch ? "scratch" : "main";
    const historyStack = historyRef.current[workspaceKey];
    const currentIndex = historyIndexRef.current[workspaceKey];

    const lastState = historyStack[currentIndex];

    if (JSON.stringify(lastState.gridData) !== JSON.stringify(gridData)) {
      const desc = generateDiffDescription(
        lastState.gridData,
        gridData,
        activeCellRef.current.r,
      );
      const newStack = historyStack.slice(0, currentIndex + 1);
      newStack.push({
        gridData,
        activeCell: activeCellRef.current,
        desc,
      });
      historyRef.current[workspaceKey] = newStack;
      historyIndexRef.current[workspaceKey] = newStack.length - 1;
    }
  }, [gridData]);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  useEffect(() => {
    computedAnswersRef.current = computedAnswers;
  }, [computedAnswers]);

  const executeUndo = useCallback(() => {
    const isScratch = isScratchpadOpenRef.current;
    const wk = isScratch ? "scratch" : "main";
    const currentIndex = historyIndexRef.current[wk];
    const stack = historyRef.current[wk];

    if (currentIndex > 0) {
      const prevState = stack[currentIndex - 1];
      const currState = stack[currentIndex];
      isUndoRedoActionRef.current = true;
      setGridData(prevState.gridData);
      setActiveCell(prevState.activeCell);
      historyIndexRef.current[wk] = currentIndex - 1;
      const diffDesc = generateDiffDescription(
        currState.gridData,
        prevState.gridData,
        prevState.activeCell.r,
        true,
      );
      speakText(`Undo: ${diffDesc}`);
    } else {
      speakText("Nothing to undo");
    }
  }, [speakText]);

  const executeRedo = useCallback(() => {
    const isScratch = isScratchpadOpenRef.current;
    const wk = isScratch ? "scratch" : "main";
    const currentIndex = historyIndexRef.current[wk];
    const stack = historyRef.current[wk];

    if (currentIndex < stack.length - 1) {
      const nextState = stack[currentIndex + 1];
      isUndoRedoActionRef.current = true;
      setGridData(nextState.gridData);
      setActiveCell(nextState.activeCell);
      historyIndexRef.current[wk] = currentIndex + 1;
      speakText(`Redo: ${nextState.desc}`);
    } else {
      speakText("Nothing to redo");
    }
  }, [speakText]);

  useEffect(() => {
    // When Kelvin arrow-keys down to the flagged line:
    // Web Audio Earcon: A cautious dual-tone alert sound
    // ARIA Live Announcement: "Line X flagged by teacher. Note: ..."
    const mockFlag = (window as any).mockFlaggedLine;
    if (mockFlag && mockFlag.r === activeCell.r) {
      playAlertSound();
      const msg = `Line ${activeCell.r + 1} flagged by teacher. Note: ${mockFlag.feedback}. Cloned structure is editable to correct your mistake.`;
      speakText(msg);
      setComputeStatus(msg);
      // Clear after announcing so we don't announce repeatedly endlessly if they stay on it
      (window as any).mockFlaggedLine = null;
    }
  }, [activeCell.r, speakText]);

  const executeEvaluateMath = useCallback(() => {
    const activeR = activeCellRef.current.r;
    let currentBlock = blocksRef.current.find(
      (b) =>
        b.r === activeR &&
        activeCellRef.current.c >= b.minC - 1 &&
        activeCellRef.current.c <= b.maxC + 1,
    );

    if (!currentBlock) {
      const lineBlocks = blocksRef.current
        .filter((b) => b.r === activeR)
        .sort((a, b) => a.minC - b.minC);
      if (lineBlocks.length > 0) {
        currentBlock = {
          text: lineBlocks.map((b) => b.text).join(""),
          maxC: lineBlocks[lineBlocks.length - 1].maxC,
        } as any;
      }
    }

    if (currentBlock) {
      try {
        let textToEvalOrig = currentBlock.text;

        const tryEval = (text: string) => {
          let t = text
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/√/g, "sqrt")
            .replace(/π/g, "pi")
            .replace(/∑/g, "sum")
            .replace(/=/g, "");
          if (t.trim() === "") throw new Error("Empty expression");
          const res = evaluate(t);
          return typeof res === "number" && !Number.isInteger(res)
            ? Number(res.toFixed(4))
            : res;
        };

        let formattedResult = null;
        let success = false;
        let lastErr = null;

        if (textToEvalOrig.includes("=")) {
          const parts = textToEvalOrig.split("=");
          try {
            formattedResult = tryEval(parts[0]);
            success = true;
          } catch (e: any) {
            lastErr = e;
          }

          if (!success && parts.length > 1) {
            try {
              formattedResult = tryEval(parts[1]);
              success = true;
            } catch (e: any) {
              lastErr = e;
            }
          }
        }

        if (!success) {
          try {
            formattedResult = tryEval(textToEvalOrig);
            success = true;
          } catch (e: any) {
            lastErr = e;
          }
        }

        if (!success) {
          throw lastErr || new Error("Invalid expression");
        }

        const msg = `Evaluates to: ${formattedResult}`;
        setComputeStatus(msg);
        setComputedAnswers((prev) => [
          ...prev.filter((a) => a.r !== activeR),
          {
            id: Date.now().toString(),
            text: `=${formattedResult}`,
            r: activeR,
            c: Math.max(activeCellRef.current.c, currentBlock!.maxC + 1),
            type: "success",
          },
        ]);
        speakText(msg);
      } catch (err: any) {
        const msg = `Compute error: ${err.message}`;
        setComputeStatus(msg);
        setComputedAnswers((prev) => [
          ...prev.filter((a) => a.r !== activeR),
          {
            id: Date.now().toString(),
            text: err.message,
            r: activeR,
            c: Math.max(activeCellRef.current.c, currentBlock!.maxC + 1),
            type: "error",
          },
        ]);
        speakText(msg);
        playErrorSound();
      }
    }
  }, [speakText]);

  useEffect(() => {}, [isScratchpadOpen]);

  useEffect(() => {
    const currentBlock = blocks.find(
      (b) =>
        b.r === activeCell.r &&
        activeCell.c >= b.minC - 1 &&
        activeCell.c <= b.maxC + 1,
    );
    if (currentBlock && currentBlock.id !== lastBlockRef.current) {
      speakText(`Equation block: ${currentBlock.text}`);
      lastBlockRef.current = currentBlock.id;
    } else if (!currentBlock && lastBlockRef.current) {
      speakText(`Blank row ${activeCell.r + 1}`);
      lastBlockRef.current = null;
    }
  }, [activeCell, blocks, speakText]);

  useEffect(() => {
    let c = activeCell.c - 1;
    let word = "";
    while (
      c >= 0 &&
      gridData[`${activeCell.r},${c}`] &&
      gridData[`${activeCell.r},${c}`].trim() !== ""
    ) {
      word = gridData[`${activeCell.r},${c}`] + word;
      c--;
    }

    if (word.length >= 1) {
      const match = AUTOCOMPLETE_DICT.find((d) =>
        d.prefix?.startsWith(word.toLowerCase()),
      );
      if (match && word.toLowerCase() !== match.symbol.toLowerCase()) {
        setSuggestion({
          symbol: match.symbol,
          name: match.name,
          length: word.length,
          startC: c + 1,
        });
        return;
      }
    }
    setSuggestion(null);
  }, [gridData, activeCell]);

  const triggerContextLocator = useCallback(() => {
    const worksheet = isScratchpadOpenRef.current
      ? "Scratchpad"
      : "Main Worksheet";

    let maxR = 9; // At least 10 lines
    const keys = Object.keys(gridDataRef.current);
    if (keys.length > 0) {
      maxR = Math.max(maxR, ...keys.map((k) => parseInt(k.split(",")[0])));
    }
    const totalLines = maxR + 1;
    const currentLine = activeCellRef.current.r + 1;

    let cellInfo = "";
    const currentCol = activeCellRef.current.c;
    const currentCellContent =
      gridDataRef.current[`${activeCellRef.current.r},${currentCol}`];
    if (currentCellContent) {
      const symbolMatch =
        MATH_SYMBOLS.find((s) => s.symbol === currentCellContent) ||
        AUTOCOMPLETE_DICT.find((d) => d.symbol === currentCellContent);
      const symbolName = symbolMatch ? symbolMatch.name : currentCellContent;
      cellInfo = `The cell contains: ${symbolName}.`;
    } else {
      cellInfo = `The cell is empty.`;
    }

    const lineBlocks = blocksRef.current
      .filter((b) => b.r === activeCellRef.current.r)
      .sort((a, b) => a.minC - b.minC);
    let lineInfo = "";
    if (lineBlocks.length > 0) {
      const blocksText = lineBlocks.map((b) => b.text).join(" ");
      lineInfo = `The line contains: ${blocksText}.`;
    } else {
      lineInfo = `The line is empty.`;
    }

    speakText(
      `Worksheet: ${worksheet}. You are on Line ${currentLine} of ${totalLines}. Focused on column ${currentCol + 1}. ${lineInfo} ${cellInfo}`,
    );
  }, [speakText]);

  const NAV_ACTIONS = [
    "toggle_submission",
    "reset_next_user",
    "save_lesson",
    "refresh_equation",
    "start_new_lesson",
    "hear_explanation",
    "next_question",
    "toggle_mute",
    "focus_navbar",
    "open_calculator",
  ];

  const rawFilteredSymbols = paletteSearch
    ? MATH_SYMBOLS.filter((s) => {
        const term = paletteSearch.toLowerCase();
        return (
          s.name.toLowerCase().includes(term) ||
          s.symbol.toLowerCase().includes(term)
        );
      })
    : [
        { symbol: "√", name: "Square Root function" },
        { symbol: "π", name: "Pi Constant function" },
        { symbol: "e", name: "Euler's Number Constant function" },
        { symbol: "∑", name: "Summation Calculus function" },
        { symbol: "sin", name: "Sine Trigonometry function" },
        { symbol: "cos", name: "Cosine Trigonometry function" },
        { symbol: "tan", name: "Tangent Trigonometry function" },
        { symbol: "log", name: "Logarithm (Base 10) function" },
        { symbol: "^", name: "Exponent / Power Operator" },
        { symbol: "+", name: "Plus / Addition Operator" },
        { symbol: "-", name: "Minus / Subtraction Operator" },
        { symbol: "×", name: "Multiply / Times Operator" },
        { symbol: "÷", name: "Divide Operator" },
        { symbol: "=", name: "Equals Operator" },
        { symbol: "½", name: "Insert Fraction", action: "insert_fraction" },
        { symbol: "🙋‍♂️", name: "Raise Hand (Queue)", action: "raise_hand" },
        {
          symbol: "🚀",
          name: "Submit (Ctrl + S)",
          action: "toggle_submission",
        },
        {
          symbol: "🔄",
          name: "Reset for Next User (Ctrl + R)",
          action: "reset_next_user",
        },
        { symbol: "💾", name: "Save Lesson", action: "save_lesson" },
        {
          symbol: "🔁",
          name: "Refresh to Default Equation",
          action: "refresh_equation",
        },
        { symbol: "📄", name: "Start New Lesson", action: "start_new_lesson" },
        { symbol: "▶️", name: "Hear Explanation", action: "hear_explanation" },
        { symbol: "⏭️", name: "Next Question", action: "next_question" },
        { symbol: "🔇", name: "Toggle Audio Engine", action: "toggle_mute" },
        { symbol: "🎯", name: "Focus Navbar", action: "focus_navbar" },
        {
          symbol: "🧮",
          name: "Voice-Assisted Calculator (Alt + C)",
          action: "open_calculator",
        },
      ];

  const filteredSymbols = [...rawFilteredSymbols].sort((a, b) => {
    const isA = NAV_ACTIONS.includes((a as any).action);
    const isB = NAV_ACTIONS.includes((b as any).action);
    if (isA && !isB) return 1;
    if (!isA && isB) return -1;
    return 0;
  });

  const ctrlPressedAt = useRef<number>(0);
  const otherKeyPressed = useRef<boolean>(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control" || e.key === "Meta") {
        if (ctrlPressedAt.current === 0) {
          ctrlPressedAt.current = Date.now();
          otherKeyPressed.current = false;
        }
      } else {
        otherKeyPressed.current = true;
      }
    };
    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control" || e.key === "Meta") {
        if (
          !otherKeyPressed.current &&
          ctrlPressedAt.current > 0 &&
          Date.now() - ctrlPressedAt.current < 500
        ) {
          setIsAudioMuted((prev) => !prev);
          if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        }
        ctrlPressedAt.current = 0;
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown, { capture: true });
    window.addEventListener("keyup", handleGlobalKeyUp, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, {
        capture: true,
      });
      window.removeEventListener("keyup", handleGlobalKeyUp, { capture: true });
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hush / Pause Audio instantly on Ctrl or Escape
      if (e.key === "Control" || e.key === "Escape") {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      }

      // Alt + C: Open/Close voice-assisted calculator
      if (e.altKey && (e.key.toLowerCase() === "c" || e.code === "KeyC")) {
        e.preventDefault();
        setIsCalculatorOpen((prev) => {
          if (prev) {
            speakText("Calculator closed");
            setTimeout(
              () => document.getElementById("grid-input")?.focus(),
              50,
            );
            return false;
          } else {
            return true;
          }
        });
        return;
      }

      // Alt + T: Focus top navigation bar
      if (e.altKey && (e.key.toLowerCase() === "t" || e.code === "KeyT")) {
        e.preventDefault();
        const toolbar = document.querySelector('[role="toolbar"]');
        if (toolbar) {
          const focusables = Array.from(
            toolbar.querySelectorAll<HTMLElement>("button, input"),
          ).filter(
            (el) =>
              !el.hasAttribute("disabled") &&
              el.offsetParent !== null &&
              (el.tagName !== "INPUT" ||
                (el as HTMLInputElement).type === "button" ||
                (el as HTMLInputElement).type === "text" ||
                (el as HTMLInputElement).type === "date"),
          );

          if (focusables.length > 0) {
            const activeItem =
              focusables.find((el) => el.tabIndex === 0) || focusables[0];
            activeItem.focus();
            speakText(
              "Navbar focused. Use left and right arrow keys to navigate.",
            );
          }
        }
        return;
      }

      // Save/Submit (Ctrl + S or Cmd + S)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        toggleSubmission();
        return;
      }

      // Reset for next user (Ctrl + R or Cmd + R)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
        resetForNextUser();
        return;
      }

      // Contextual Hint (Ctrl + H or Cmd + H)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") {
        e.preventDefault();
        giveHint();
        return;
      }

      // Toolkit shortcut (Ctrl + K or Cmd + K)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Toggle Command Palette with Ctrl+M or Cmd+M
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Reply to Broadcast with Ctrl+J or Cmd+J
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        if (broadcastReply && !isScratchpadOpen) {
          toggleScratchpad();
        }
        return;
      }

      // Group Work with Ctrl+G or Cmd+G
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        toggleGroupWork();
        return;
      }

      // Help Menu with Shift + ?
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        setIsHelpMenuOpen((prev) => !prev);
        return;
      }

      // Pass control with Ctrl+P or Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        passControl();
        return;
      }

      // Undo
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "z" &&
        !e.shiftKey
      ) {
        e.preventDefault();
        if (isSubmitted) return;
        executeUndo();
        return;
      }

      // Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        if (isSubmitted) return;
        executeRedo();
        return;
      }

      // Raise Hand (Queue System)
      if (e.key.toLowerCase() === "h") {
        const now = Date.now();
        if (now - lastHPressTime.current < 500) {
          consecutiveHCount.current += 1;
        } else {
          consecutiveHCount.current = 1;
        }
        lastHPressTime.current = now;

        if (consecutiveHCount.current === 3) {
          e.preventDefault();
          consecutiveHCount.current = 0;

          setGridData((prev) => {
            const newData = { ...prev };
            const r = activeCellRef.current.r;
            const c = activeCellRef.current.c;
            let deletedCount = 0;
            if (newData[`${r},${c - 1}`]?.toLowerCase() === "h") {
              delete newData[`${r},${c - 1}`];
              delete gridDataRef.current[`${r},${c - 1}`];
              deletedCount++;
            }
            if (newData[`${r},${c - 2}`]?.toLowerCase() === "h") {
              delete newData[`${r},${c - 2}`];
              delete gridDataRef.current[`${r},${c - 2}`];
              deletedCount++;
            }
            if (deletedCount > 0) {
              setActiveCell({ r, c: Math.max(0, c - deletedCount) });
              activeCellRef.current = { r, c: Math.max(0, c - deletedCount) };
            }
            return newData;
          });

          executeRaiseHand();
          return;
        }
      } else if (
        e.key !== "Escape" &&
        e.key !== "Shift" &&
        !e.key?.startsWith("Arrow") &&
        e.key?.toLowerCase() !== "b"
      ) {
        consecutiveHCount.current = 0;
      }

      // Broadcast Line System
      if (e.key.toLowerCase() === "b") {
        const now = Date.now();
        if (now - lastBPressTime.current < 500) {
          consecutiveBCount.current += 1;
        } else {
          consecutiveBCount.current = 1;
        }
        lastBPressTime.current = now;

        if (consecutiveBCount.current === 3) {
          e.preventDefault();
          consecutiveBCount.current = 0;

          setGridData((prev) => {
            const newData = { ...prev };
            const r = activeCellRef.current.r;
            const c = activeCellRef.current.c;
            let deletedCount = 0;
            if (newData[`${r},${c - 1}`]?.toLowerCase() === "b") {
              delete newData[`${r},${c - 1}`];
              delete gridDataRef.current[`${r},${c - 1}`];
              deletedCount++;
            }
            if (newData[`${r},${c - 2}`]?.toLowerCase() === "b") {
              delete newData[`${r},${c - 2}`];
              delete gridDataRef.current[`${r},${c - 2}`];
              deletedCount++;
            }
            if (deletedCount > 0) {
              setActiveCell({ r, c: Math.max(0, c - deletedCount) });
              activeCellRef.current = { r, c: Math.max(0, c - deletedCount) };
            }
            return newData;
          });

          openBroadcastDialog();
          return;
        }
      } else if (
        e.key !== "Escape" &&
        e.key !== "Shift" &&
        !e.key?.startsWith("Arrow") &&
        e.key?.toLowerCase() !== "h"
      ) {
        consecutiveBCount.current = 0;
      }

      // Toggle Scratchpad (Rough Work)
      if (e.altKey && e.code === "KeyR") {
        e.preventDefault();
        toggleScratchpad();
        return;
      }

      if (
        e.key === "Escape" &&
        !isCommandPaletteOpen &&
        !isBroadcastPaletteOpen &&
        !isHelpMenuOpen &&
        isScratchpadOpenRef.current
      ) {
        e.preventDefault();
        toggleScratchpad();
        return;
      }

      const activeTag = document.activeElement?.tagName.toLowerCase();
      const activeId = document.activeElement?.id;

      // Where Am I? Context Locator on Double-Click Shift
      if (e.key === "Shift") {
        const now = Date.now();
        if (now - lastShiftPressTime.current < 500) {
          consecutiveShiftCount.current += 1;
        } else {
          consecutiveShiftCount.current = 1;
        }
        lastShiftPressTime.current = now;

        if (consecutiveShiftCount.current === 2) {
          e.preventDefault();
          consecutiveShiftCount.current = 0;
          triggerContextLocator();
          return;
        }
      }

      // Allow normal typing if focused on an input when palette/help is closed
      if (
        !isCommandPaletteOpen &&
        !isHelpMenuOpen &&
        !isBroadcastPaletteOpen &&
        activeTag === "input" &&
        activeId !== "grid-input"
      )
        return;

      if (!isCommandPaletteOpen && !isHelpMenuOpen && !isBroadcastPaletteOpen) {
        if (
          e.altKey &&
          (e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "PageUp" ||
            e.key === "PageDown")
        ) {
          e.preventDefault();
          const isUp = e.key === "ArrowUp" || e.key === "PageUp";
          const newR = isUp
            ? Math.max(0, activeCellRef.current.r - 1)
            : activeCellRef.current.r + 1;
          setActiveCell({ r: newR, c: 0 });

          const lineBlocks = blocksRef.current
            .filter((b) => b.r === newR)
            .sort((a, b) => a.minC - b.minC);
          if (lineBlocks.length > 0) {
            speakText(
              `Line ${newR + 1}: ${lineBlocks.map((b) => b.text).join(" ")}`,
            );
          } else {
            speakText(`Line ${newR + 1} is empty`);
          }
          setTimeout(() => document.getElementById("grid-input")?.focus(), 0);
          return;
        } else if (e.key === "Enter" && e.shiftKey) {
          e.preventDefault();
          if (isSubmitted) return;
          const currentRow = activeCellRef.current.r;
          const newRow = currentRow + 1;

          setGridData((prev) => {
            const newData = { ...prev };
            const keys = Object.keys(newData);

            // Shift rows down to make space (push everything from newRow downwards)
            const keysToShift = keys
              .filter((k) => parseInt(k.split(",")[0]) >= newRow)
              .sort(
                (a, b) => parseInt(b.split(",")[0]) - parseInt(a.split(",")[0]),
              );
            keysToShift.forEach((k) => {
              const [rStr, cStr] = k.split(",");
              newData[`${parseInt(rStr) + 1},${cStr}`] = newData[k];
              delete newData[k];
            });

            // Clone currentRow to newRow
            const currentRowKeys = keys.filter(
              (k) => parseInt(k.split(",")[0]) === currentRow,
            );
            currentRowKeys.forEach((k) => {
              const [, cStr] = k.split(",");
              newData[`${newRow},${cStr}`] = newData[k];
            });

            return newData;
          });

          setComputedAnswers((prev) =>
            prev.map((a) => (a.r >= newRow ? { ...a, r: a.r + 1 } : a)),
          );

          // Re-compute blocks or let the existing useEffect for gridData do it
          // It's probably handled by setGridData, but we set focus and announce
          setActiveCell({ r: newRow, c: 0 });
          playCloneSound();

          const msg = `Line ${newRow + 1} created. Copied Line ${currentRow + 1} structure. Focused on Equation Root.`;
          setComputeStatus(msg);
          speakText(msg);

          setTimeout(() => document.getElementById("grid-input")?.focus(), 0);
          return;
        } else if (e.key === "Enter") {
          e.preventDefault();
          setActiveCell((prev) => ({ r: prev.r + 1, c: 0 }));
          setTimeout(() => document.getElementById("grid-input")?.focus(), 0);
          return;
        } else if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          e.preventDefault();
          setActiveCell((prev) => {
            let { r, c } = prev;
            if (e.key === "ArrowUp") r = Math.max(0, r - 1);
            if (e.key === "ArrowDown") r++;
            if (e.key === "ArrowLeft") c = Math.max(0, c - 1);
            if (e.key === "ArrowRight") c++;
            return { r, c };
          });
          setTimeout(() => document.getElementById("grid-input")?.focus(), 0);
        } else if (e.key === "Tab") {
          e.preventDefault();
          if (suggestionRef.current) {
            const sug = suggestionRef.current;
            setGridData((prev) => {
              const next = { ...prev };
              for (let i = 0; i < sug.length; i++) {
                delete next[`${activeCellRef.current.r},${sug.startC + i}`];
              }
              for (let i = 0; i < sug.symbol.length; i++) {
                next[`${activeCellRef.current.r},${sug.startC + i}`] =
                  sug.symbol[i];
              }
              return next;
            });
            setActiveCell({
              r: activeCellRef.current.r,
              c: sug.startC + sug.symbol.length,
            });
            speakText(sug.name);
            setSuggestion(null);
            setTimeout(() => document.getElementById("grid-input")?.focus(), 0);
            return;
          }

          const dir = e.shiftKey ? -1 : 1;
          const sortedBlocks = [...blocksRef.current].sort((a, b) => {
            if (a.r !== b.r) return a.r - b.r;
            return a.minC - b.minC;
          });

          if (sortedBlocks.length > 0) {
            const currentIndex = sortedBlocks.findIndex(
              (b) =>
                b.r === activeCellRef.current.r &&
                activeCellRef.current.c >= b.minC - 1 &&
                activeCellRef.current.c <= b.maxC + 1,
            );

            let nextBlock = null;
            if (currentIndex !== -1) {
              let nextIndex = currentIndex + dir;
              if (nextIndex >= 0 && nextIndex < sortedBlocks.length) {
                nextBlock = sortedBlocks[nextIndex];
              } else {
                nextBlock =
                  sortedBlocks[dir === 1 ? 0 : sortedBlocks.length - 1];
              }
            } else {
              if (dir === 1) {
                nextBlock =
                  sortedBlocks.find(
                    (b) =>
                      b.r > activeCellRef.current.r ||
                      (b.r === activeCellRef.current.r &&
                        b.minC > activeCellRef.current.c),
                  ) || sortedBlocks[0];
              } else {
                nextBlock =
                  [...sortedBlocks]
                    .reverse()
                    .find(
                      (b) =>
                        b.r < activeCellRef.current.r ||
                        (b.r === activeCellRef.current.r &&
                          b.maxC < activeCellRef.current.c),
                    ) || sortedBlocks[sortedBlocks.length - 1];
              }
            }

            if (nextBlock) {
              setActiveCell({
                r: nextBlock.r,
                c: dir === 1 ? nextBlock.maxC + 1 : nextBlock.minC,
              });
              setTimeout(
                () => document.getElementById("grid-input")?.focus(),
                0,
              );
            }
          }
        } else if (e.key === "=" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          if (isSubmitted) return;
          executeEvaluateMath();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isCommandPaletteOpen,
    isHelpMenuOpen,
    isBroadcastPaletteOpen,
    toggleScratchpad,
    isSubmitted,
    broadcastReply,
    isScratchpadOpen,
  ]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setPaletteSearch("");
      setPaletteSelectedIndex(0);
      setTimeout(() => commandPaletteInputRef.current?.focus(), 50);
    } else {
      setTimeout(() => document.getElementById("grid-input")?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Ensure selected index is valid when search changes
  useEffect(() => {
    setPaletteSelectedIndex(0);
  }, [paletteSearch]);

  const selectedSymbolName = filteredSymbols[paletteSelectedIndex]?.name;

  useEffect(() => {
    if (isCommandPaletteOpen && selectedSymbolName) {
      speakText(selectedSymbolName);
    }
  }, [isCommandPaletteOpen, selectedSymbolName, speakText]);

  const gridStyle = {
    backgroundColor: "transparent",
    backgroundImage: `linear-gradient(#333 1.5px, transparent 1.5px), linear-gradient(90deg, #333 1.5px, transparent 1.5px)`,
    backgroundSize: "46px 46px",
  };

  const handleRowClick = (e: React.MouseEvent<HTMLLIElement>, r: number) => {
    if (isCommandPaletteOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const c = Math.max(0, Math.floor(x / 46));
    setActiveCell({ r, c });
    setTimeout(() => document.getElementById("grid-input")?.focus(), 0);
  };

  const activeRowKeys = Object.keys(gridData).map((k) =>
    parseInt(k.split(",")[0], 10),
  );
  const maxRowIndex = Math.max(
    activeCell.r,
    activeRowKeys.length > 0 ? Math.max(...activeRowKeys) : 0,
  );
  const rowsList = Array.from({ length: maxRowIndex + 1 }).map((_, i) => i);

  const validateMathInput = (char: string, cell: { r: number; c: number }) => {
    if (!char) return { isValid: true, message: "" };

    const isDivisionOrMultiplication = ["/", "*", "×", "÷"].includes(char);
    const isOperator = ["+", "-", "=", ...["/", "*", "×", "÷"]].includes(char);

    if (cell.c === 0 && isOperator) {
      let name = char;
      if (char === "/") name = "division slash";
      if (char === "*") name = "asterisk";
      if (char === "×") name = "multiply sign";
      if (char === "÷") name = "divide sign";
      if (char === "=") name = "equals sign";
      if (char === "+") name = "plus sign";
      if (char === "-") name = "minus sign";
      return {
        isValid: false,
        message: `You started the line with a ${name}. You might have accidentally pressed the wrong key.`,
      };
    }

    if (isDivisionOrMultiplication) {
      let name = char;
      if (char === "/") name = "division slash";
      if (char === "*") name = "asterisk";
      if (char === "×") name = "multiply sign";
      if (char === "÷") name = "divide sign";
      return {
        isValid: false,
        message: `You typed a ${name}, but this problem only requires addition and subtraction.`,
      };
    }

    const allowedLetters = [
      "r",
      "R",
      "b",
      "B",
      "h",
      "H",
      "p",
      "P",
      "i",
      "I",
      "s",
      "S",
      "a",
      "A",
      "t",
      "T",
    ];
    if (/[a-zA-Z]/.test(char) && !allowedLetters.includes(char)) {
      return {
        isValid: false,
        message: `You typed a letter. This problem only requires numbers, addition, subtraction, equals, and parentheses.`,
      };
    }

    const whitelist = /^[0-9+\-=().,<>!a-zA-Z]$/;
    const nemethSymbols = [
      "√",
      "π",
      "∑",
      "∫",
      "α",
      "β",
      "θ",
      "≠",
      "≤",
      "≥",
      "→",
      "⟨",
      "⟩",
      "∞",
      "½",
    ];
    if (
      !whitelist.test(char) &&
      !isDivisionOrMultiplication &&
      !isOperator &&
      !nemethSymbols.includes(char)
    ) {
      return {
        isValid: false,
        message: `You typed an out of scope character. This problem only requires numbers, addition, subtraction, equals, and parentheses.`,
      };
    }

    return { isValid: true, message: "" };
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitted) return;
    const val = e.target.value.slice(-1);

    if (val === "") {
      setGridData((prev) => ({
        ...prev,
        [`${activeCell.r},${activeCell.c}`]: val,
      }));
      return;
    }

    const validation = validateMathInput(val, activeCell);
    if (!validation.isValid) {
      speakText(validation.message);
      setInputError({ r: activeCell.r, c: activeCell.c });
      setTimeout(() => setInputError(null), 300);
      return;
    }

    let matchedNemeth = null;
    for (const nemeth of NEMETH_DICT) {
      const len = nemeth.ascii.length;
      let matchStr = "";
      let isValid = true;
      for (let i = len - 1; i >= 1; i--) {
        const prevChar = gridData[`${activeCell.r},${activeCell.c - i}`];
        if (!prevChar) {
          isValid = false;
          break;
        }
        matchStr += prevChar;
      }
      matchStr += val;

      if (isValid && matchStr === nemeth.ascii) {
        matchedNemeth = nemeth;
        break;
      }
    }

    if (matchedNemeth) {
      const len = matchedNemeth.ascii.length;
      setGridData((prev) => {
        const next = { ...prev };
        for (let i = 1; i < len; i++) {
          delete next[`${activeCell.r},${activeCell.c - i}`];
        }
        next[`${activeCell.r},${activeCell.c - len + 1}`] =
          matchedNemeth.symbol;
        return next;
      });
      setActiveCell((prev) => ({ r: prev.r, c: prev.c - len + 2 }));
      speakText(`Nemeth shortcut translated: ${matchedNemeth.name}`);
    } else {
      setGridData((prev) => ({
        ...prev,
        [`${activeCell.r},${activeCell.c}`]: val,
      }));
      setActiveCell((prev) => ({ ...prev, c: prev.c + 1 }));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSubmitted) {
      if (e.key === "Backspace") {
        e.preventDefault();
        setActiveCell((prev) => ({ ...prev, c: Math.max(0, prev.c - 1) }));
      }
      return;
    }

    if (e.key.toLowerCase() === "r") {
      const now = Date.now();
      if (now - lastRPressTime.current < 500) {
        consecutiveRCount.current += 1;
      } else {
        consecutiveRCount.current = 1;
      }
      lastRPressTime.current = now;

      if (consecutiveRCount.current === 3) {
        e.preventDefault();
        consecutiveRCount.current = 0;

        setGridData((prev) => {
          const next = { ...prev };
          delete next[`${activeCell.r},${activeCell.c - 1}`];
          delete next[`${activeCell.r},${activeCell.c - 2}`];
          return next;
        });
        setActiveCell((prev) => ({ ...prev, c: Math.max(0, prev.c - 2) }));

        toggleScratchpad();
        return;
      }
    } else if (
      e.key !== "Backspace" &&
      e.key !== "Shift" &&
      !e.key?.startsWith("Arrow")
    ) {
      consecutiveRCount.current = 0;
    }

    const currentVal = gridData[`${activeCell.r},${activeCell.c}`] || "";

    if (e.key === "Backspace" && !currentVal) {
      e.preventDefault();
      setGridData((prev) => {
        const next = { ...prev };
        delete next[`${activeCell.r},${Math.max(0, activeCell.c - 1)}`];
        return next;
      });
      setActiveCell((prev) => ({ ...prev, c: Math.max(0, prev.c - 1) }));
    }
  };

  const insertMultipleSymbols = (symbols: string[]) => {
    setGridData((prev) => {
      const next = { ...prev };
      let currentC = activeCell.c;
      symbols.forEach((sym) => {
        next[`${activeCell.r},${currentC}`] = sym;
        currentC++;
      });
      return next;
    });
    setActiveCell((prev) => ({ ...prev, c: prev.c + symbols.length }));
  };

  const insertSymbol = (symbol: string) => {
    const validation = validateMathInput(symbol, activeCell);
    if (!validation.isValid) {
      speakText(validation.message);
      setIsCommandPaletteOpen(false);
      setInputError({ r: activeCell.r, c: activeCell.c });
      setTimeout(() => setInputError(null), 300);
      return;
    }

    setGridData((prev) => ({
      ...prev,
      [`${activeCell.r},${activeCell.c}`]: symbol,
    }));
    setActiveCell((prev) => ({ ...prev, c: prev.c + 1 }));
    setIsCommandPaletteOpen(false);
  };

  const handleHelpMenuKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const item = HELP_MENU_ITEMS[helpMenuSelectedIndex];
      if (item) {
        setIsHelpMenuOpen(false);
        if (item.action === "toggle_mute") {
          setIsAudioMuted((prev) => !prev);
          if (!isAudioMuted && "speechSynthesis" in window)
            window.speechSynthesis.cancel();
        } else if (item.action === "focus_navbar") {
          setTimeout(() => {
            const toolbar = document.querySelector('[role="toolbar"]');
            if (toolbar) {
              const focusables = Array.from(
                toolbar.querySelectorAll<HTMLElement>("button, input"),
              ).filter(
                (el) =>
                  !el.hasAttribute("disabled") &&
                  el.offsetParent !== null &&
                  (el.tagName !== "INPUT" ||
                    (el as HTMLInputElement).type === "button" ||
                    (el as HTMLInputElement).type === "text" ||
                    (el as HTMLInputElement).type === "date"),
              );

              if (focusables.length > 0) {
                const activeItem =
                  focusables.find((el) => el.tabIndex === 0) || focusables[0];
                activeItem.focus();
                speakText(
                  "Navbar focused. Use left and right arrow keys to navigate.",
                );
              }
            }
          }, 50);
        } else if (item.action === "command_palette")
          setIsCommandPaletteOpen(true);
        else if (item.action === "evaluate_math") executeEvaluateMath();
        else if (item.action === "open_calculator") {
          setIsCommandPaletteOpen(false);
          setIsCalculatorOpen(true);
        } else if (item.action === "raise_hand") executeRaiseHand();
        else if (item.action === "toggle_scratchpad") toggleScratchpad();
        else if (item.action === "context_locator") triggerContextLocator();
        else if (item.action === "undo") executeUndo();
        else if (item.action === "redo") executeRedo();
        else if (item.action === "broadcast_line") openBroadcastDialog();
        else if (item.action === "pass_control") passControl();
        else if (item.action === "start_group_work") toggleGroupWork();
        else if (item.action === "toggle_submission") toggleSubmission();
        else if (item.action === "reset_next_user") resetForNextUser();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHelpMenuSelectedIndex((prev) =>
        prev < HELP_MENU_ITEMS.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHelpMenuSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsHelpMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isHelpMenuOpen && HELP_MENU_ITEMS[helpMenuSelectedIndex]) {
      speakText(HELP_MENU_ITEMS[helpMenuSelectedIndex].text);
    }
  }, [isHelpMenuOpen, helpMenuSelectedIndex, speakText]);

  useEffect(() => {
    if (isHelpMenuOpen) {
      setHelpMenuSelectedIndex(0);
      setTimeout(() => helpMenuInputRef.current?.focus(), 50);
    }
  }, [isHelpMenuOpen]);

  useEffect(() => {
    if (isBroadcastPaletteOpen) {
      setBroadcastSelectedIndex(0);
      setTimeout(() => broadcastInputRef.current?.focus(), 50);
    }
  }, [isBroadcastPaletteOpen]);

  useEffect(() => {
    if (
      isBroadcastPaletteOpen &&
      broadcastStudentList[broadcastSelectedIndex]
    ) {
      speakText(broadcastStudentList[broadcastSelectedIndex]);
    }
  }, [isBroadcastPaletteOpen, broadcastSelectedIndex, speakText]);

  useEffect(() => {
    if (isBroadcastPaletteOpen && broadcastRef.current) {
      const selectedEl = broadcastRef.current.children[
        broadcastSelectedIndex
      ] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [broadcastSelectedIndex, isBroadcastPaletteOpen]);

  useEffect(() => {
    if (isHelpMenuOpen && helpMenuRef.current) {
      const selectedEl = helpMenuRef.current.children[
        helpMenuSelectedIndex
      ] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [helpMenuSelectedIndex, isHelpMenuOpen]);

  const handlePaletteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault(); // Prevent tabbing out of the modal, Arrow keys handle navigation
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setPaletteSelectedIndex((prev) => (prev + 1) % filteredSymbols.length);
      scrollPaletteItemIntoView(
        (paletteSelectedIndex + 1) % filteredSymbols.length,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setPaletteSelectedIndex(
        (prev) => (prev - 1 + filteredSymbols.length) % filteredSymbols.length,
      );
      scrollPaletteItemIntoView(
        (paletteSelectedIndex - 1 + filteredSymbols.length) %
          filteredSymbols.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filteredSymbols[paletteSelectedIndex];
      if (item) {
        if ((item as any).action === "raise_hand") {
          setIsCommandPaletteOpen(false);
          executeRaiseHand();
        } else if ((item as any).action === "broadcast_line") {
          setIsCommandPaletteOpen(false);
          openBroadcastDialog();
        } else if ((item as any).action === "toggle_scratchpad") {
          setIsCommandPaletteOpen(false);
          toggleScratchpad();
        } else if ((item as any).action === "context_locator") {
          setIsCommandPaletteOpen(false);
          triggerContextLocator();
        } else if ((item as any).action === "start_group_work") {
          setIsCommandPaletteOpen(false);
          toggleGroupWork();
        } else if ((item as any).action === "insert_fraction") {
          setIsCommandPaletteOpen(false);
          setFractionNum("");
          setFractionDen("");
          setIsFractionDialogOpen(true);
          setTimeout(() => fractionNumRef.current?.focus(), 50);
        } else if ((item as any).action === "toggle_submission") {
          setIsCommandPaletteOpen(false);
          toggleSubmission();
        } else if ((item as any).action === "reset_next_user") {
          setIsCommandPaletteOpen(false);
          resetForNextUser();
        } else if ((item as any).action === "save_lesson") {
          setIsCommandPaletteOpen(false);
          saveLesson();
        } else if ((item as any).action === "refresh_equation") {
          setIsCommandPaletteOpen(false);
          refreshEquation();
        } else if ((item as any).action === "start_new_lesson") {
          setIsCommandPaletteOpen(false);
          startNewLesson();
        } else if ((item as any).action === "hear_explanation") {
          setIsCommandPaletteOpen(false);
          hearExplanation();
        } else if ((item as any).action === "next_question") {
          setIsCommandPaletteOpen(false);
          nextQuestion();
        } else {
          insertSymbol(item.symbol);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsCommandPaletteOpen(false);
    } else if ((e.ctrlKey || e.altKey) && e.key.toLowerCase() === "r") {
      e.preventDefault();
      if (filteredSymbols[paletteSelectedIndex]) {
        speakText(filteredSymbols[paletteSelectedIndex].name);
      }
    }
  };

  const scrollPaletteItemIntoView = (index: number) => {
    if (paletteListRef.current) {
      const item = paletteListRef.current.children[index] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest", behavior: "auto" });
      }
    }
  };

  if (currentView === "teacher") {
    return (
      <TeacherFeedView
        queue={queue}
        onTeacherReady={(studentId) => {
          setQueue((prev) => prev.filter((q) => q.id !== studentId));
          if (studentId === "student_1") {
            setTeacherReadyAlert(true);
          }
        }}
        onPingMissing={() => setMissingPingAlert(true)}
        onBackToStudent={() => setCurrentView("student")}
        onMockFeedbackGiven={(submissionId, lineId, feedback) => {
          // This simulates receiving feedback from the teacher
          setTimeout(() => {
            speakText(
              `Niaje Kelvin! You have 1 review from Mrs. Mutuku on Algebraic Linear Equations. Press Enter to open.`,
            );
            setComputeStatus("New feedback received from teacher.");
            // Store simple mock flag just to demonstrate the loop later
            (window as any).mockFlaggedLine = {
              r: parseInt(lineId.replace("L", "")) - 1, // basic mock map to row
              feedback: feedback,
            };
          }, 1000);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans select-none relative bg-[#0a0a0a]">
      <div aria-live="polite" className="sr-only">
        {suggestion
          ? `Suggestion: ${suggestion.name}. Press Tab to accept.`
          : ""}
      </div>
      <div aria-live="assertive" className="sr-only">
        {computeStatus}
      </div>
      <div className="relative z-10 flex flex-col pointer-events-auto shadow-md">
        {/* Status Bar */}
        <div className="flex justify-start items-center px-4 py-1.5 bg-[#163e5b] text-[#b4c9da] text-sm font-semibold h-[24px]">
          {isGroupWork && (
            <span
              className={`px-2 py-0.5 rounded-sm text-base uppercase tracking-wider font-bold ${
                hasControl
                  ? "bg-green-500/20 text-green-300 border border-green-400/30"
                  : "bg-orange-500/20 text-orange-300 border border-orange-400/30"
              }`}
            >
              Group Work:{" "}
              {hasControl
                ? "You have control"
                : `Read-Only (${activePeer} has control)`}
            </span>
          )}
          <button
            onClick={() => setCurrentView("teacher")}
            onMouseEnter={() => speakText("Open Teacher View")}
            onFocus={() => speakText("Open Teacher View")}
            className="flex items-center gap-1.5 px-2 py-0.5 ml-8 rounded-sm bg-blue-500/10 hover:bg-blue-500/30 border border-blue-400/20 hover:border-blue-400/50 text-base uppercase tracking-wider font-bold transition-all text-[#b4c9da] hover:text-white outline-none focus:ring-1 focus:ring-white/20"
            title="Open Teacher Feed View"
          >
            Teacher View
          </button>
        </div>

        <div
          className="flex justify-between items-center h-14 bg-[#163e5b] text-white pl-2 pr-4 md:pr-8 lg:pr-12 border-b-2 border-transparent relative z-20"
          role="toolbar"
          aria-label="Main Toolbar"
          onKeyDown={handleToolbarKeyDown}
        >
          {broadcastReply && !isScratchpadOpen && (
            <div
              className="absolute inset-x-0 bottom-0 h-[3px] bg-[#facc15] shadow-[0_3px_15px_rgba(250,204,21,0.8)] z-30 animate-pulse [animation-duration:3s]"
              aria-hidden="true"
            ></div>
          )}
          <div className="flex items-center w-auto max-w-[45%] lg:max-w-[30%] shrink min-w-0 pr-2">
            <button
              onMouseEnter={() => speakText("Go back")}
              onFocus={() => speakText("Go back")}
              className="hover:bg-white/10 rounded p-1 ml-1 cursor-pointer transition-colors focus:outline-none focus:ring-[8px] focus:ring-[#facc15] shrink-0"
              tabIndex={0}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-90"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="flex items-center text-lg sm:text-[14px] tracking-wide font-medium space-x-1 sm:space-x-2 ml-2 min-w-0 overflow-x-auto no-scrollbar mask-fade-right py-3">
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                readOnly={isSubmitted}
                tabIndex={-1}
                onMouseEnter={() => speakText(`Class: ${className}`)}
                onFocus={() => speakText(`Class: ${className}`)}
                className="bg-transparent outline-none w-[70px] sm:w-[90px] border-b border-transparent focus:border-transparent focus:ring-[8px] focus:ring-[#facc15] px-1 py-0.5 rounded cursor-text hover:bg-white/5 transition-colors placeholder-[#b4c9da]/50 flex-shrink-0"
                placeholder="Class"
              />
              <span className="text-[#316995] font-light flex-shrink-0">/</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full border-[1.5px] border-[#f4a261]"></div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  readOnly={isSubmitted}
                  tabIndex={-1}
                  onMouseEnter={() => speakText(`Subject: ${subject}`)}
                  onFocus={() => speakText(`Subject: ${subject}`)}
                  className="bg-transparent outline-none w-[80px] sm:w-[100px] border-b border-transparent focus:border-transparent focus:ring-[8px] focus:ring-[#facc15] px-1 py-0.5 rounded cursor-text hover:bg-white/5 transition-colors placeholder-white uppercase tracking-widest text-base sm:text-lg text-white font-semibold focus:text-white"
                  placeholder="SUBJECT"
                />
              </div>
              <span className="text-[#316995] font-light flex-shrink-0">/</span>
              <div className="bg-[#1a4b6e] rounded flex-shrink-0 relative">
                <input
                  type="text"
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  readOnly={isSubmitted}
                  tabIndex={-1}
                  onMouseEnter={() => speakText(`Lesson: ${lesson}`)}
                  onFocus={() => speakText(`Lesson: ${lesson}`)}
                  className="bg-transparent outline-none min-w-[70px] max-w-[200px] px-2 py-0.5 cursor-text hover:bg-white/10 transition-colors placeholder-white/50 text-center text-white text-base sm:text-lg tracking-widest uppercase box-content focus:ring-[8px] focus:ring-[#facc15] rounded"
                  style={{ width: `${Math.max(lesson.length, 6) * 1.1}ch` }}
                  placeholder="LESSON"
                />
              </div>
              <span className="text-[#316995] font-light flex-shrink-0">/</span>
              <div className="relative flex items-center gap-1.5 flex-shrink-0 cursor-pointer group hover:bg-white/5 p-1 -m-1 rounded transition-colors">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#b4c9da]"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span className="text-[#b4c9da] group-hover:text-white transition-colors text-base sm:text-lg tracking-wide whitespace-nowrap">
                  {(() => {
                    if (!date) return "DATE";
                    const d = new Date(date + "T00:00:00");
                    if (isNaN(d.getTime())) return "DATE";
                    return d.toLocaleString("default", {
                      month: "short",
                      day: "numeric",
                    });
                  })()}
                </span>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isSubmitted}
                  tabIndex={-1}
                  onMouseEnter={() => speakText(`Date: ${date}`)}
                  onFocus={() => speakText(`Date: ${date}`)}
                  className="absolute inset-0 opacity-0 focus:opacity-100 focus:bg-[#163e5b] focus:text-white focus:ring-[8px] focus:ring-[#facc15] rounded outline-none cursor-pointer w-full z-10"
                />
              </div>
            </div>
          </div>

          {/* Centered Controls Overlay */}
          <div className="absolute left-1/2 bottom-0 translate-y-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-[40]">
            {broadcastReply && !isScratchpadOpen && (
              <button
                onClick={() => toggleScratchpad()}
                tabIndex={-1}
                className="text-base font-extrabold px-4 py-1.5 rounded-full bg-[#facc15] text-[#112a3d] hover:bg-[#e6b800] pointer-events-auto shadow-[0_4px_20px_rgba(250,204,21,0.4)] backdrop-blur-md transition-all flex items-center gap-2 whitespace-nowrap outline-none focus:ring-[8px] focus:ring-[#facc15] focus:ring-offset-2 focus:ring-offset-[#163e5b]"
              >
                <MessageSquare size={16} className="text-[#112a3d]" />
                Reply from {broadcastReply.student}
              </button>
            )}
          </div>

          <div className="flex items-center overflow-x-auto no-scrollbar flex-1 min-w-0 px-2 sm:px-4 py-3 gap-0.5 sm:gap-2 [&>*]:shrink-0">
            <button
              onClick={executeRaiseHand}
              tabIndex={-1}
              onMouseEnter={() => speakText("Raise Hand for help")}
              onFocus={() => speakText("Raise Hand for help")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent hover:bg-white/10 border border-transparent text-base font-medium transition-all text-[#b4c9da] hover:text-white outline-none focus:ring-[8px] focus:ring-[#facc15] focus:ring-offset-2 focus:ring-offset-[#163e5b] whitespace-nowrap shrink-0 ml-auto"
            >
              <Hand size={18} />
              <span className="hidden xl:inline">Hand</span>
            </button>
            <button
              onClick={refreshEquation}
              tabIndex={-1}
              onMouseEnter={() => speakText("Refresh to default equation")}
              onFocus={() => speakText("Refresh to default equation")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent hover:bg-white/10 border border-transparent text-base font-medium transition-all text-[#b4c9da] hover:text-white outline-none focus:ring-[8px] focus:ring-[#facc15] focus:ring-offset-2 focus:ring-offset-[#163e5b] whitespace-nowrap shrink-0"
            >
              <RefreshCw size={18} />
              <span className="hidden xl:inline">Refresh</span>
            </button>
            <button
              onClick={startNewLesson}
              tabIndex={-1}
              onMouseEnter={() => speakText("Start a new lesson")}
              onFocus={() => speakText("Start a new lesson")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent hover:bg-white/10 border border-transparent text-base font-medium transition-all text-[#b4c9da] hover:text-white outline-none focus:ring-[8px] focus:ring-[#facc15] focus:ring-offset-2 focus:ring-offset-[#163e5b] whitespace-nowrap shrink-0"
            >
              <FilePlus size={18} />
              <span className="hidden xl:inline">New</span>
            </button>

            <div className="w-[1px] h-6 bg-[#316995]/30 mx-0.5 sm:mx-1 shrink-0 hidden sm:block"></div>

            {isSubmitted ? (
              <>
                <button
                  onClick={hearExplanation}
                  tabIndex={-1}
                  onMouseEnter={() =>
                    speakText("Hear explanation of your work")
                  }
                  onFocus={() => speakText("Hear explanation of your work")}
                  className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 border border-transparent hover:border-blue-300 text-lg lg:text-base font-medium transition-all text-white shadow-sm outline-none focus:ring-[8px] focus:ring-[#facc15] focus:ring-offset-2 focus:ring-offset-[#163e5b] whitespace-nowrap shrink-0"
                  title="Hear explanation of your work"
                >
                  <PlayCircle size={18} />
                  <span className="hidden xl:inline">Explain</span>
                </button>
                <button
                  onClick={nextQuestion}
                  tabIndex={-1}
                  onMouseEnter={() => speakText("Proceed to next question")}
                  onFocus={() => speakText("Proceed to next question")}
                  className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 border border-transparent hover:border-green-300 text-lg lg:text-base font-medium transition-all text-white shadow-sm outline-none focus:ring-[8px] focus:ring-[#facc15] focus:ring-offset-2 focus:ring-offset-[#163e5b] whitespace-nowrap shrink-0"
                  title="Proceed to next question"
                >
                  <ArrowRight size={18} />
                  <span className="hidden xl:inline">Next</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={resetForNextUser}
                  tabIndex={-1}
                  onMouseEnter={() =>
                    speakText(
                      "Press Control+R or command+R to clear all inputs for the next student.",
                    )
                  }
                  onFocus={() =>
                    speakText(
                      "Press Control+R or command+R to clear all inputs for the next student.",
                    )
                  }
                  className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-md bg-transparent hover:bg-red-500/20 border border-transparent text-lg lg:text-base font-medium transition-all text-red-400 hover:text-red-300 outline-none focus:ring-[8px] focus:ring-[#facc15] focus:ring-offset-2 focus:ring-offset-[#163e5b] whitespace-nowrap shrink-0"
                  title="Reset for next user"
                >
                  <RefreshCw size={18} />
                  <span className="hidden xl:inline">Reset</span>
                </button>
                <button
                  onClick={saveLesson}
                  tabIndex={-1}
                  onMouseEnter={() => speakText("Save current lesson")}
                  onFocus={() => speakText("Save current lesson")}
                  className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-md bg-transparent hover:bg-white/10 border border-transparent text-lg lg:text-base font-medium transition-all text-[#b4c9da] hover:text-white outline-none focus:ring-[8px] focus:ring-[#facc15] focus:ring-offset-2 focus:ring-offset-[#163e5b] whitespace-nowrap shrink-0"
                  title="Save current lesson"
                >
                  <Save size={18} />
                  <span className="hidden xl:inline">Save</span>
                </button>
                <button
                  onClick={toggleSubmission}
                  tabIndex={-1}
                  onMouseEnter={() =>
                    speakText(
                      "Submit assignment. Shortcut is Command or Control S.",
                    )
                  }
                  onFocus={() =>
                    speakText(
                      "Submit assignment. Shortcut is Command or Control S.",
                    )
                  }
                  className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 border border-transparent hover:border-cyan-300 text-lg lg:text-base font-medium transition-all text-white shadow-sm outline-none focus:ring-[8px] focus:ring-[#facc15] focus:ring-offset-2 focus:ring-offset-[#163e5b] whitespace-nowrap shrink-0"
                  title="Submit assignment"
                >
                  <Send size={18} />
                  <span className="hidden xl:inline">Submit</span>
                </button>
              </>
            )}

            <div className="w-[1px] h-6 bg-[#316995]/30 mx-0.5 lg:mx-1 shrink-0 hidden sm:block"></div>

            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              tabIndex={-1}
              onMouseEnter={() =>
                speakText(
                  "Open Math Tool Palette. Shortcut is Command or Control K.",
                )
              }
              onFocus={() =>
                speakText(
                  "Open Math Tool Palette. Shortcut is Command or Control K.",
                )
              }
              className="flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-md bg-transparent hover:bg-white/10 border border-transparent text-lg lg:text-base font-medium transition-all text-[#b4c9da] hover:text-white outline-none focus:ring-[8px] focus:ring-[#facc15] focus:ring-offset-2 focus:ring-offset-[#163e5b] whitespace-nowrap shrink-0"
              title="Open Math Tool Palette"
            >
              <Calculator size={18} />
              <span className="hidden xl:inline">Toolkit</span>
              <kbd className="hidden lg:inline-block bg-white/20 border border-white/50 rounded px-1.5 py-0.5 text-base font-mono text-white font-bold whitespace-nowrap">
                ⌘K
              </kbd>
            </button>

            {/* Spacer to ensure last item is fully visible and has padding in scrollable container */}
            <div className="w-2 sm:w-4 shrink-0" aria-hidden="true"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-row pointer-events-auto h-full w-full relative z-0 overflow-hidden">
        {/* Main Workspace */}
        <div
          className={`transition-all duration-500 ease-out flex-1 relative h-full flex flex-col overflow-y-auto ${isScratchpadOpen ? "w-1/2 -translate-x-4 opacity-30 pointer-events-none" : "w-full translate-x-0 opacity-100"}`}
        >
          <nav
            aria-label="Lesson Notes"
            tabIndex={0}
            onFocus={() => {
              speakText(
                "Module 4: Operations. The Rules of Integers. When adding and subtracting integers, remember these key concepts: 1. Adding a negative is like subtracting a positive. a + (-b) = a - b. 2. Subtracting a negative is like adding a positive. a - (-b) = a + b.",
              );
            }}
            onKeyDown={(e) => {
              if (e.key.length === 1 || e.key === "Enter") {
                e.preventDefault();
                playErrorSound();
              }
            }}
            className="shrink-0 bg-[#0c1f2e] border-b-[2px] border-[#316995]/30 p-8 shadow-sm relative focus:ring-2 focus:ring-inset focus:ring-blue-500 outline-none"
          >
            <div className="max-w-3xl mx-auto space-y-6 text-[#b4c9da]">
              <div className="flex items-center gap-3 text-blue-400">
                <h2 className="text-base font-bold uppercase tracking-widest text-[#ffffff]">
                  Module 4: Operations
                </h2>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  The Rules of Integers
                </h1>
                <p className="text-[#86a8c3] text-lg leading-relaxed">
                  When adding and subtracting integers, remember these key
                  concepts:
                </p>
              </div>
              <div className="bg-[#112a3d] rounded-lg p-6 border border-[#316995]/20 font-mono text-center shadow-inner mt-4">
                <p className="mb-4">
                  1. Adding a negative is like subtracting a positive:
                  <br /> <span className="text-white">a + (-b) = a - b</span>
                </p>
                <p>
                  2. Subtracting a negative is like adding a positive:
                  <br /> <span className="text-white">a - (-b) = a + b</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAudioMuted(!isAudioMuted);
                if (!isAudioMuted && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              aria-pressed={isAudioMuted}
              tabIndex={-1}
              className={`absolute top-4 right-4 pointer-events-auto flex items-center justify-center gap-1.5 h-8 px-3 rounded-md font-bold text-base tracking-wide outline-none transition-all focus:ring-[8px] focus:ring-[#facc15] focus:ring-offset-2 focus:ring-offset-[#163e5b] bg-[#FFFF00] text-black hover:bg-[#e6e600] shadow-sm`}
            >
              {!isAudioMuted ? (
                <Volume2 size={16} className="shrink-0" />
              ) : (
                <VolumeX size={16} className="shrink-0" />
              )}
              <span className="whitespace-nowrap shrink-0 hidden sm:inline-block">
                {!isAudioMuted ? "ON" : "MUTED"}
              </span>
            </button>
          </nav>

          <main
            aria-label="Assignment Canvas"
            className="flex-1 relative pb-20"
          >
            <ol className="list-decimal pl-[72px] pr-8 py-8 space-y-4 font-sans text-lg font-bold text-[#b4c9da] marker:text-[#86a8c3]">
              {Array.from({
                length:
                  Math.max(
                    isScratchpadOpen
                      ? mainWorkspace.activeCell.r
                      : activeCell.r,
                    Object.keys(
                      isScratchpadOpen ? mainWorkspace.gridData : gridData,
                    )
                      .map((k) => parseInt(k.split(",")[0], 10))
                      .reduce((a, b) => Math.max(a, b), 0),
                  ) + 1,
              }).map((_, r) => {
                const currentGridData = isScratchpadOpen
                  ? mainWorkspace.gridData
                  : gridData;
                const currentActiveCell = isScratchpadOpen
                  ? mainWorkspace.activeCell
                  : activeCell;
                const currentBlocks = isScratchpadOpen
                  ? mainWorkspace.blocks
                  : blocks;
                const currentComputedAnswers = isScratchpadOpen
                  ? mainWorkspace.computedAnswers
                  : computedAnswers;
                const isActiveView = !isScratchpadOpen;

                return (
                  <li
                    key={`main-${r}`}
                    className="relative min-h-[46px] w-[max-content] min-w-full cursor-text"
                    onClick={(e) => isActiveView && handleRowClick(e, r)}
                  >
                    <div
                      className="absolute inset-x-0 inset-y-0 z-0 pointer-events-none transition-colors duration-300 rounded"
                      style={
                        bgType === "grid"
                          ? gridStyle
                          : { backgroundColor: "transparent" }
                      }
                    />
                    <div className="relative z-10 h-[46px]">
                      {currentBlocks
                        .filter((b) => b.r === r)
                        .map((block) => (
                          <div
                            key={block.id}
                            className="absolute pointer-events-none"
                            style={{
                              top: 0,
                              left: block.minC * 46,
                              height: 46,
                            }}
                          >
                            {block.cells.map((cell) => (
                              <div
                                key={`${cell.c}`}
                                className="absolute flex items-center justify-center text-[24px] font-medium text-cyan-400 font-sans"
                                style={{
                                  left: (cell.c - block.minC) * 46,
                                  width: 46,
                                  height: 46,
                                }}
                              >
                                {cell.val}
                              </div>
                            ))}
                          </div>
                        ))}

                      {isActiveView && currentActiveCell.r === r && (
                        <input
                          id="grid-input"
                          className={`absolute flex items-center justify-center text-[24px] font-medium text-center outline-none m-0 p-0 font-sans cursor-text transition-colors duration-200 z-20 ${
                            inputError?.r === currentActiveCell.r &&
                            inputError?.c === currentActiveCell.c
                              ? "bg-red-900/30 border-2 border-red-500 text-red-500 animate-[pulse_0.15s_ease-in-out_2]"
                              : `text-cyan-400 ${
                                  bgType === "grid"
                                    ? "bg-[#112a3d]/50 border-2 border-cyan-400 ring-2 ring-inset ring-[#0a0a0a] shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                    : "bg-transparent border-[2.5px] border-cyan-400/0 focus:border-cyan-400/50 caret-cyan-400"
                                }`
                          }`}
                          style={{
                            top: 0,
                            left: currentActiveCell.c * 46,
                            width: 46,
                            height: 46,
                          }}
                          value={
                            currentGridData[
                              `${currentActiveCell.r},${currentActiveCell.c}`
                            ] || ""
                          }
                          onChange={handleCellChange}
                          onKeyDown={handleInputKeyDown}
                          readOnly={isSubmitted || (isGroupWork && !hasControl)}
                          tabIndex={!isGroupWork || hasControl ? 0 : -1}
                          autoComplete="off"
                          autoFocus
                        />
                      )}

                      {isActiveView &&
                        suggestion &&
                        currentActiveCell.r === r && (
                          <div
                            className="absolute bg-[#163e5b]/95 backdrop-blur-md border border-[#316995]/50 text-white px-3 py-2 rounded-lg shadow-xl text-base font-sans font-medium whitespace-nowrap z-50 pointer-events-none flex flex-col origin-top-left animate-in fade-in zoom-in-95 duration-100"
                            style={{
                              top: 46 + 4,
                              left: suggestion.startC * 46,
                            }}
                          >
                            <div className="flex items-baseline gap-2 mb-1.5">
                              <span className="text-white text-[18px] font-medium leading-none">
                                {suggestion.symbol}
                              </span>
                              <span className="text-[#b4c9da] text-sm font-light tracking-wide">
                                {suggestion.name}
                              </span>
                            </div>
                            <div className="text-[9px] text-[#86a8c3] bg-black/40 px-2 py-1 rounded-[4px] uppercase tracking-widest leading-none inline-block text-center font-bold">
                              Tap Tab to accept
                            </div>
                          </div>
                        )}

                      {currentComputedAnswers
                        .filter((a) => a.r === r)
                        .map((answer) => (
                          <div
                            key={answer.id}
                            className={`absolute rounded-[8px] shadow-sm z-0 pointer-events-none flex items-center overflow-hidden origin-left animate-in fade-in zoom-in-95 duration-200 ${
                              answer.type === "success"
                                ? "bg-[#e4ecbe] border-[2.5px] border-[#163e5b] text-[#163e5b]"
                                : "bg-red-100 border-[2.5px] border-red-500 text-red-900"
                            }`}
                            style={{
                              top: 0,
                              left: answer.c * 46,
                              height: 46,
                              marginLeft: answer.type === "success" ? 0 : 8,
                            }}
                          >
                            {answer.type === "success" ? (
                              answer.text.split("").map((char, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-center text-[24px] font-medium font-sans w-[46px] h-full shrink-0"
                                >
                                  {char}
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center justify-center text-[18px] font-medium font-sans h-full px-4 shrink-0 whitespace-nowrap">
                                {answer.text}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </li>
                );
              })}
            </ol>
          </main>
        </div>

        {/* Scratchpad Drawer */}
        <div
          className={`absolute top-0 right-0 h-full bg-[#1A1A1A] border-l border-white/10 shadow-2xl transition-all duration-500 ease-out z-20 flex flex-col ${isScratchpadOpen ? "w-1/2 translate-x-0" : "w-[0px] translate-x-full overflow-hidden"}`}
        >
          <div className="px-6 py-4 bg-[#111] border-b border-white/5 flex justify-between items-center shadow-sm shrink-0">
            <div>
              <h2 className="text-base font-bold tracking-widest text-[#e8e8e8] uppercase">
                Scratchpad
              </h2>
              <p className="text-sm text-[#888] mt-1 font-light">
                Work here is not saved or graded
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={toggleScratchpad}
                className="hidden sm:inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 transition-colors border border-white/10 rounded px-2 py-1 text-base font-mono text-white/70"
                title="Close Scratchpad (Esc)"
              >
                Close
                <span className="text-[9px] opacity-70 border border-white/20 rounded px-1 ml-1 font-sans">
                  Esc
                </span>
              </button>
            </div>
          </div>

          <div className="flex-1 relative overflow-y-auto">
            {broadcastReply && (
              <div className="m-6 mb-2 p-5 rounded-2xl bg-cyan-900/30 border border-cyan-400/40 text-[#b4c9da] shadow-lg relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="bg-cyan-400/20 text-cyan-300 px-2.5 py-1 rounded-md text-base font-bold uppercase tracking-widest ring-1 ring-cyan-400/30 flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-cyan-400" />
                    Peer Reply
                  </div>
                  <div className="text-base font-semibold text-white">
                    from {broadcastReply.student}
                  </div>
                  <button
                    onClick={() => setBroadcastReply(null)}
                    className="ml-auto text-cyan-400/60 hover:text-cyan-300 transition-colors bg-cyan-900/40 p-1.5 rounded-full hover:bg-cyan-800/60"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="bg-[#0c1f2e]/80 p-4 rounded-xl font-mono text-center text-2xl text-cyan-400 mb-4 shadow-inner border border-cyan-900 ring-1 ring-inset ring-black/50 relative z-10 font-bold">
                  {broadcastReply.lineText}
                </div>
                <div className="flex items-start gap-3 bg-cyan-950/50 p-3.5 rounded-xl border border-cyan-800/30 relative z-10">
                  <div className="mt-0.5 text-cyan-400 shrink-0 bg-cyan-900/50 p-1.5 rounded-full">
                    <MessageSquare size={14} className="fill-cyan-400/20" />
                  </div>
                  <div className="text-base leading-relaxed text-cyan-100 font-medium">
                    {broadcastReply.mockFeedback}
                  </div>
                </div>
              </div>
            )}
            <ol className="list-decimal pl-[72px] pr-8 py-8 space-y-4 font-sans text-lg font-bold text-gray-500 marker:text-gray-700">
              {Array.from({ length: maxRowIndex + 1 }).map((_, r) => {
                const isActiveView = isScratchpadOpen;
                const currentGridData = gridData;
                const currentActiveCell = activeCell;
                const currentBlocks = blocks;
                const currentComputedAnswers = computedAnswers;

                return (
                  <li
                    key={`scratch-${r}`}
                    className="relative min-h-[46px] w-[max-content] min-w-full cursor-text"
                    onClick={(e) => isActiveView && handleRowClick(e, r)}
                  >
                    <div
                      className="absolute inset-x-0 inset-y-0 z-0 pointer-events-none transition-colors duration-300 rounded"
                      style={
                        bgType === "grid"
                          ? {
                              backgroundColor: "transparent",
                              backgroundImage: `linear-gradient(#333 1.5px, transparent 1.5px), linear-gradient(90deg, #333 1.5px, transparent 1.5px)`,
                              backgroundSize: "46px 46px",
                            }
                          : { backgroundColor: "transparent" }
                      }
                    />
                    <div className="relative z-10 h-[46px]">
                      {currentBlocks
                        .filter((b) => b.r === r)
                        .map((block) => (
                          <div
                            key={block.id}
                            className="absolute pointer-events-none"
                            style={{
                              top: 0,
                              left: block.minC * 46,
                              height: 46,
                            }}
                          >
                            {block.cells.map((cell) => (
                              <div
                                key={`${cell.c}`}
                                className="absolute flex items-center justify-center text-[24px] font-medium text-[#e8e8e8] font-sans"
                                style={{
                                  left: (cell.c - block.minC) * 46,
                                  width: 46,
                                  height: 46,
                                }}
                              >
                                {cell.val}
                              </div>
                            ))}
                          </div>
                        ))}

                      {isActiveView && currentActiveCell.r === r && (
                        <input
                          id="grid-input"
                          className={`absolute flex items-center justify-center text-[24px] font-medium text-center outline-none m-0 p-0 font-sans cursor-text transition-colors duration-200 z-20 ${
                            inputError?.r === currentActiveCell.r &&
                            inputError?.c === currentActiveCell.c
                              ? "bg-red-900/30 border-2 border-red-500 text-red-500 animate-[pulse_0.15s_ease-in-out_2]"
                              : `text-cyan-400 ${
                                  bgType === "grid"
                                    ? "bg-[#112a3d]/50 border-2 border-cyan-400 ring-2 ring-inset ring-[#0a0a0a] shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                    : "bg-transparent border-[2.5px] border-cyan-400/0 focus:border-cyan-400/50 caret-cyan-400"
                                }`
                          }`}
                          style={{
                            top: 0,
                            left: currentActiveCell.c * 46,
                            width: 46,
                            height: 46,
                          }}
                          value={
                            currentGridData[
                              `${currentActiveCell.r},${currentActiveCell.c}`
                            ] || ""
                          }
                          onChange={handleCellChange}
                          onKeyDown={handleInputKeyDown}
                          readOnly={isSubmitted || (isGroupWork && !hasControl)}
                          tabIndex={!isGroupWork || hasControl ? 0 : -1}
                          autoComplete="off"
                          autoFocus
                        />
                      )}

                      {isActiveView &&
                        suggestion &&
                        currentActiveCell.r === r && (
                          <div
                            className="absolute bg-[#333]/95 backdrop-blur-md border border-gray-600 text-white px-3 py-2 rounded-lg shadow-xl text-base font-sans font-medium whitespace-nowrap z-50 pointer-events-none flex flex-col origin-top-left animate-in fade-in zoom-in-95 duration-100"
                            style={{
                              top: 46 + 4,
                              left: suggestion.startC * 46,
                            }}
                          >
                            <div className="flex items-baseline gap-2 mb-1.5">
                              <span className="text-white text-[18px] font-medium leading-none">
                                {suggestion.symbol}
                              </span>
                              <span className="text-gray-400 text-sm font-light tracking-wide">
                                {suggestion.name}
                              </span>
                            </div>
                            <div className="text-[9px] text-gray-500 bg-black/60 px-2 py-1 rounded-[4px] uppercase tracking-widest leading-none inline-block text-center font-bold">
                              Tap Tab to accept
                            </div>
                          </div>
                        )}

                      {currentComputedAnswers
                        .filter((a) => a.r === r)
                        .map((answer) => (
                          <div
                            key={answer.id}
                            className={`absolute rounded-[8px] shadow-sm z-0 pointer-events-none flex items-center overflow-hidden origin-left animate-in fade-in zoom-in-95 duration-200 ${
                              answer.type === "success"
                                ? "bg-[#2a3022] border-[2.5px] border-[#4a5839] text-[#a4c982]"
                                : "bg-red-950 border-[2.5px] border-red-800 text-red-400"
                            }`}
                            style={{
                              top: 0,
                              left: answer.c * 46,
                              height: 46,
                              marginLeft: answer.type === "success" ? 0 : 8,
                            }}
                          >
                            {answer.type === "success" ? (
                              answer.text.split("").map((char, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-center text-[24px] font-medium font-sans w-[46px] h-full shrink-0"
                                >
                                  {char}
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center justify-center text-[18px] font-medium font-sans h-full px-4 shrink-0 whitespace-nowrap">
                                {answer.text}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>

      {/* Command Palette Overlay */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-start sm:items-center sm:pt-[15vh] bg-[#112a3d]/80 sm:bg-[#112a3d]/60 backdrop-blur-sm sm:p-4">
          <div
            className="absolute inset-0"
            onClick={() => setIsCommandPaletteOpen(false)}
          />
          <div className="relative w-full sm:max-w-2xl bg-[#0c1f2e] sm:rounded-2xl shadow-2xl border-t sm:border border-[#316995] overflow-hidden flex flex-col max-h-[60vh] sm:max-h-[70vh]">
            <div className="flex items-center px-4 md:px-6 border-b border-[#316995]/30 bg-[#112a3d]">
              <Search
                size={20}
                className="text-cyan-400 mr-3 md:mr-4 shrink-0"
              />
              <input
                ref={commandPaletteInputRef}
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                onKeyDown={handlePaletteKeyDown}
                placeholder="Search math symbols... (e.g. 'root', 'square', 'pi')"
                className="flex-1 py-5 md:py-6 bg-transparent outline-none text-white text-lg md:text-xl placeholder-[#86a8c3] font-sans tracking-wide"
              />
              <button
                onClick={() => {
                  if (filteredSymbols[paletteSelectedIndex]) {
                    speakText(filteredSymbols[paletteSelectedIndex].name);
                  }
                }}
                className="mr-3 p-2 text-[#86a8c3] hover:text-cyan-400 hover:bg-cyan-900/30 rounded-md transition-colors"
                title="Repeat voice output (Alt+R)"
              >
                <Volume2 size={20} />
              </button>
              <kbd className="hidden sm:inline-block bg-[#0c1f2e] border border-[#316995] rounded-md px-2 py-1 text-sm font-mono text-cyan-400 ml-1 font-bold">
                ESC
              </kbd>
            </div>

            {filteredSymbols.length === 0 ? (
              <div className="py-16 text-center text-[#86a8c3] text-base md:text-lg flex flex-col items-center">
                <Calculator size={40} className="text-[#316995] mb-4" />
                No math symbols found for "{paletteSearch}"
              </div>
            ) : (
              <div
                ref={paletteListRef}
                className="flex-1 overflow-y-auto py-2 bg-[#0c1f2e]"
              >
                {filteredSymbols.map((item, index) => {
                  const isSelected = index === paletteSelectedIndex;
                  const isNavAction = NAV_ACTIONS.includes(
                    (item as any).action,
                  );
                  const prevIsNavAction =
                    index > 0 &&
                    NAV_ACTIONS.includes(
                      (filteredSymbols[index - 1] as any).action,
                    );

                  return (
                    <React.Fragment key={item.symbol + index}>
                      {isNavAction && !prevIsNavAction && (
                        <div className="flex items-center gap-3 px-4 md:px-6 py-2 mt-2 mb-1 select-none w-full">
                          <div className="h-[1px] flex-1 bg-[#316995]/30"></div>
                          <span className="text-base font-bold tracking-wider uppercase text-[#86a8c3]">
                            Navigation Actions
                          </span>
                          <div className="h-[1px] flex-1 bg-[#316995]/30"></div>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if ((item as any).action === "raise_hand") {
                            setIsCommandPaletteOpen(false);
                            executeRaiseHand();
                          } else if (
                            (item as any).action === "broadcast_line"
                          ) {
                            setIsCommandPaletteOpen(false);
                            openBroadcastDialog();
                          } else if (
                            (item as any).action === "toggle_scratchpad"
                          ) {
                            setIsCommandPaletteOpen(false);
                            toggleScratchpad();
                          } else if (
                            (item as any).action === "context_locator"
                          ) {
                            setIsCommandPaletteOpen(false);
                            triggerContextLocator();
                          } else if (
                            (item as any).action === "start_group_work"
                          ) {
                            setIsCommandPaletteOpen(false);
                            toggleGroupWork();
                          } else if (
                            (item as any).action === "insert_fraction"
                          ) {
                            setIsCommandPaletteOpen(false);
                            setFractionNum("");
                            setFractionDen("");
                            setIsFractionDialogOpen(true);
                            setTimeout(
                              () => fractionNumRef.current?.focus(),
                              50,
                            );
                          } else if (
                            (item as any).action === "toggle_submission"
                          ) {
                            setIsCommandPaletteOpen(false);
                            toggleSubmission();
                          } else if (
                            (item as any).action === "reset_next_user"
                          ) {
                            setIsCommandPaletteOpen(false);
                            resetForNextUser();
                          } else if ((item as any).action === "save_lesson") {
                            setIsCommandPaletteOpen(false);
                            saveLesson();
                          } else if (
                            (item as any).action === "refresh_equation"
                          ) {
                            setIsCommandPaletteOpen(false);
                            refreshEquation();
                          } else if (
                            (item as any).action === "start_new_lesson"
                          ) {
                            setIsCommandPaletteOpen(false);
                            startNewLesson();
                          } else if (
                            (item as any).action === "hear_explanation"
                          ) {
                            setIsCommandPaletteOpen(false);
                            hearExplanation();
                          } else if ((item as any).action === "next_question") {
                            setIsCommandPaletteOpen(false);
                            nextQuestion();
                          } else if ((item as any).action === "toggle_mute") {
                            setIsCommandPaletteOpen(false);
                            setIsAudioMuted((prev) => !prev);
                            if (
                              !isAudioMutedRef.current &&
                              "speechSynthesis" in window
                            ) {
                              window.speechSynthesis.cancel();
                            }
                          } else if (
                            (item as any).action === "open_calculator"
                          ) {
                            setIsCommandPaletteOpen(false);
                            setIsCalculatorOpen(true);
                          } else if ((item as any).action === "focus_navbar") {
                            setIsCommandPaletteOpen(false);
                            setTimeout(() => {
                              const toolbar =
                                document.querySelector('[role="toolbar"]');
                              if (toolbar) {
                                const focusables = Array.from(
                                  toolbar.querySelectorAll<HTMLElement>(
                                    "button, input",
                                  ),
                                ).filter(
                                  (el) =>
                                    !el.hasAttribute("disabled") &&
                                    el.offsetParent !== null &&
                                    (el.tagName !== "INPUT" ||
                                      (el as HTMLInputElement).type ===
                                        "button" ||
                                      (el as HTMLInputElement).type ===
                                        "text" ||
                                      (el as HTMLInputElement).type === "date"),
                                );

                                if (focusables.length > 0) {
                                  const activeItem =
                                    focusables.find(
                                      (el) => el.tabIndex === 0,
                                    ) || focusables[0];
                                  activeItem.focus();
                                  speakText(
                                    "Navbar focused. Use left and right arrow keys to navigate.",
                                  );
                                }
                              }
                            }, 50);
                          } else {
                            insertSymbol(item.symbol);
                          }
                        }}
                        onMouseEnter={() => setPaletteSelectedIndex(index)}
                        className={`flex items-center justify-between px-4 md:px-6 py-3 text-left transition-all outline-none border-[3px] my-1 rounded-lg mx-2 w-[calc(100%-16px)]
                               ${isSelected ? "bg-[#112a3d] border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "border-transparent hover:bg-[#1a4b6e]/30"}
                            `}
                      >
                        <div className="flex items-center gap-4 md:gap-5">
                          <span
                            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg text-2xl font-medium shrink-0 transition-colors
                                  ${isSelected ? "bg-cyan-900/50 text-cyan-400 border border-cyan-400/50" : "bg-[#112a3d] text-white border border-[#316995] shadow-sm"}
                               `}
                          >
                            {item.symbol}
                          </span>
                          <span
                            className={`text-[15px] md:text-[16px] tracking-wide ${isSelected ? "text-cyan-400 font-bold" : "text-[#b4c9da]"}`}
                          >
                            {item.name}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="hidden sm:flex text-sm text-cyan-400 items-center gap-2">
                            Press{" "}
                            <kbd className="bg-cyan-900/50 border border-cyan-400 shadow-sm rounded-md px-2 py-1 uppercase tracking-wider text-base font-bold text-cyan-400">
                              ↵ Enter
                            </kbd>
                          </span>
                        )}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Broadcast Dialog Overlay */}
      {isBroadcastPaletteOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-start sm:items-center sm:pt-[15vh] bg-[#112a3d]/90 backdrop-blur-sm sm:p-4">
          <div
            className="absolute inset-0"
            onClick={() => setIsBroadcastPaletteOpen(false)}
          />
          <div className="relative w-full sm:max-w-2xl bg-[#0c1f2e] sm:rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border-t sm:border border-[#316995]/50 overflow-hidden flex flex-col max-h-[60vh] sm:max-h-[70vh]">
            <div className="flex items-center px-4 md:px-6 border-b border-[#316995]/50 bg-[#112a3d]">
              <input
                ref={broadcastInputRef}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setBroadcastSelectedIndex(
                      (prev) => (prev + 1) % broadcastStudentList.length,
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setBroadcastSelectedIndex(
                      (prev) =>
                        (prev - 1 + broadcastStudentList.length) %
                        broadcastStudentList.length,
                    );
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const student =
                      broadcastStudentList[broadcastSelectedIndex];
                    simulateBroadcastReply(student);
                  } else if (e.key === "Escape") {
                    setIsBroadcastPaletteOpen(false);
                    e.preventDefault();
                  }
                }}
                placeholder="Ask who? Use arrows to select, Enter to send"
                className="flex-1 py-5 md:py-6 bg-transparent outline-none text-white text-lg md:text-xl placeholder-[#86a8c3]/70 font-sans tracking-wide"
                readOnly
              />
            </div>

            <div
              ref={broadcastRef}
              className="overflow-y-auto no-scrollbar flex-1 bg-[#0c1f2e] p-2 md:p-3"
            >
              {broadcastStudentList.map((student, index) => {
                const isSelected = index === broadcastSelectedIndex;
                return (
                  <button
                    key={student}
                    onClick={() => {
                      simulateBroadcastReply(student);
                    }}
                    onMouseEnter={() => setBroadcastSelectedIndex(index)}
                    className={`w-full text-left px-4 py-4 md:py-5 flex flex-row items-center gap-4 rounded-xl transition-all duration-200 outline-none ${
                      isSelected
                        ? "bg-[#163e5b] text-white shadow-md transform scale-[1.01] border border-[#facc15]/50"
                        : "bg-transparent text-[#b4c9da] hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-lg md:text-lg font-semibold tracking-wide truncate ${
                          isSelected ? "text-white font-bold" : "text-[#b4c9da]"
                        }`}
                      >
                        {student}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Status Footer */}
            <div className="bg-[#112a3d] px-4 md:px-6 py-3 md:py-4 border-t border-[#316995]/50 flex justify-between items-center shrink-0">
              <span className="text-base tracking-wide text-[#b4c9da] font-medium">
                Peer-to-Peer Help Broadcast
              </span>
              <span className="text-sm tracking-wider text-[#86a8c3]/70 uppercase hidden sm:inline font-bold border border-[#316995]/30 rounded px-2 py-0.5">
                Use arrows to select
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Fraction Dialog Overlay */}
      {isFractionDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] bg-[#112a3d]/60 backdrop-blur-sm p-4">
          <div
            className="absolute inset-0"
            onClick={() => setIsFractionDialogOpen(false)}
          />
          <div className="relative w-full max-w-[320px] bg-[#ffffff] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-[#112a3d] mb-4 text-center">
              Insert Fraction
            </h3>
            <div className="flex flex-col items-center gap-3">
              <input
                ref={fractionNumRef}
                value={fractionNum}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/[A-Za-z]/.test(val)) {
                    speakText(
                      "Please type a number. Current field: numerator.",
                    );
                  } else {
                    setFractionNum(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (fractionNum && fractionDen) {
                      insertMultipleSymbols(
                        Array.from(`${fractionNum}/${fractionDen}`),
                      );
                      setIsFractionDialogOpen(false);
                    } else {
                      document.getElementById("frac-den")?.focus();
                    }
                  } else if (e.key === "Escape") {
                    setIsFractionDialogOpen(false);
                  }
                }}
                className="w-24 h-12 text-center text-xl font-medium border-2 border-gray-200 rounded-lg outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Num"
                autoComplete="off"
              />
              <div className="w-24 h-1 bg-gray-300 rounded-full"></div>
              <input
                id="frac-den"
                value={fractionDen}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/[A-Za-z]/.test(val)) {
                    speakText(
                      "Please type a number. Current field: denominator.",
                    );
                  } else {
                    setFractionDen(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (fractionNum && fractionDen) {
                      insertMultipleSymbols(
                        Array.from(`${fractionNum}/${fractionDen}`),
                      );
                      setIsFractionDialogOpen(false);
                    }
                  } else if (e.key === "Escape") {
                    setIsFractionDialogOpen(false);
                  }
                }}
                className="w-24 h-12 text-center text-xl font-medium border-2 border-gray-200 rounded-lg outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Den"
                autoComplete="off"
              />
            </div>
            <p className="text-sm text-gray-500 text-center mt-5">
              Enter numbers and press Enter
            </p>
          </div>
        </div>
      )}

      {/* Calculator Overlay */}
      <FloatingCalculator
        isOpen={isCalculatorOpen}
        onClose={() => {
          setIsCalculatorOpen(false);
          speakText("Calculator closed");
          setTimeout(() => document.getElementById("grid-input")?.focus(), 50);
        }}
        speakText={speakText}
        onInsert={(value) => {
          const chars = Array.from(String(value));
          setGridData((prev) => {
            const next = { ...prev };
            let currentC = activeCell.c;
            chars.forEach((c) => {
              next[`${activeCell.r},${currentC}`] = c;
              currentC++;
            });
            return next;
          });
          setActiveCell((prev) => ({ ...prev, c: prev.c + chars.length }));
          setIsCalculatorOpen(false);
          speakText(`${value} inserted to canvas`);
          setTimeout(() => document.getElementById("grid-input")?.focus(), 50);
        }}
      />

      {/* Help Menu Overlay */}
      {isHelpMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-start sm:items-center sm:pt-[15vh] bg-[#112a3d]/90 backdrop-blur-sm sm:p-4">
          <div
            className="absolute inset-0"
            onClick={() => setIsHelpMenuOpen(false)}
          />
          <div className="relative w-full sm:max-w-2xl bg-[#0c1f2e] sm:rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border-t sm:border border-[#316995]/50 overflow-hidden flex flex-col max-h-[60vh] sm:max-h-[70vh]">
            <div className="flex items-center px-4 md:px-6 border-b border-[#316995]/50 bg-[#112a3d]">
              <input
                ref={helpMenuInputRef}
                onKeyDown={handleHelpMenuKeyDown}
                placeholder="Help Menu: Use arrows to navigate, Enter to execute"
                className="flex-1 py-5 md:py-6 bg-transparent outline-none text-white text-lg md:text-xl placeholder-[#86a8c3]/70 font-sans tracking-wide"
                readOnly
              />
              <button
                onClick={() => {
                  if (HELP_MENU_ITEMS[helpMenuSelectedIndex]) {
                    speakText(HELP_MENU_ITEMS[helpMenuSelectedIndex].text);
                  }
                }}
                className="mr-3 p-2 text-[#86a8c3] hover:text-[#facc15] hover:bg-white/10 rounded-md transition-colors"
                title="Repeat voice output"
              >
                <Volume2 size={20} />
              </button>
              <kbd className="hidden sm:inline-block bg-[#0c1f2e] border border-[#316995] rounded-md px-2 py-1 text-sm font-mono text-[#86a8c3] ml-1">
                ESC
              </kbd>
            </div>

            <div
              ref={helpMenuRef}
              className="flex-1 overflow-y-auto py-2 bg-[#0c1f2e]"
            >
              {HELP_MENU_ITEMS.map((item, index) => {
                const isSelected = index === helpMenuSelectedIndex;
                return (
                  <button
                    key={item.action + index}
                    onClick={() => {
                      setIsHelpMenuOpen(false);
                      if (item.action === "toggle_mute") {
                        setIsAudioMuted((prev) => !prev);
                        if (!isAudioMuted && "speechSynthesis" in window)
                          window.speechSynthesis.cancel();
                      } else if (item.action === "focus_navbar") {
                        setTimeout(() => {
                          const toolbar =
                            document.querySelector('[role="toolbar"]');
                          if (toolbar) {
                            const focusables = Array.from(
                              toolbar.querySelectorAll<HTMLElement>(
                                "button, input",
                              ),
                            ).filter(
                              (el) =>
                                !el.hasAttribute("disabled") &&
                                el.offsetParent !== null &&
                                (el.tagName !== "INPUT" ||
                                  (el as HTMLInputElement).type === "button" ||
                                  (el as HTMLInputElement).type === "text" ||
                                  (el as HTMLInputElement).type === "date"),
                            );

                            if (focusables.length > 0) {
                              const activeItem =
                                focusables.find((el) => el.tabIndex === 0) ||
                                focusables[0];
                              activeItem.focus();
                              speakText(
                                "Navbar focused. Use left and right arrow keys to navigate.",
                              );
                            }
                          }
                        }, 50);
                      } else if (item.action === "command_palette")
                        setIsCommandPaletteOpen(true);
                      else if (item.action === "evaluate_math")
                        executeEvaluateMath();
                      else if (item.action === "open_calculator") {
                        setIsCommandPaletteOpen(false);
                        setIsCalculatorOpen(true);
                      } else if (item.action === "raise_hand")
                        executeRaiseHand();
                      else if (item.action === "toggle_scratchpad")
                        toggleScratchpad();
                      else if (item.action === "context_locator")
                        triggerContextLocator();
                      else if (item.action === "undo") executeUndo();
                      else if (item.action === "redo") executeRedo();
                      else if (item.action === "broadcast_line")
                        openBroadcastDialog();
                      else if (item.action === "pass_control") passControl();
                      else if (item.action === "start_group_work")
                        toggleGroupWork();
                      else if (item.action === "toggle_submission")
                        toggleSubmission();
                      else if (item.action === "reset_next_user")
                        resetForNextUser();
                    }}
                    onMouseEnter={() => setHelpMenuSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-4 md:px-6 py-3 text-left transition-all outline-none border-l-4
                             ${isSelected ? "bg-[#163e5b] border-[#facc15] shadow-sm" : "border-transparent hover:bg-white/5"}
                          `}
                  >
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-[15px] md:text-[16px] tracking-wide ${isSelected ? "text-white font-bold" : "text-[#b4c9da]"}`}
                      >
                        {item.name}
                      </span>
                      <span
                        className={`text-sm font-mono px-2 py-0.5 rounded w-fit text-left ${isSelected ? "bg-[#316995] text-white" : "bg-[#112a3d] text-[#86a8c3]"}`}
                      >
                        {item.shortcut}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="hidden sm:flex text-sm text-[#facc15] items-center gap-2 font-medium">
                        Press{" "}
                        <kbd className="bg-[#0c1f2e] border border-[#facc15]/50 shadow-sm rounded-md px-2 py-1 uppercase tracking-wider text-base font-bold text-[#facc15]">
                          ↵ Enter
                        </kbd>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
