import React, { useState } from "react";
import { CheckCircle, Flag, Mic, Check, AlertCircle, X } from "lucide-react";

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
  const [viewFilter, setViewFilter] = useState<"submitted" | "missing">("submitted");

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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 p-4 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Teacher Feed</h1>
            <p className="text-sm text-gray-500">Algebraic Linear Equations</p>
          </div>
          <button
            onClick={onBackToStudent}
            className="text-sm px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-md hover:bg-blue-100 transition-colors"
          >
            Switch to Lab View
          </button>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewFilter("submitted")}
            className={`flex-1 flex justify-center items-center py-2 text-sm font-medium rounded-md transition-colors ${
              viewFilter === "submitted" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            }`}
          >
            📥 Submitted: 38
          </button>
          <button
            onClick={() => setViewFilter("missing")}
            className={`flex-1 flex justify-center items-center py-2 text-sm font-medium rounded-md transition-colors ${
              viewFilter === "missing" ? "bg-white text-orange-600 shadow-sm bg-orange-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            }`}
          >
            ⚠️ Missing: 7
          </button>
        </div>
      </header>

      {/* Active Queue Dropdown */}
      {queue.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <button 
            onClick={() => setIsQueueExpanded(!isQueueExpanded)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-medium text-sm transition-colors border-b border-red-100"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Active Queue ({queue.length})
          </button>
          
          {isQueueExpanded && (
            <div className="divide-y divide-gray-100 max-h-[40vh] overflow-y-auto">
              {queue.map((student, idx) => (
                <div key={student.id} className="p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">{idx + 1}. {student.name}</span>
                      <span className="text-gray-500 text-xs ml-2">{student.timestamp}</span>
                    </div>
                    <button 
                      onClick={() => onTeacherReady(student.id)}
                      className="px-3 py-1.5 bg-[#112a3d] hover:bg-[#1a3f5c] text-white text-xs font-medium rounded-full transition-colors"
                    >
                      I'm Ready
                    </button>
                  </div>
                  {student.currentLineText && (
                    <div className="font-mono text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded">
                      <span className="text-gray-400">Current work:</span> {student.currentLineText}
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
        {viewFilter === "submitted" ? (
          <>
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-colors ${
                  submission.status === "approved"
                    ? "border-green-200 bg-green-50/30"
                    : submission.status === "flagged"
                    ? "border-amber-200 bg-amber-50/30"
                    : "border-gray-200"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-[16px] font-semibold text-gray-900">
                      {submission.studentName}
                    </h3>
                    <div className="flex items-center text-[13px] text-gray-500 gap-2 mt-0.5">
                      <span>{submission.className}</span>
                      <span>•</span>
                      <span>{submission.timestamp}</span>
                    </div>
                  </div>
                  <div>
                    {submission.status === "approved" && (
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                        <Check size={14} /> Approved
                      </span>
                    )}
                    {submission.status === "flagged" && (
                      <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
                        <AlertCircle size={14} /> Flagged
                      </span>
                    )}
                    {submission.status === "pending" && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body - Math Layout */}
                <div className="p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMC41IiBmaWxsPSIjY2JkNWUxIi8+PC9zdmc+')] bg-[length:20px_20px]">
                  <div className="bg-white/80 p-3 rounded shadow-sm border border-gray-100">
                    {submission.lines.map((line, index) => (
                      <div
                        key={line.id}
                        className="flex text-[18px] sm:text-[20px] font-mono leading-loose"
                      >
                        <span className="w-8 text-gray-400 select-none text-right pr-2 text-[14px] flex items-center justify-end">
                          {index + 1}.
                        </span>
                        <span
                          className={`flex-1 ${
                            line.isFlagged ? "bg-amber-100 text-amber-900 px-2 rounded -ml-2" : "text-gray-800"
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
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-800 text-sm">Tap a line to flag:</h4>
                      <button
                        onClick={() => setActiveFlagSubmissionId(null)}
                        className="text-gray-400 hover:text-gray-600"
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
                            className="text-left font-mono text-sm px-3 py-2 bg-white border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition-colors"
                          >
                            <span className="text-gray-400 mr-2">{index + 1}.</span>
                            {line.text}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-sm text-gray-500 mb-2">Select feedback for highlighted line:</p>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_FEEDBACKS.map((fb) => (
                            <button
                              key={fb}
                              onClick={() => submitFeedback(fb)}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
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
                  <div className="flex bg-gray-50 border-t border-gray-100 divide-x divide-gray-200">
                    <button
                      onClick={() => handleApprove(submission.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-4 text-[#112a3d] hover:bg-[#112a3d]/5 hover:text-green-700 font-medium transition-colors"
                    >
                      <CheckCircle size={20} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleFlagStepClick(submission.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-4 text-[#112a3d] hover:bg-[#112a3d]/5 font-medium transition-colors"
                    >
                      <Flag size={20} />
                      Flag Step
                    </button>
                    <button
                      onClick={() => alert("Microphone UI would open here for voice note")}
                      className="flex-1 flex items-center justify-center gap-2 py-4 text-[#112a3d] hover:bg-[#112a3d]/5 font-medium transition-colors"
                    >
                      <Mic size={20} />
                      Voice Note
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div className="text-center py-8 text-sm text-gray-400">
              No more pending submissions. You're all caught up!
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-500" />
                Missing Work ({MISSING_MOCK_DATA.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {MISSING_MOCK_DATA.map((student, idx) => (
                <div key={student.id} className="p-4 flex items-center hover:bg-gray-50 transition-colors">
                  <span className="text-gray-400 text-sm w-6">{idx + 1}.</span>
                  <span className="font-medium text-gray-900">{student.name}</span>
                  <span className="ml-auto text-sm text-gray-500 border border-gray-200 px-2 py-1 rounded bg-white">Not Submitted</span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
              <button 
                onClick={onPingMissing}
                className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-sm"
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
