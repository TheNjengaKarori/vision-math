import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Calculator, Volume2, Save, FilePlus, X } from "lucide-react";
import { evaluate } from "mathjs";
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
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.35);
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
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
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
  { name: "Command Palette", shortcut: "Ctrl + M", text: "To open the command palette: Control, M", action: "command_palette" },
  { name: "Evaluate Math", shortcut: "Ctrl + =", text: "To evaluate math: Control, Equals", action: "evaluate_math" },
  { name: "Raise Hand (Queue)", shortcut: "H H H", text: "To raise hand: press H three times quickly", action: "raise_hand" },
  { name: "Broadcast Line", shortcut: "B B B", text: "To broadcast line: press B three times quickly", action: "broadcast_line" },
  { name: "Toggle Scratchpad (Rough Work)", shortcut: "Alt / Opt + R", text: "To open rough work: Alt or Option, R", action: "toggle_scratchpad" },
  { name: "Where Am I? Context Locator", shortcut: "Double Shift", text: "For context locator: Double-click Shift", action: "context_locator" },
  { name: "Undo", shortcut: "Ctrl / Cmd + Z", text: "To undo: Control or Command, Z", action: "undo" },
  { name: "Redo", shortcut: "Ctrl / Cmd + Y", text: "To redo: Control or Command, Y", action: "redo" },
  { name: "Help Menu", shortcut: "Shift + ?", text: "To open this help menu: Shift, Question Mark", action: "help_menu" },
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

  const [activeCell, setActiveCell] = useState({ r: 0, c: 0 });
  const [gridData, setGridData] = useState<Record<string, string>>({});
  const [bgType, setBgType] = useState<"grid" | "blank">("grid");

  const [currentView, setCurrentView] = useState<"student" | "teacher">("student");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [missingPingAlert, setMissingPingAlert] = useState(false);

  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [helpMenuSelectedIndex, setHelpMenuSelectedIndex] = useState(0);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuInputRef = useRef<HTMLInputElement>(null);

  const [isBroadcastPaletteOpen, setIsBroadcastPaletteOpen] = useState(false);
  const [broadcastSelectedIndex, setBroadcastSelectedIndex] = useState(0);
  const broadcastStudentList = ["Amina", "David Ochieng", "Sarah Njoroge", "John Doe"];
  const broadcastInputRef = useRef<HTMLInputElement>(null);
  const broadcastRef = useRef<HTMLDivElement>(null);
  const [broadcastReply, setBroadcastReply] = useState<{ student: string, lineText: string, mockFeedback: string } | null>(null);

  interface RaisedHand {
    id: string;
    name: string;
    timestamp: string;
    currentLineText?: string;
  }
  const [queue, setQueue] = useState<RaisedHand[]>([
    { id: "mock_1", name: "Amina Hassan", timestamp: "5 mins ago", currentLineText: "3x - 6 = 9" },
    { id: "mock_2", name: "Brian Ochieng", timestamp: "2 mins ago", currentLineText: "y = 3" }
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

  const historyRef = useRef<{
    main: { gridData: Record<string, string>; activeCell: { r: number; c: number }; desc: string }[];
    scratch: { gridData: Record<string, string>; activeCell: { r: number; c: number }; desc: string }[];
  }>({
    main: [{ gridData: {}, activeCell: { r: 0, c: 0 }, desc: "Initial empty worksheet" }],
    scratch: [{ gridData: {}, activeCell: { r: 0, c: 0 }, desc: "Initial empty scratchpad" }],
  });
  const historyIndexRef = useRef<{ main: number; scratch: number }>({ main: 0, scratch: 0 });
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

  const saveLesson = () => {
    setComputeStatus("Lesson saved successfully.");
    // visual feedback will be announced by polite aria-live Region
  };

  const speakText = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

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
        .filter(key => key.startsWith(`${currentR},`))
        .sort((a,b) => parseInt(a.split(',')[1]) - parseInt(b.split(',')[1]))
        .map(key => gridDataRef.current[key])
        .join("");

    setQueue(prev => {
        if (prev.find(q => q.id === "student_1")) {
            speakText("Hand is already raised.");
            return prev;
        }
        const newQueue = [...prev, { id: "student_1", name: "Kelvin Mwangi", timestamp: "Just now", currentLineText }];
        playBellSound();
        speakText(`Hand raised. You are number ${newQueue.length} in the queue.`);
        setComputeStatus(`Hand raised. Queue position: ${newQueue.length}`);
        return newQueue;
    });
  }, [speakText]);

  const simulateBroadcastReply = useCallback((student: string) => {
    const r = activeCellRef.current.r;
    let lineText = "";
    Object.keys(gridDataRef.current)
        .filter(key => key.startsWith(`${r},`))
        .sort((a,b) => parseInt(a.split(',')[1]) - parseInt(b.split(',')[1]))
        .forEach(key => lineText += gridDataRef.current[key]);
    lineText = lineText.trim() || "(Empty line)";

    setIsBroadcastPaletteOpen(false);
    speakText(`Sent line to ${student}.`);
    setComputeStatus(`Sent line to ${student}.`);
    
    setTimeout(() => {
      playDoorbellSound();
      speakText(`Received reply from ${student} in rough work. Click the reply button to view.`);
      setComputeStatus(`Received reply from ${student} in rough work.`);
      setBroadcastReply({
        student,
        lineText,
        mockFeedback: student === "Amina"
          ? "Hey I think you missed a negative sign when moving the 4 over"
          : "Are you sure that's simplified? Try multiplying both sides by 2."
      });
    }, 8000);
  }, [speakText]);

  const openBroadcastDialog = useCallback(() => {
    setIsBroadcastPaletteOpen(true);
    setBroadcastSelectedIndex(0);
    speakText("Ask who? Use arrows to scroll through classmates.");
    setComputeStatus("Broadcast line. Ask who?");
  }, [speakText]);

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
        speakText("Assignment submitted successfully. Entering read-only mode.");
        setComputeStatus("Assignment submitted successfully. Entering read-only mode.");
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

  const generateDiffDescription = (prev: Record<string, string>, next: Record<string, string>, activeCellRow: number, isUndo: boolean = false) => {
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
       const match = MATH_SYMBOLS.find(s => s.symbol === char) || AUTOCOMPLETE_DICT.find(d => d.symbol === char);
       return match ? match.name : char;
    }

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
      const desc = generateDiffDescription(lastState.gridData, gridData, activeCellRef.current.r);
      const newStack = historyStack.slice(0, currentIndex + 1);
      newStack.push({
        gridData,
        activeCell: activeCellRef.current,
        desc
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
      const diffDesc = generateDiffDescription(currState.gridData, prevState.gridData, prevState.activeCell.r, true);
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

  useEffect(() => {
  }, [isScratchpadOpen]);

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
    const worksheet = isScratchpadOpenRef.current ? "Scratchpad" : "Main Worksheet";
    
    let maxR = 9; // At least 10 lines
    const keys = Object.keys(gridDataRef.current);
    if (keys.length > 0) {
       maxR = Math.max(maxR, ...keys.map(k => parseInt(k.split(",")[0])));
    }
    const totalLines = maxR + 1;
    const currentLine = activeCellRef.current.r + 1;
    
    let cellInfo = "";
    const currentCol = activeCellRef.current.c;
    const currentCellContent = gridDataRef.current[`${activeCellRef.current.r},${currentCol}`];
    if (currentCellContent) {
       const symbolMatch = MATH_SYMBOLS.find(s => s.symbol === currentCellContent) || 
                           AUTOCOMPLETE_DICT.find(d => d.symbol === currentCellContent);
       const symbolName = symbolMatch ? symbolMatch.name : currentCellContent;
       cellInfo = `The cell contains: ${symbolName}.`;
    } else {
       cellInfo = `The cell is empty.`;
    }

    const lineBlocks = blocksRef.current.filter((b) => b.r === activeCellRef.current.r).sort((a,b) => a.minC - b.minC);
    let lineInfo = "";
    if (lineBlocks.length > 0) {
       const blocksText = lineBlocks.map(b => b.text).join(" ");
       lineInfo = `The line contains: ${blocksText}.`;
    } else {
       lineInfo = `The line is empty.`;
    }
    
    speakText(`Worksheet: ${worksheet}. You are on Line ${currentLine} of ${totalLines}. Focused on column ${currentCol + 1}. ${lineInfo} ${cellInfo}`);
  }, [speakText]);

  const filteredSymbols = MATH_SYMBOLS.filter((s) => {
    const term = paletteSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.symbol.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save/Submit (Ctrl + S or Cmd + S)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        toggleSubmission();
        return;
      }

      // Toggle Command Palette with Ctrl+M or Cmd+M
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }
      
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
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
            if (newData[`${r},${c-1}`]?.toLowerCase() === "h") {
                delete newData[`${r},${c-1}`];
                delete gridDataRef.current[`${r},${c-1}`];
                deletedCount++;
            }
            if (newData[`${r},${c-2}`]?.toLowerCase() === "h") {
                delete newData[`${r},${c-2}`];
                delete gridDataRef.current[`${r},${c-2}`];
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
      } else if (e.key !== "Escape" && e.key !== "Shift" && !e.key?.startsWith("Arrow") && e.key?.toLowerCase() !== "b") {
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
            if (newData[`${r},${c-1}`]?.toLowerCase() === "b") {
                delete newData[`${r},${c-1}`];
                delete gridDataRef.current[`${r},${c-1}`];
                deletedCount++;
            }
            if (newData[`${r},${c-2}`]?.toLowerCase() === "b") {
                delete newData[`${r},${c-2}`];
                delete gridDataRef.current[`${r},${c-2}`];
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
      } else if (e.key !== "Escape" && e.key !== "Shift" && !e.key?.startsWith("Arrow") && e.key?.toLowerCase() !== "h") {
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
  }, [isCommandPaletteOpen, isHelpMenuOpen, isBroadcastPaletteOpen, toggleScratchpad, isSubmitted]);

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
    backgroundColor: "#ffffff",
    backgroundImage: `linear-gradient(#a7bfd3 1.5px, transparent 1.5px), linear-gradient(90deg, #a7bfd3 1.5px, transparent 1.5px)`,
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

  const insertSymbol = (symbol: string) => {
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
        if (item.action === "command_palette") setIsCommandPaletteOpen(true);
        else if (item.action === "evaluate_math") executeEvaluateMath();
        else if (item.action === "raise_hand") executeRaiseHand();
        else if (item.action === "toggle_scratchpad") toggleScratchpad();
        else if (item.action === "context_locator") triggerContextLocator();
        else if (item.action === "undo") executeUndo();
        else if (item.action === "redo") executeRedo();
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
    if (isBroadcastPaletteOpen && broadcastStudentList[broadcastSelectedIndex]) {
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
            speakText(`Niaje Kelvin! You have 1 review from Mrs. Mutuku on Algebraic Linear Equations. Press Enter to open.`);
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
    <div className="flex flex-col h-screen overflow-hidden font-sans select-none relative bg-[#ffffff]">
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
        <div className="flex justify-start items-center px-4 py-1.5 bg-[#163e5b] text-[#b4c9da] text-xs font-semibold h-[24px]">
            <button
              onClick={() => setCurrentView("teacher")}
              className="flex items-center gap-1.5 px-2 py-0.5 ml-8 rounded-sm bg-blue-500/10 hover:bg-blue-500/30 border border-blue-400/20 hover:border-blue-400/50 text-[10px] uppercase tracking-wider font-bold transition-all text-[#b4c9da] hover:text-white outline-none focus:ring-1 focus:ring-white/20"
              title="Open Teacher Feed View"
            >
              Teacher View
            </button>
        </div>

        <div className="flex justify-between items-center h-14 bg-[#163e5b] text-white px-2 border-b-2 border-transparent relative z-20">
          <div className="flex flex-1 items-center">
            <button className="hover:bg-white/10 rounded p-1 ml-1 cursor-pointer transition-colors focus:outline-none shrink-0">
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
            <div className="flex items-center text-[13px] sm:text-[14px] tracking-wide font-medium space-x-1 sm:space-x-2 ml-2 min-w-0 flex-1 overflow-x-auto no-scrollbar mask-fade-right">
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                readOnly={isSubmitted}
                className="bg-transparent outline-none w-[70px] sm:w-[90px] border-b border-transparent focus:border-white/50 px-1 py-0.5 rounded cursor-text hover:bg-white/5 transition-colors placeholder-[#b4c9da]/50 flex-shrink-0"
                placeholder="Class"
              />
              <span className="text-[#316995] font-light flex-shrink-0">/</span>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                readOnly={isSubmitted}
                className="bg-transparent outline-none w-[45px] sm:w-[50px] border-b border-transparent focus:border-white/50 px-1 py-0.5 rounded cursor-text hover:bg-white/5 transition-colors placeholder-[#b4c9da]/50 text-center flex-shrink-0"
                placeholder="Year"
              />
              <span className="text-[#316995] font-light flex-shrink-0">/</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full border-[1.5px] border-[#f4a261]"></div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  readOnly={isSubmitted}
                  className="bg-transparent outline-none w-[80px] sm:w-[100px] border-b border-transparent focus:border-white/50 px-1 py-0.5 rounded cursor-text hover:bg-white/5 transition-colors placeholder-[#b4c9da]/50 uppercase tracking-widest text-[12px] sm:text-[13px] text-[#b4c9da] focus:text-white"
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
                  className="bg-transparent outline-none min-w-[70px] max-w-[200px] px-2 py-0.5 cursor-text hover:bg-white/10 transition-colors placeholder-white/50 text-center text-white text-[12px] sm:text-[13px] tracking-widest uppercase box-content"
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
                <span className="text-[#b4c9da] group-hover:text-white transition-colors text-[12px] sm:text-[13px] tracking-wide whitespace-nowrap">
                  {(() => {
                    if (!date) return "DATE";
                    const d = new Date(date + "T00:00:00");
                    if (isNaN(d.getTime())) return "DATE";
                    return d.toLocaleString("default", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  })()}
                </span>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isSubmitted}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full z-10"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center h-14 items-start relative pointer-events-none">
            {broadcastReply && !isScratchpadOpen && (
              <button
                onClick={() => toggleScratchpad()}
                className="mt-2 text-sm font-medium animate-pulse px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 hover:bg-blue-500/30 pointer-events-auto shadow-lg backdrop-blur-md transition-all flex items-center gap-2"
              >
                💬 Reply from {broadcastReply.student} (Click to open)
              </button>
            )}
          </div>

          <div className="flex-1 flex justify-end gap-2 px-2">
            <button
              onClick={startNewLesson}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/20 hover:bg-black/30 border border-transparent hover:border-white/10 text-sm font-medium transition-all text-[#b4c9da] hover:text-white outline-none focus:ring-2 focus:ring-white/20"
              title="Start a new lesson"
            >
              <FilePlus size={16} />
              <span className="hidden sm:inline">New Lesson</span>
            </button>
            <button
              onClick={saveLesson}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/20 hover:bg-black/30 border border-transparent hover:border-white/10 text-sm font-medium transition-all text-[#b4c9da] hover:text-white outline-none focus:ring-2 focus:ring-white/20"
              title="Save current lesson"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/20 hover:bg-black/30 border border-transparent hover:border-white/10 text-sm font-medium transition-all text-[#b4c9da] hover:text-white outline-none focus:ring-2 focus:ring-white/20"
              title="Open Math Tool Palette"
            >
              <Calculator size={16} />
              <span className="hidden sm:inline">Commands</span>
              <kbd className="hidden sm:inline-block bg-black/40 border border-white/5 rounded px-1.5 py-0.5 text-[10px] font-mono ml-1 text-white/70">
                Cmd / Ctrl M
              </kbd>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-row pointer-events-auto h-full w-full relative z-0 overflow-hidden">
        {/* Main Workspace */}
        <div
          className={`transition-all duration-500 ease-out flex-1 relative h-full overflow-y-auto ${isScratchpadOpen ? "w-1/2 -translate-x-4 opacity-30 pointer-events-none" : "w-full translate-x-0 opacity-100"}`}
        >
          <ol className="list-decimal pl-[72px] pr-8 py-8 space-y-4 font-sans text-lg font-bold text-[#b4c9da] marker:text-[#86a8c3]">
            {Array.from({
              length:
                Math.max(
                  isScratchpadOpen ? mainWorkspace.activeCell.r : activeCell.r,
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
                          style={{ top: 0, left: block.minC * 46, height: 46 }}
                        >
                          {block.cells.map((cell) => (
                            <div
                              key={`${cell.c}`}
                              className="absolute flex items-center justify-center text-[24px] font-medium text-[#112a3d] font-sans"
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
                        className={`absolute flex items-center justify-center text-[24px] font-medium text-[#112a3d] text-center outline-none m-0 p-0 font-sans cursor-text ${
                          bgType === "grid"
                            ? "bg-blue-500/10 border-[2.5px] border-blue-500 shadow-sm"
                            : "bg-transparent border-[2.5px] border-blue-500/0 focus:border-blue-500/50 caret-[#112a3d]"
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
                        readOnly={isSubmitted}
                        autoComplete="off"
                        autoFocus
                      />
                    )}

                    {isActiveView &&
                      suggestion &&
                      currentActiveCell.r === r && (
                        <div
                          className="absolute bg-[#163e5b]/95 backdrop-blur-md border border-[#316995]/50 text-white px-3 py-2 rounded-lg shadow-xl text-[12px] font-sans font-medium whitespace-nowrap z-50 pointer-events-none flex flex-col origin-top-left animate-in fade-in zoom-in-95 duration-100"
                          style={{ top: 46 + 4, left: suggestion.startC * 46 }}
                        >
                          <div className="flex items-baseline gap-2 mb-1.5">
                            <span className="text-white text-[18px] font-medium leading-none">
                              {suggestion.symbol}
                            </span>
                            <span className="text-[#b4c9da] text-xs font-light tracking-wide">
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
        </div>

        {/* Scratchpad Drawer */}
        <div
          className={`absolute top-0 right-0 h-full bg-[#1A1A1A] border-l border-white/10 shadow-2xl transition-all duration-500 ease-out z-20 flex flex-col ${isScratchpadOpen ? "w-1/2 translate-x-0" : "w-[0px] translate-x-full overflow-hidden"}`}
        >
          <div className="px-6 py-4 bg-[#111] border-b border-white/5 flex justify-between items-center shadow-sm shrink-0">
            <div>
              <h2 className="text-sm font-bold tracking-widest text-[#e8e8e8] uppercase">
                Scratchpad
              </h2>
              <p className="text-xs text-[#888] mt-1 font-light">
                Work here is not saved or graded
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <button 
                onClick={toggleScratchpad}
                className="hidden sm:inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 transition-colors border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-white/70"
                title="Close Scratchpad (Esc)"
              >
                Close
                <span className="text-[9px] opacity-70 border border-white/20 rounded px-1 ml-1 font-sans">Esc</span>
              </button>
            </div>
          </div>

          <div className="flex-1 relative overflow-y-auto">
            {broadcastReply && (
              <div className="m-6 mb-2 p-4 rounded-xl bg-blue-900/40 border border-blue-500/20 text-[#b4c9da] shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Peer Reply</div>
                  <div className="text-sm font-medium text-white">from {broadcastReply.student}</div>
                  <button 
                    onClick={() => setBroadcastReply(null)}
                    className="ml-auto text-blue-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="bg-black/20 p-3 rounded-lg font-mono text-center text-xl text-white mb-3 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
                  {broadcastReply.lineText}
                </div>
                <div className="flex items-start gap-2 bg-blue-500/10 p-3 rounded-lg">
                  <div className="mt-0.5 text-blue-400">💬</div>
                  <div className="text-sm leading-relaxed text-blue-100">{broadcastReply.mockFeedback}</div>
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
                          className={`absolute flex items-center justify-center text-[24px] font-medium text-white text-center outline-none m-0 p-0 font-sans cursor-text ${
                            bgType === "grid"
                              ? "bg-[#2a2a2a] border-[2.5px] border-gray-500 shadow-sm"
                              : "bg-transparent border-[2.5px] border-blue-500/0 focus:border-blue-500/50 caret-white"
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
                          readOnly={isSubmitted}
                          autoComplete="off"
                          autoFocus
                        />
                      )}

                      {isActiveView &&
                        suggestion &&
                        currentActiveCell.r === r && (
                          <div
                            className="absolute bg-[#333]/95 backdrop-blur-md border border-gray-600 text-white px-3 py-2 rounded-lg shadow-xl text-[12px] font-sans font-medium whitespace-nowrap z-50 pointer-events-none flex flex-col origin-top-left animate-in fade-in zoom-in-95 duration-100"
                            style={{
                              top: 46 + 4,
                              left: suggestion.startC * 46,
                            }}
                          >
                            <div className="flex items-baseline gap-2 mb-1.5">
                              <span className="text-white text-[18px] font-medium leading-none">
                                {suggestion.symbol}
                              </span>
                              <span className="text-gray-400 text-xs font-light tracking-wide">
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] bg-[#112a3d]/60 backdrop-blur-sm p-4">
          <div
            className="absolute inset-0"
            onClick={() => setIsCommandPaletteOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-[#ffffff] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[70vh]">
            <div className="flex items-center px-4 md:px-6 border-b border-gray-100 bg-white">
              <Search
                size={20}
                className="text-gray-400 mr-3 md:mr-4 shrink-0"
              />
              <input
                ref={commandPaletteInputRef}
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                onKeyDown={handlePaletteKeyDown}
                placeholder="Search math symbols... (e.g. 'root', 'square', 'pi')"
                className="flex-1 py-5 md:py-6 bg-transparent outline-none text-gray-800 text-lg md:text-xl placeholder-gray-400 font-sans tracking-wide"
              />
              <button
                onClick={() => {
                  if (filteredSymbols[paletteSelectedIndex]) {
                    speakText(filteredSymbols[paletteSelectedIndex].name);
                  }
                }}
                className="mr-3 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Repeat voice output (Alt+R)"
              >
                <Volume2 size={20} />
              </button>
              <kbd className="hidden sm:inline-block bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs font-mono text-gray-400 ml-1">
                ESC
              </kbd>
            </div>

            {filteredSymbols.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm md:text-base flex flex-col items-center">
                <Calculator size={40} className="text-gray-200 mb-4" />
                No math symbols found for "{paletteSearch}"
              </div>
            ) : (
              <div
                ref={paletteListRef}
                className="flex-1 overflow-y-auto py-2 bg-gray-50/50"
              >
                {filteredSymbols.map((item, index) => {
                  const isSelected = index === paletteSelectedIndex;
                  return (
                    <button
                      key={item.symbol + index}
                      onClick={() => {
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
                        } else {
                          insertSymbol(item.symbol);
                        }
                      }}
                      onMouseEnter={() => setPaletteSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-4 md:px-6 py-3 text-left transition-all outline-none border-l-4
                               ${isSelected ? "bg-white border-blue-500 shadow-sm" : "border-transparent hover:bg-gray-100/50"}
                            `}
                    >
                      <div className="flex items-center gap-4 md:gap-5">
                        <span
                          className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg text-2xl font-medium shrink-0 transition-colors
                                  ${isSelected ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-white text-gray-800 border border-gray-200 shadow-sm"}
                               `}
                        >
                          {item.symbol}
                        </span>
                        <span
                          className={`text-[15px] md:text-[16px] tracking-wide ${isSelected ? "text-blue-900 font-medium" : "text-gray-600"}`}
                        >
                          {item.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="hidden sm:flex text-xs text-blue-500 items-center gap-2">
                          Press{" "}
                          <kbd className="bg-blue-50 border border-blue-200 shadow-sm rounded-md px-2 py-1 uppercase tracking-wider text-[10px] font-bold text-blue-700">
                            ↵ Enter
                          </kbd>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Broadcast Dialog Overlay */}
      {isBroadcastPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] bg-[#112a3d]/60 backdrop-blur-sm p-4">
          <div
            className="absolute inset-0"
            onClick={() => setIsBroadcastPaletteOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-[#ffffff] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[70vh]">
            <div className="flex items-center px-4 md:px-6 border-b border-gray-100 bg-white">
              <input
                ref={broadcastInputRef}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setBroadcastSelectedIndex((prev) => (prev + 1) % broadcastStudentList.length);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setBroadcastSelectedIndex((prev) => (prev - 1 + broadcastStudentList.length) % broadcastStudentList.length);
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const student = broadcastStudentList[broadcastSelectedIndex];
                    simulateBroadcastReply(student);
                  } else if (e.key === "Escape") {
                    setIsBroadcastPaletteOpen(false);
                    e.preventDefault();
                  }
                }}
                placeholder="Ask who? Use arrows to select, Enter to send"
                className="flex-1 py-5 md:py-6 bg-transparent outline-none text-gray-800 text-lg md:text-xl placeholder-gray-400 font-sans tracking-wide"
                readOnly
              />
            </div>

            <div
              ref={broadcastRef}
              className="overflow-y-auto no-scrollbar flex-1 bg-gray-50/50 p-2 md:p-3"
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
                        ? "bg-blue-600 text-white shadow-md transform scale-[1.01]"
                        : "bg-transparent text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-base md:text-lg font-semibold tracking-wide truncate ${
                          isSelected ? "text-white" : "text-gray-900"
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
            <div className="bg-gray-100 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 flex justify-between items-center shrink-0">
              <span className="text-sm tracking-wide text-gray-500 font-medium">Peer-to-Peer Help Broadcast</span>
              <span className="text-xs tracking-wider text-gray-400 uppercase hidden sm:inline">Use arrows to select</span>
            </div>
          </div>
        </div>
      )}

      {/* Help Menu Overlay */}
      {isHelpMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] bg-[#112a3d]/60 backdrop-blur-sm p-4">
          <div
            className="absolute inset-0"
            onClick={() => setIsHelpMenuOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-[#ffffff] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[70vh]">
            <div className="flex items-center px-4 md:px-6 border-b border-gray-100 bg-white">
              <input
                ref={helpMenuInputRef}
                onKeyDown={handleHelpMenuKeyDown}
                placeholder="Help Menu: Use arrows to navigate, Enter to execute"
                className="flex-1 py-5 md:py-6 bg-transparent outline-none text-gray-800 text-lg md:text-xl placeholder-gray-400 font-sans tracking-wide"
                readOnly
              />
              <button
                onClick={() => {
                  if (HELP_MENU_ITEMS[helpMenuSelectedIndex]) {
                    speakText(HELP_MENU_ITEMS[helpMenuSelectedIndex].text);
                  }
                }}
                className="mr-3 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Repeat voice output"
              >
                <Volume2 size={20} />
              </button>
              <kbd className="hidden sm:inline-block bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs font-mono text-gray-400 ml-1">
                ESC
              </kbd>
            </div>

            <div
              ref={helpMenuRef}
              className="flex-1 overflow-y-auto py-2 bg-gray-50/50"
            >
              {HELP_MENU_ITEMS.map((item, index) => {
                const isSelected = index === helpMenuSelectedIndex;
                return (
                  <button
                    key={item.action + index}
                    onClick={() => {
                      setIsHelpMenuOpen(false);
                      if (item.action === "command_palette") setIsCommandPaletteOpen(true);
                      else if (item.action === "evaluate_math") executeEvaluateMath();
                      else if (item.action === "raise_hand") executeRaiseHand();
                      else if (item.action === "toggle_scratchpad") toggleScratchpad();
                      else if (item.action === "context_locator") triggerContextLocator();
                      else if (item.action === "undo") executeUndo();
                      else if (item.action === "redo") executeRedo();
                    }}
                    onMouseEnter={() => setHelpMenuSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-4 md:px-6 py-3 text-left transition-all outline-none border-l-4
                             ${isSelected ? "bg-white border-blue-500 shadow-sm" : "border-transparent hover:bg-gray-100/50"}
                          `}
                  >
                    <div className="flex flex-col gap-1">
                      <span className={`text-[15px] md:text-[16px] tracking-wide ${isSelected ? "text-blue-900 font-medium" : "text-gray-600"}`}>
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded w-fit text-left">
                        {item.shortcut}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="hidden sm:flex text-xs text-blue-500 items-center gap-2">
                        Press{" "}
                        <kbd className="bg-blue-50 border border-blue-200 shadow-sm rounded-md px-2 py-1 uppercase tracking-wider text-[10px] font-bold text-blue-700">
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
