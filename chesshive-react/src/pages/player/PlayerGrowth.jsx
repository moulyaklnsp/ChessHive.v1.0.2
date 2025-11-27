import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'chart.js/auto';
import usePlayerTheme from '../../hooks/usePlayerTheme';

function PlayerGrowth() {
  const navigate = useNavigate();
  const [isDark, toggleTheme] = usePlayerTheme();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [stats, setStats] = useState({ gamesPlayed: '--', winRate: '--', rating: '--', peakRating: '--' });
  const [compareQuery, setCompareQuery] = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const [message, setMessage] = useState(null);

  // ---------------------- FETCH HANDLER ----------------------
  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, { credentials: 'include', ...options });
    if (res.status === 401) return navigate('/login'), null;
    return { res, data: await res.json().catch(() => ({})) };
  };

  // ---------------------- CHART DRAWER ----------------------
  const drawChart = useCallback((labels, datasets) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    chartRef.current?.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(46,139,87,0.6)');
    gradient.addColorStop(1, 'rgba(46,139,87,0.1)');

    const mapped = datasets.map((d, i) => ({
      label: d.label,
      data: d.data,
      borderColor: i === 0 ? '#2E8B57' : '#87CEEB',
      backgroundColor: i === 0 ? gradient : 'rgba(135,206,235,0.2)',
      fill: true, tension: 0.3, borderWidth: 2,
      pointRadius: 4, pointBorderWidth: 2,
      pointBackgroundColor: i === 0 ? '#2E8B57' : '#87CEEB',
      pointBorderColor: '#FFF'
    }));

    const all = mapped.flatMap(d => d.data || []);
    const min = all.length ? Math.min(...all) - 100 : 0;
    const max = all.length ? Math.max(...all) + 100 : undefined;

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: mapped },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: '#2E8B57' }, grid: { color: 'rgba(46,139,87,0.2)' } },
          y: { min, max, ticks: { color: '#2E8B57' }, grid: { color: 'rgba(46,139,87,0.2)' } }
        },
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }, []);

  // ---------------------- LOAD MAIN ANALYTICS ----------------------
  const loadAnalytics = useCallback(async () => {
    setMessage(null);
    const out = await fetchJson('/player/api/growth_analytics');
    if (!out?.res.ok) return setMessage('Failed to load analytics');

    const p = out.data.player ?? {};
    setStats({
      gamesPlayed: p.gamesPlayed ?? '--',
      winRate: p.winRate ?? '--',
      rating: p.rating ?? '--',
      peakRating: p.peakRating ?? '--'
    });

    drawChart(out.data.chartLabels ?? [], [
      { label: 'Rating Progress', data: out.data.ratingHistory || [] }
    ]);
  }, [drawChart]);

  // ---------------------- PLAYER COMPARISON ----------------------
  const onCompare = async () => {
    const query = compareQuery.trim();
    if (!query) return setMessage('Please enter a player name or email.');

    setMessage('Fetching player data...');
    setCompareResult(null);

    const out = await fetchJson(`/player/api/compare?query=${encodeURIComponent(query)}`);
    if (!out || !out.res.ok) return setMessage(out?.data.error || 'Player not found.');

    const player = out.data.player;
    setCompareResult({ name: player.name, rating: player.rating, winRate: Math.round(player.winRate || 0) });

    const me = await fetchJson('/player/api/growth_analytics');
    if (!me) return;

    setMessage(null);
    drawChart(me.data.chartLabels ?? [], [
      { label: 'Your Rating', data: me.data.ratingHistory ?? [] },
      { label: `${player.name}'s Rating`, data: player.ratingHistory ?? [player.rating] }
    ]);
  };

  useEffect(() => {
    loadAnalytics();
    return () => chartRef.current?.destroy();
  }, [loadAnalytics]);

  // ---------------------- JSX UI PLAIN (UNCHANGED) ----------------------
  return (
    <div>
      <style>{`
        :root { --sea-green:#2E8B57; --cream:#FFFDD0; --sky-blue:#87CEEB; }
        *{ margin:0; padding:0; box-sizing:border-box; }
        .page{ font-family:'Playfair Display', serif; background-color:var(--cream); min-height:100vh; padding:2rem; }
        .container{ max-width:1200px; margin:0 auto; }
        h2{ font-family:'Cinzel', serif; font-size:2.5rem; color:var(--sea-green); margin-bottom:2rem; text-align:center; display:flex; align-items:center; justify-content:center; gap:1rem; }
        h2::before{ content:'📈'; font-size:2.5rem; }
        .stats{ display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1.5rem; margin-bottom:2rem; }
        .stat-card{ background:#fff; padding:1.5rem; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.1); text-align:center; transition: transform 0.3s ease; }
        .stat-card:hover{ transform: translateY(-5px); }
        .stat-value{ font-size:2rem; font-weight:bold; color:var(--sea-green); margin-bottom:0.5rem; }
        .stat-label{ color:#666; font-family:'Cinzel', serif; }
        .chart-container{ background:#fff; border-radius:15px; padding:2rem; box-shadow:0 4px 15px rgba(0,0,0,0.1); margin-bottom:2rem; height:400px; }
        .back{ display:inline-flex; align-items:center; gap:0.5rem; background:var(--sea-green); color:#fff; padding:0.8rem 1.5rem; border-radius:8px; }
        .compare-box{ background:#fff; padding:1.5rem; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.1); margin-bottom:2rem; }
        .compare-input{ flex:1; min-width:250px; padding:0.8rem; border:2px solid var(--sea-green); border-radius:8px; }
        .compare-btn{ background:var(--sea-green); color:#fff; padding:0.8rem 1.5rem; border-radius:8px; }
      `}</style>

      <div className="page">
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2>Player Growth Analytics</h2>
            <button onClick={toggleTheme} style={{ border:'2px solid var(--sea-green)', padding:'8px 12px', borderRadius:8 }}>
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>

          {/* --- Compare Component --- */}
          <div className="compare-box">
            <h3 style={{textAlign:'center', color:'var(--sea-green)', fontFamily:'Cinzel'}}>Compare with Another Player</h3>
            <div style={{display:'flex', gap:'1rem', marginTop:'1rem', flexWrap:'wrap', justifyContent:'center'}}>
              <input className="compare-input" placeholder="Enter name or email" value={compareQuery} onChange={e => setCompareQuery(e.target.value)} />
              <button className="compare-btn" onClick={onCompare}>Compare</button>
            </div>

            {message && <p style={{textAlign:'center', marginTop:'1rem', color: message.includes('Fetching') ? 'green':'#c62828'}}>{message}</p>}
            {compareResult && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginTop:'1.5rem'}}>
                <div style={{background:'rgba(46,139,87,0.1)', padding:'1rem', borderRadius:8}}>
                  <h4>You</h4>
                  <p>Rating: {stats.rating}</p>
                  <p>Win Rate: {stats.winRate}%</p>
                </div>
                <div style={{background:'rgba(135,206,235,0.1)', padding:'1rem', borderRadius:8}}>
                  <h4>{compareResult.name}</h4>
                  <p>Rating: {compareResult.rating}</p>
                  <p>Win Rate: {compareResult.winRate}%</p>
                </div>
              </div>
            )}
          </div>

          {/* --- Stats --- */}
          <div className="stats">
            <div className="stat-card"><div className="stat-value">{stats.gamesPlayed}</div><div className="stat-label">Recent Matches</div></div>
            <div className="stat-card"><div className="stat-value">{stats.winRate}%</div><div className="stat-label">Win Rate</div></div>
            <div className="stat-card"><div className="stat-value">{stats.rating}</div><div className="stat-label">Current Rating</div></div>
            <div className="stat-card"><div className="stat-value">{stats.peakRating}</div><div className="stat-label">Peak Rating</div></div>
          </div>

          <div className="chart-container"><canvas ref={canvasRef} /></div>

          <div style={{textAlign:'right'}}>
            <a href="/player/player_dashboard" className="back">← Back to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerGrowth;
