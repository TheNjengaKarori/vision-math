import React, { useState } from "react";
import { CheckCircle, Flag, Mic, Check, AlertCircle, X, Inbox, BarChart2, Radio } from "lucide-react";

export interface MathLine {
  id: string;
  text: string;
  isFlagged?: boolean;
  feedback?: string;
}

export interface Submission {
  id: string;
  studentName: string;
  className: string;
  timestamp: string;
  status: "pending" | "approved" | "flagged";
  lines: MathLine[];
}

const INITIAL_MOCK_DATA: Submission[] = [
  {
    id: "sub_1",
    studentName: "Kelvin Mwangi",
    className: "Form 1B",
    timestamp: "10 mins ago",
    status: "pending",
    lines: [
      { id: "L1", text: "2x + 5 = 15" },
      { id: "L2", text: "2x = 15 - 5" },
      { id: "L3", text: "2x = 10" },
      { id: "L4", text: "x = 10 / 2" },
      { id: "L5", text: "x = 5" },
    ],
  },
  {
    id: "sub_2",
    studentName: "Amina Hassan",
    className: "Form 1B",
    timestamp: "25 mins ago",
    status: "pending",
    lines: [
      { id: "L1", text: "3(x - 2) = 9" },
      { id: "L2", text: "3x - 6 = 9" },
      { id: "L3", text: "3x = 9 - 6" }, // Mistake here (should be + 6)
      { id: "L4", text: "3x = 3" },
      { id: "L5", text: "x = 1" },
    ],
  },
  {
    id: "sub_3",
    studentName: "Brian Ochieng",
    className: "Form 1B",
    timestamp: "1 hour ago",
    status: "pending",
    lines: [
      { id: "L1", text: "4y - 2 = 10" },
      { id: "L2", text: "4y = 12" },
      { id: "L3", text: "y = 3" },
    ],
  },
];

const PRESET_FEEDBACKS = [
  "Check your signs (+/-)",
  "Review division step",
  "Multiply term across bracket",
  "Combine like terms first",
];

interface RaisedHand {
  id: string;
  name: string;
  timestamp: string;
  currentLineText?: string;
}

interface TeacherFeedViewProps {
  onBackToStudent: () => void;
  onMockFeedbackGiven: (submissionId: string, lineId: string, feedback: string) => void;
  queue: RaisedHand[];
  onTeacherReady: (studentId: string) => void;
  onPingMissing: () => void;
}

const MISSING_MOCK_DATA = [
  { id: "m_1", name: "David Ochieng" },
  { id: "m_2", name: "Sarah Njoroge" },
  { id: "m_3", name: "John Doe" },
  { id: "m_4", name: "Jane Smith" },
  { id: "m_5", name: "Mike Johnson" },
  { id: "m_6", name: "Emily Brown" },
  { id: "m_7", name: "Daniel Kipkemboi" }
];

