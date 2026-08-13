"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, AlertTriangle, RefreshCw, Phone, Monitor, User } from "lucide-react";

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState({ total_calls: 0, successful_calls: 0, failed_calls: 0 });
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [overviewRes, callsRes] = await Promise.all([
        fetch("/api/analytics/overview"),
        fetch("/api/analytics/calls")
      ]);
      
      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setOverview(data);
      }
      if (callsRes.ok) {
        const data = await callsRes.json();
        setCalls(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Auto refresh
    return () => clearInterval(interval);
  }, []);

  const successRate = overview.total_calls > 0 
    ? Math.round((overview.successful_calls / overview.total_calls) * 100) 
    : 0;

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "Z");
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getOutcomeColor = (outcome: string) => {
    if (outcome === "SUCCESS") return "text-green-500 bg-green-500/10 border-green-500/20";
    if (outcome === "FAILED") return "text-red-500 bg-red-500/10 border-red-500/20";
    return "text-sky-500 bg-sky-500/10 border-sky-500/20";
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white p-4 md:p-8 font-sans selection:bg-[#38bdf8]/30">
      <div className="max-w-6xl mx-auto space-y-8 pt-10">
        
        {/* Header */}
        <header className="flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
              <span className="font-semibold text-white">FINVOICE</span>
              <span className="text-white/40">/</span>
              <span className="text-white/80">Call Intelligence</span>
            </h1>
            <p className="text-white/50 mt-2 text-sm">Understand how your voice agent is performing.</p>
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm px-4 py-2 rounded-full border border-white/10 hover:bg-white/5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-start mb-4">
              <p className="text-white/50 text-xs font-semibold tracking-wider">TOTAL CALLS</p>
              <Phone size={16} className="text-blue-500" />
            </div>
            <p className="text-4xl font-light">{overview.total_calls}</p>
            <p className="text-white/40 text-xs mt-2">All conversations</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-start mb-4">
              <p className="text-white/50 text-xs font-semibold tracking-wider">SUCCESSFUL CALLS</p>
              <CheckCircle size={16} className="text-green-500" />
            </div>
            <p className="text-4xl font-light">{overview.successful_calls}</p>
            <p className="text-white/40 text-xs mt-2">Completed financial tasks</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-start mb-4">
              <p className="text-white/50 text-xs font-semibold tracking-wider">FAILED CALLS</p>
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <p className="text-4xl font-light">{overview.failed_calls}</p>
            <p className="text-white/40 text-xs mt-2">Tasks not completed</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-start mb-4">
              <p className="text-white/50 text-xs font-semibold tracking-wider">SUCCESS RATE</p>
              <RefreshCw size={16} className="text-sky-500" />
            </div>
            <p className="text-4xl font-light">{successRate}%</p>
            <p className="text-white/40 text-xs mt-2">Of total interactions</p>
          </div>
        </div>

        {/* Visualizer / Chart Placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-sm font-semibold tracking-wide text-white/80 mb-6">CALL PERFORMANCE</h2>
          <div className="w-full h-12 rounded-full overflow-hidden flex bg-white/5 border border-white/10">
            {overview.total_calls > 0 ? (
              <>
                <div 
                  className="h-full bg-green-500/80 transition-all duration-1000" 
                  style={{ width: `${(overview.successful_calls / overview.total_calls) * 100}%` }}
                />
                <div 
                  className="h-full bg-red-500/80 transition-all duration-1000" 
                  style={{ width: `${(overview.failed_calls / overview.total_calls) * 100}%` }}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-xs tracking-widest font-mono">
                AWAITING DATA
              </div>
            )}
          </div>
          <div className="flex justify-between mt-4 text-xs font-mono text-white/40">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              SUCCESSFUL
            </div>
            <div className="flex items-center gap-2">
              FAILED
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
            </div>
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
            <h2 className="text-sm font-semibold tracking-wide text-white/80">RECENT CALLS</h2>
          </div>
          <div className="overflow-x-auto">
            {loading && calls.length === 0 ? (
              <div className="p-12 text-center text-white/40 text-sm font-mono">Loading telemetry...</div>
            ) : calls.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Monitor size={24} className="text-white/20" />
                </div>
                <p className="text-white/50 mb-1">NO CALLS YET</p>
                <p className="text-white/30 text-xs">Your call analytics will appear here after your first conversation.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-semibold tracking-wider text-white/40 uppercase">
                    <th className="p-4 pl-6">Time</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Channel</th>
                    <th className="p-4">Outcome</th>
                    <th className="p-4 pr-6">Task</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {calls.map((call, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6 text-white/60 font-mono text-xs">{formatTime(call.started_at)}</td>
                      <td className="p-4 text-white/60 font-mono text-xs">{formatDuration(call.duration)}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 capitalize text-white/70 text-xs font-medium bg-white/5 border border-white/10 rounded px-2 py-1 w-fit">
                          {call.channel === 'twilio' ? <Phone size={12} /> : <Monitor size={12} />}
                          {call.channel}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getOutcomeColor(call.outcome)}`}>
                          {call.outcome}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-white/80">
                        {call.success_reason 
                          ? call.success_reason.replace(/_/g, ' ') 
                          : call.failure_reason 
                            ? call.failure_reason.replace(/_/g, ' ') 
                            : 'Unknown Task'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
