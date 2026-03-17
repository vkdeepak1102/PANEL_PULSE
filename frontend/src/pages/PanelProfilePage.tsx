import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { panelApi } from '@/lib/api/panel.api';
import { ArrowLeft, UserCircle, Target, TrendingUp, Calendar, Download, Mail, Fingerprint } from 'lucide-react';
import {
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

interface PanelProfileData {
  panelName: string;
  employeeId: string;
  email: string;
  totalEvaluations: number;
  averageScore: number;
  dimensionAverages: Record<string, number>;
  history: Array<{
    id: string;
    jobId: string;
    candidateName: string;
    score: number;
    date: string;
  }>;
}

export default function PanelProfilePage() {
  const { panelName } = useParams<{ panelName: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PanelProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!panelName) return;
    panelApi.getPanelProfile(panelName).then((res) => {
      if (res.success) {
        setData(res.data);
      }
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [panelName]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex-1 overflow-y-auto bg-bg-base p-8 flex items-center justify-center">
          <div className="text-text-muted">Loading profile data...</div>
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <div className="flex-1 overflow-y-auto bg-bg-base p-8">
          <div className="text-center text-text-muted py-12">Profile not found.</div>
        </div>
      </AppShell>
    );
  }

  // Format data for radar chart
  const radarData = Object.entries(data.dimensionAverages).map(([subject, score]) => ({
    subject,
    score,
    fullMark: subject.includes('Mandatory') || subject.includes('Depth') ? 2.5 : 1.0 // rough approximation for visuals
  }));

  // Format data for line chart
  const lineData = [...data.history].reverse().map((h, i) => ({
    name: `Interview ${i + 1}`,
    score: h.score,
    date: h.date,
    detail: h.candidateName
  }));

  const scoreCategory = data.averageScore >= 8 ? 'text-emerald-400' : data.averageScore >= 5 ? 'text-orange-400' : 'text-red-400';

  function downloadReport() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const historyRows = data!.history.map(h => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${h.jobId}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${h.candidateName}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right"><strong>${h.score.toFixed(1)}</strong></td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Panelist Report — ${data!.panelName}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1f2937; }
    .header { font-size: 24px; font-weight: bold; border-bottom: 2px solid #6366f1; padding-bottom: 10px; margin-bottom: 20px; }
    .meta { display: flex; gap: 40px; margin-bottom: 30px; font-size: 14px; }
    .meta-box { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; width: 100%; }
    .meta-title { font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
    th { background: #f3f4f6; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <div style="display:flex; align-items:center; gap:12px; margin-bottom: 10px;">
      <img src="${window.location.origin}/INDIUM LOGO.png" alt="Indium Logo" style="height:32px; object-fit:contain;" />
    </div>
    Panel Member Profile: ${data!.panelName}
    <div style="font-size: 12px; font-weight: normal; color: #6b7280; margin-top: 5px;">Generated on ${dateStr} ${timeStr}</div>
  </div>
  
  <div class="meta">
    <div class="meta-box">
      <div class="meta-title">Details</div>
      <div><strong>ID:</strong> ${data!.employeeId}</div>
      <div style="margin-top:4px"><strong>Email:</strong> ${data!.email}</div>
    </div>
    <div class="meta-box">
      <div class="meta-title">Performance summary</div>
      <div><strong>Interviews Conducted:</strong> ${data!.totalEvaluations}</div>
      <div style="margin-top:4px; font-size: 18px"><strong>Average Score:</strong> ${data!.averageScore.toFixed(1)} / 10</div>
    </div>
  </div>

  <div style="font-weight: bold; margin-bottom: 10px; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Evaluation History</div>
  <table>
    <thead>
      <tr>
        <th>Candidate ID</th>
        <th>Candidate</th>
        <th style="text-align:right">Score</th>
      </tr>
    </thead>
    <tbody>
      ${historyRows}
    </tbody>
  </table>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panelist-profile-${data!.panelName.replace(/\s+/g, '-')}-${now.toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto bg-bg-base p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/panels')}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </button>
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 text-sm bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-4 py-2 rounded-lg border border-indigo-500/20 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export Profile
            </button>
          </div>

          <div className="flex items-start justify-between bg-bg-card border border-white/[0.06] p-6 rounded-xl">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-2xl uppercase border border-indigo-500/30">
                {data.panelName.substring(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                  {data.panelName}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1.5 text-text-muted">
                    <Fingerprint className="w-3.5 h-3.5" />
                    {data.employeeId}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/20"></span>
                  <span className="flex items-center gap-1.5 text-text-muted">
                    <Mail className="w-3.5 h-3.5" />
                    {data.email}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-6 text-center items-center">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Total Interviews</p>
                <p className="text-2xl font-bold text-text-primary">{data.totalEvaluations}</p>
              </div>
              <div className="w-px h-10 bg-white/[0.06]"></div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Avg Score</p>
                <div className="flex items-baseline gap-1 justify-center">
                  <span className={`text-2xl font-bold ${scoreCategory}`}>{data.averageScore.toFixed(1)}</span>
                  <span className="text-sm text-text-muted">/ 10</span>
                </div>
              </div>
            </div>
            <div className="bg-bg-card border border-white/[0.06] p-6 rounded-xl flex flex-col hidden">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-text-primary">Dimension Strengths</h2>
              </div>
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar
                      name={data.panelName}
                      dataKey="score"
                      stroke="#818cf8"
                      fill="#818cf8"
                      fillOpacity={0.4}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1e28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-bg-card rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="p-5 border-b border-white/[0.06] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-text-primary">Evaluation History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-muted uppercase bg-white/[0.02] border-b border-white/[0.06]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Candidate ID</th>
                    <th className="px-6 py-4 font-semibold">Candidate Name</th>
                    <th className="px-6 py-4 font-semibold text-right">Panel Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {data.history.map((h, i) => {
                    const rowCat = h.score >= 8 ? 'text-emerald-400' : h.score >= 5 ? 'text-orange-400' : 'text-red-400';
                    return (
                      <tr key={h.id || i} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 font-medium text-text-primary">
                          <button
                            onClick={() => navigate(`/results/${h.id}`)}
                            className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors focus:outline-none"
                            title="View Full Report"
                          >
                            {h.jobId || 'N/A'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {h.candidateName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-semibold ${rowCat}`}>{h.score.toFixed(1)}</span>
                          <span className="text-text-muted text-xs ml-1">/ 10</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </AppShell>
  );
}
