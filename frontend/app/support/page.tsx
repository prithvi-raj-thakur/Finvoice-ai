"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns"; // We might not have date-fns, let's use a simple format
import { Clock, CheckCircle, AlertTriangle, User, RefreshCw, MessageSquare } from "lucide-react";

export default function SupportDashboard() {
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscalation, setSelectedEscalation] = useState<any | null>(null);

  const fetchEscalations = async () => {
    try {
      const res = await fetch("/api/escalations");
      if (res.ok) {
        const data = await res.json();
        setEscalations(data.escalations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
    const interval = setInterval(fetchEscalations, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (referenceId: string, status: string) => {
    try {
      const res = await fetch("/api/escalations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference_id: referenceId, status })
      });
      if (res.ok) {
        fetchEscalations();
        if (selectedEscalation?.reference_id === referenceId) {
          setSelectedEscalation({ ...selectedEscalation, status });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openCount = escalations.filter(e => e.status === "OPEN").length;
  const inProgressCount = escalations.filter(e => e.status === "IN_PROGRESS").length;
  const resolvedCount = escalations.filter(e => e.status === "RESOLVED").length;
  const highPriorityCount = escalations.filter(e => e.urgency.toLowerCase() === "high").length;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "high":
      case "emergency":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "IN_PROGRESS":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "RESOLVED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "Z"); // SQLite dates are UTC in our DB
    const diff = Math.floor((Date.now() - date.getTime()) / 60000); // minutes
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
              <span className="font-semibold text-white">FINVOICE</span>
              <span className="text-white/40">/</span>
              <span className="text-white/80">Human Support Center</span>
            </h1>
            <p className="text-white/50 mt-2 text-sm">Review conversations that require human assistance.</p>
          </div>
          <button 
            onClick={fetchEscalations}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm px-4 py-2 rounded-full border border-white/10 hover:bg-white/5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "OPEN REQUESTS", value: openCount, icon: Clock, color: "text-blue-500" },
            { label: "HIGH PRIORITY", value: highPriorityCount, icon: AlertTriangle, color: "text-red-500" },
            { label: "IN PROGRESS", value: inProgressCount, icon: RefreshCw, color: "text-purple-500" },
            { label: "RESOLVED", value: resolvedCount, icon: CheckCircle, color: "text-green-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex justify-between items-start mb-4">
                <p className="text-white/50 text-xs font-semibold tracking-wider">{stat.label}</p>
                <stat.icon size={16} className={stat.color} />
              </div>
              <p className="text-4xl font-light">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          
          {/* List */}
          <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
              <h2 className="text-sm font-semibold tracking-wide text-white/80">ESCALATION REQUESTS</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {loading && escalations.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-sm">Loading...</div>
              ) : escalations.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-sm">No requests found</div>
              ) : (
                escalations.map((esc) => (
                  <button
                    key={esc.reference_id}
                    onClick={() => setSelectedEscalation(esc)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedEscalation?.reference_id === esc.reference_id 
                        ? "bg-purple-500/10 border-purple-500/30" 
                        : "border-transparent hover:bg-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs text-white/70">{esc.reference_id}</span>
                      <span className="text-[10px] text-white/40">{formatTime(esc.created_at)}</span>
                    </div>
                    <p className="font-medium text-sm mb-3 text-white/90 truncate">{esc.reason.replace("_", " ")}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getUrgencyColor(esc.urgency)}`}>
                        {esc.urgency}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(esc.status)}`}>
                        {esc.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-md">
            {selectedEscalation ? (
              <>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2 flex items-center gap-3">
                      {selectedEscalation.reason.replace("_", " ")}
                      <span className={`text-xs uppercase font-bold px-2 py-1 rounded border ${getUrgencyColor(selectedEscalation.urgency)}`}>
                        {selectedEscalation.urgency} Priority
                      </span>
                    </h2>
                    <p className="font-mono text-sm text-white/50">{selectedEscalation.reference_id}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedEscalation.status !== "IN_PROGRESS" && (
                      <button 
                        onClick={() => updateStatus(selectedEscalation.reference_id, "IN_PROGRESS")}
                        className="px-4 py-2 text-sm rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 transition-colors font-medium"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {selectedEscalation.status !== "RESOLVED" && (
                      <button 
                        onClick={() => updateStatus(selectedEscalation.reference_id, "RESOLVED")}
                        className="px-4 py-2 text-sm rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 transition-colors font-medium"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  
                  {/* Meta Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
                    <div>
                      <p className="text-[10px] uppercase text-white/40 mb-1 font-semibold tracking-wider">User</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <User size={14} className="text-white/50" />
                        {selectedEscalation.user_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-white/40 mb-1 font-semibold tracking-wider">Status</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedEscalation.status === 'OPEN' ? 'bg-blue-500' : selectedEscalation.status === 'IN_PROGRESS' ? 'bg-purple-500' : 'bg-green-500'}`} />
                        {selectedEscalation.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-white/40 mb-1 font-semibold tracking-wider">Language</p>
                      <p className="text-sm font-medium">{selectedEscalation.language || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-white/40 mb-1 font-semibold tracking-wider">Follow-up</p>
                      <p className="text-sm font-medium capitalize">{selectedEscalation.preferred_follow_up}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h3 className="text-xs uppercase text-purple-400 font-semibold tracking-wider mb-3 flex items-center gap-2">
                      <MessageSquare size={14} /> Agent Summary
                    </h3>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-white/80 leading-relaxed text-sm">
                      {selectedEscalation.summary}
                    </div>
                  </div>

                  {/* What Happened */}
                  <div>
                    <h3 className="text-xs uppercase text-white/50 font-semibold tracking-wider mb-3">User Report (What Happened)</h3>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-white/70 leading-relaxed text-sm">
                      {selectedEscalation.what_happened}
                    </div>
                  </div>

                  {/* What Agent Checked */}
                  <div>
                    <h3 className="text-xs uppercase text-white/50 font-semibold tracking-wider mb-3">Agent Actions (What FinVoice Checked)</h3>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-white/70 leading-relaxed text-sm">
                      {selectedEscalation.what_agent_checked}
                    </div>
                  </div>

                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-white/30 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <AlertTriangle size={24} className="text-white/20" />
                </div>
                <p className="text-lg font-medium text-white/50">No Request Selected</p>
                <p className="text-sm mt-2 max-w-sm">Select an escalation request from the left panel to review its details and take action.</p>
              </div>
            )}
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