export const TeacherFeedView: React.FC<TeacherFeedViewProps> = ({
  onBackToStudent,
  onMockFeedbackGiven,
  queue,
  onTeacherReady,
  onPingMissing,
}) => {
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_MOCK_DATA);
  const [activeFlagSubmissionId, setActiveFlagSubmissionId] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [isQueueExpanded, setIsQueueExpanded] = useState(false);
  const [viewFilter, setViewFilter] = useState<"dashboard" | "submitted" | "missing">("dashboard");

  const handleApprove = (id: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: "approved" } : sub))
    );
  };

  const handleFlagStepClick = (id: string) => {
    setActiveFlagSubmissionId(id);
    setSelectedLineId(null);
  };

  const submitFeedback = (feedback: string) => {
    if (!activeFlagSubmissionId || !selectedLineId) return;

    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === activeFlagSubmissionId) {
          const newLines = sub.lines.map((l) =>
            l.id === selectedLineId ? { ...l, isFlagged: true, feedback } : l
          );
          return { ...sub, status: "flagged", lines: newLines };
        }
        return sub;
      })
    );

    onMockFeedbackGiven(activeFlagSubmissionId, selectedLineId, feedback);

    // Reset flow
    setActiveFlagSubmissionId(null);
    setSelectedLineId(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#0c1f2e] border-b border-[#316995]/30 sticky top-0 z-10 p-4 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Teacher Feed</h1>
            <p className="text-sm text-[#86a8c3]">Algebraic Linear Equations</p>
          </div>
          <button
            onClick={onBackToStudent}
            className="text-sm px-4 py-2 bg-cyan-900/40 text-cyan-400 font-bold rounded-md hover:bg-cyan-900/60 hover:text-white transition-colors"
          >
            Switch to Lab View
          </button>
        </div>
        <div className="flex bg-[#112a3d] p-1 rounded-lg">
          <button
            onClick={() => setViewFilter("dashboard")}
            className={`flex-1 flex justify-center items-center py-2 text-sm font-medium rounded-md transition-colors ${
              viewFilter === "dashboard" ? "bg-[#1a4b6e] text-cyan-400 shadow-sm" : "text-[#86a8c3] hover:text-white hover:bg-[#1a4b6e]/50"
            }`}
          >
            <BarChart2 size={16} className="mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setViewFilter("submitted")}
            className={`flex-1 flex justify-center items-center py-2 text-sm font-medium rounded-md transition-colors ${
              viewFilter === "submitted" ? "bg-[#1a4b6e] text-cyan-400 shadow-sm" : "text-[#86a8c3] hover:text-white hover:bg-[#1a4b6e]/50"
            }`}
          >
            <Inbox size={16} className="mr-2" />
            Submitted: 38
          </button>
          <button
            onClick={() => setViewFilter("missing")}
            className={`flex-1 flex justify-center items-center py-2 text-sm font-bold rounded-md transition-colors ${
              viewFilter === "missing" ? "text-orange-400 shadow-sm bg-[#1a4b6e]" : "text-[#86a8c3] hover:text-white hover:bg-[#1a4b6e]/50"
            }`}
          >
            <AlertCircle size={16} className="mr-2" />
            Missing: 7
          </button>
        </div>
      </header>

      {/* Active Queue Dropdown */}
      {queue.length > 0 && (
        <div className="bg-[#0c1f2e] border-b border-[#316995]/30">
          <button 
            onClick={() => setIsQueueExpanded(!isQueueExpanded)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 font-bold text-sm transition-colors border-b border-red-900/30"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Active Queue ({queue.length})
          </button>
          
          {isQueueExpanded && (
            <div className="divide-y divide-[#316995]/30 max-h-[40vh] overflow-y-auto">
              {queue.map((student, idx) => (
                <div key={student.id} className="p-4 flex flex-col gap-2 hover:bg-[#112a3d] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{idx + 1}. {student.name}</span>
                      <span className="text-[#86a8c3] text-xs ml-2">{student.timestamp}</span>
                    </div>
                    <button 
                      onClick={() => onTeacherReady(student.id)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-full transition-colors"
                    >
                      I'm Ready
                    </button>
                  </div>
                  {student.currentLineText && (
                    <div className="font-mono text-xs text-white bg-[#1a4b6e] px-3 py-2 rounded">
                      <span className="text-cyan-400 font-bold">Current work:</span> {student.currentLineText}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feed Stream */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {viewFilter === "dashboard" ? (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0c1f2e] p-5 rounded-xl border border-[#316995]/30 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-[#86a8c3] text-sm uppercase font-bold tracking-wider mb-2">Class Progress</span>
                <span className="text-4xl font-bold text-cyan-400 mb-1">82%</span>
                <span className="text-sm text-cyan-400/70">Completion rate</span>
              </div>
              <div className="bg-[#0c1f2e] p-5 rounded-xl border border-[#316995]/30 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-[#86a8c3] text-sm uppercase font-bold tracking-wider mb-2">Active Alerts</span>
                <span className="text-4xl font-bold text-amber-500 mb-1">3</span>
                <span className="text-sm text-amber-500/70">Common mistakes detected</span>
              </div>
            </div>

            <div className="bg-[#0c1f2e] rounded-xl border border-[#316995]/30 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#316995]/30 bg-[#112a3d] flex items-center justify-between">
                 <h3 className="font-bold text-white text-lg">Real-Time Insights</h3>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="bg-[#1a4b6e]/30 px-4 py-3 rounded-lg border border-[#1a4b6e] flex items-start gap-4">
                  <div className="bg-[#1a4b6e] p-2 rounded text-cyan-300 mt-0.5">
                    <Flag size={18} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Common Mistake: Sign errors</h4>
                    <p className="text-[#86a8c3] text-sm">3 students entered incorrect signs for <span className="text-white font-mono bg-[#112a3d] px-1 rounded">5 - (-3)</span>.</p>
                  </div>
                </div>
                
                <div className="bg-amber-900/20 px-4 py-3 rounded-lg border border-amber-900/30 flex items-start gap-4">
                  <div className="bg-amber-900/40 p-2 rounded text-amber-400 mt-0.5">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <h4 className="text-amber-400 font-bold mb-1">Stuck on Step 3</h4>
                    <p className="text-[#86a8c3] text-sm">Most students are stuck on Step 3 (combine like terms). Consider intervening.</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert("Broadcasting explanation logic...")}
              className="mt-2 w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-3 transition-colors shadow-lg border border-blue-400/50 outline-none focus:ring-2 focus:ring-blue-400"
            >
              <Radio size={22} className="animate-pulse" />
              Pause All Students & Broadcast Explanation
            </button>
          </div>
        ) : viewFilter === "submitted" ? (
          <>
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className={`bg-[#0c1f2e] rounded-xl shadow-sm border overflow-hidden transition-colors ${
                  submission.status === "approved"
                    ? "border-green-500/50 bg-[#0c1f2e]"
                    : submission.status === "flagged"
                    ? "border-amber-500/50 bg-[#0c1f2e]"
                    : "border-[#316995]/30"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#316995]/30 pb-3 bg-[#112a3d]">
                  <div>
                    <h3 className="text-[16px] font-bold text-white">
                      {submission.studentName}
                    </h3>
                    <div className="flex items-center text-[13px] text-[#86a8c3] gap-2 mt-0.5">
                      <span>{submission.className}</span>
                      <span>•</span>
                      <span>{submission.timestamp}</span>
                    </div>
                  </div>
                  <div>
                    {submission.status === "approved" && (
                      <span className="flex items-center gap-1 bg-green-900/30 text-green-400 border border-green-500/50 text-xs font-bold px-2 py-1 rounded-full">
                        <Check size={14} /> Approved
                      </span>
                    )}
                    {submission.status === "flagged" && (
                      <span className="flex items-center gap-1 bg-amber-900/30 text-amber-500 border border-amber-500/50 text-xs font-bold px-2 py-1 rounded-full">
                        <AlertCircle size={14} /> Flagged
                      </span>
                    )}
                    {submission.status === "pending" && (
                      <span className="text-cyan-400 border border-cyan-400/50 bg-cyan-900/20 text-xs font-bold px-2 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body - Math Layout */}
                <div className="p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMC41IiBmaWxsPSIjMzE2OTk1Ii8+PC9zdmc+')] bg-[length:20px_20px]">
                  <div className="bg-[#112a3d]/90 p-3 rounded shadow-sm border border-[#316995]/50">
                    {submission.lines.map((line, index) => (
                      <div
                        key={line.id}
                        className="flex text-[18px] sm:text-[20px] font-mono leading-loose"
                      >
                        <span className="w-8 text-[#86a8c3] select-none text-right pr-2 text-[14px] flex items-center justify-end font-bold">
                          {index + 1}.
                        </span>
                        <span
                          className={`flex-1 ${
                            line.isFlagged ? "bg-amber-900/30 text-amber-400 font-bold px-2 rounded -ml-2" : "text-white"
                          }`}
                        >
                          {line.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flag Overlay */}
                {activeFlagSubmissionId === submission.id && (
                  <div className="p-4 bg-[#112a3d] border-t border-[#316995]/30">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-white text-sm">Tap a line to flag:</h4>
                      <button
                        onClick={() => setActiveFlagSubmissionId(null)}
                        className="text-[#86a8c3] hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    {!selectedLineId ? (
                      <div className="flex flex-col gap-1">
                        {submission.lines.map((line, index) => (
                          <button
                            key={line.id}
                            onClick={() => setSelectedLineId(line.id)}
                            className="text-left font-mono text-sm px-3 py-2 bg-[#0c1f2e] border border-[#316995]/50 rounded hover:border-amber-500 hover:bg-amber-900/20 text-white transition-colors"
                          >
                            <span className="text-[#86a8c3] font-bold mr-2">{index + 1}.</span>
                            {line.text}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-sm text-cyan-400 mb-2">Select feedback for highlighted line:</p>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_FEEDBACKS.map((fb) => (
                            <button
                              key={fb}
                              onClick={() => submitFeedback(fb)}
                              className="px-3 py-1.5 bg-[#0c1f2e] border border-[#316995]/80 text-white font-medium text-sm rounded-full hover:bg-cyan-900/50 hover:text-cyan-300 hover:border-cyan-400 transition-colors"
                            >
                              {fb}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Actions */}
                {submission.status === "pending" && activeFlagSubmissionId !== submission.id && (
                  <div className="flex bg-[#112a3d] border-t border-[#316995]/30 divide-x divide-[#316995]/30">
                    <button
                      onClick={() => handleApprove(submission.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-4 text-white hover:bg-green-900/20 hover:text-green-400 font-bold transition-colors"
                    >
                      <CheckCircle size={20} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleFlagStepClick(submission.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-4 text-white hover:bg-amber-900/20 hover:text-amber-400 font-bold transition-colors"
                    >
                      <Flag size={20} />
                      Flag Step
                    </button>
                    <button
                      onClick={() => alert("Microphone UI would open here for voice note")}
                      className="flex-1 flex items-center justify-center gap-2 py-4 text-white hover:bg-cyan-900/20 hover:text-cyan-400 font-bold transition-colors"
                    >
                      <Mic size={20} />
                      Voice Note
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div className="text-center py-8 text-sm text-[#86a8c3] font-medium">
              No more pending submissions. You're all caught up!
            </div>
          </>
        ) : (
          <div className="bg-[#0c1f2e] rounded-xl shadow-sm border border-[#316995]/30 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#316995]/30 bg-[#112a3d] flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-500" />
                Missing Work ({MISSING_MOCK_DATA.length})
              </h3>
            </div>
            <div className="divide-y divide-[#316995]/30 max-h-[60vh] overflow-y-auto">
              {MISSING_MOCK_DATA.map((student, idx) => (
                <div key={student.id} className="p-4 flex items-center hover:bg-[#112a3d] transition-colors">
                  <span className="text-[#86a8c3] font-bold text-sm w-6">{idx + 1}.</span>
                  <span className="font-bold text-white">{student.name}</span>
                  <span className="ml-auto text-sm text-orange-400 font-bold border border-orange-500/30 px-2 py-1 rounded bg-orange-900/20">Not Submitted</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-[#112a3d] border-t border-[#316995]/30 text-center">
              <button 
                onClick={onPingMissing}
                className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-colors shadow-sm"
              >
                Ping All Missing
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
