import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMonthlySales, fetchYearlySales } from '../../features/sales/salesSlice';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import '../../styles/playerNeoNoir.css';
import { motion } from 'framer-motion';
import usePlayerTheme from '../../hooks/usePlayerTheme';
import AnimatedSidebar from '../../components/AnimatedSidebar';

const sectionVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.12,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const SalesAnalysis = () => {
  const [isDark, toggleTheme] = usePlayerTheme();
  const chartCanvasRef = useRef(null);
  const chartRef = useRef(null);
  const scrollRef = useRef(null);

  const [mode, setMode] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedMonth, setSelectedMonth] = useState(''); // '' means current
  const [labels, setLabels] = useState([]);
  const [dataPoints, setDataPoints] = useState([]);
  const dispatch = useDispatch();
  const salesState = useSelector((s) => s.sales || {});
  const loading = salesState.monthly?.loading || salesState.yearly?.loading || false;
  const error = salesState.monthly?.error || salesState.yearly?.error || '';

  const stats = useMemo(() => {
    const vals = dataPoints.filter((v) => typeof v === 'number');
    if (!vals.length) return { total: 0, avg: 0, count: 0, topLabel: '--' };
    const total = vals.reduce((a, b) => a + b, 0);
    const avg = total / vals.length;
    const maxVal = Math.max(...vals);
    const topIdx = dataPoints.findIndex((v) => v === maxVal);
    const topLabel = topIdx >= 0 ? labels[topIdx] : '--';
    return { total, avg, count: vals.length, topLabel };
  }, [dataPoints, labels]);

  const formatCurrency = (n) => `₹${(n ?? 0).toFixed(2)}`;

  const ensureChart = useCallback(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (chartRef.current) return chartRef.current;

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(46,139,87,0.6)');
    gradient.addColorStop(1, 'rgba(46,139,87,0.05)');

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Sales',
            data: [],
            borderColor: '#2E8B57',
            backgroundColor: gradient,
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#2E8B57',
            pointBorderColor: '#FFF',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { color: '#2E8B57' }, grid: { color: 'rgba(46,139,87,0.12)' } },
          x: { ticks: { color: '#2E8B57' }, grid: { color: 'rgba(46,139,87,0.12)' } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => `₹${(ctx.raw ?? 0).toFixed(2)}` },
          },
        },
      },
    });
    return chartRef.current;
  }, []);

  const updateChart = useCallback((lbls, pts, labelText) => {
    const ch = ensureChart();
    if (!ch) return;
    ch.data.labels = lbls;
    ch.data.datasets[0].data = pts.map((v) => v ?? 0);
    ch.data.datasets[0].label = labelText;
    ch.update();
  }, [ensureChart]);

  const loadYearly = useCallback(() => {
    setMode('yearly');
    setSelectedMonth('');
    dispatch(fetchYearlySales());
  }, [dispatch]);

  const loadMonthly = useCallback((monthVal = '') => {
    setMode('monthly');
    setSelectedMonth(monthVal);
    dispatch(fetchMonthlySales(monthVal));
  }, [dispatch]);

  // When salesState changes, derive labels/dataPoints for chart
  useEffect(() => {
    try {
      if (mode === 'yearly') {
        const agg = salesState.yearly?.data || [];
        const now = new Date();
        const lbls = Array.from({ length: 12 }, (_, m) => new Date(now.getFullYear(), m, 1).toLocaleString('default', { month: 'short' }));
        const data = (Array.isArray(agg) ? agg : []).map((m) => m?.totalSales ?? 0);
        setLabels(lbls);
        setDataPoints(data);
        updateChart(lbls, data, 'Monthly Sales');
        const currentMonth = new Date().getMonth();
        if (scrollRef.current) scrollRef.current.scrollLeft = Math.max(0, (currentMonth - 2) * 100);
      } else {
        const agg = salesState.monthly?.data || [];
        const now = new Date();
        const year = now.getFullYear();
        const monthIndex = selectedMonth ? Number(selectedMonth) - 1 : now.getMonth();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const monthName = new Date(year, monthIndex, 1).toLocaleString('default', { month: 'short' });
        const lbls = Array.from({ length: daysInMonth }, (_, i) => `${i + 1} ${monthName}`);
        const map = Object.fromEntries((Array.isArray(agg) ? agg : []).map((r) => [r._id, r.totalSales]));
        const data = lbls.map((_, i) => map[i + 1] ?? 0);
        setLabels(lbls);
        setDataPoints(data);
        updateChart(lbls, data, `Daily Sales - ${monthName}`);
        if (scrollRef.current) scrollRef.current.scrollLeft = Math.max(0, (lbls.length - 10) * 100);
      }
    } catch (e) {
      // ignore; error handled via redux state
    }
  }, [salesState, mode, selectedMonth, updateChart]);

  useEffect(() => {
    // initial load: monthly current
    loadMonthly('');
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [loadMonthly]);

  const organizerLinks = [
    { path: '/organizer/organizer_profile', label: 'Profile', icon: 'fas fa-user' },
    { path: '/organizer/coordinator_management', label: 'Manage Coordinators', icon: 'fas fa-users-cog' },
    { path: '/organizer/organizer_tournament', label: 'Tournament Oversight', icon: 'fas fa-trophy' },
    { path: '/organizer/college_stats', label: 'College Performance Stats', icon: 'fas fa-chart-bar' },
    { path: '/organizer/store_monitoring', label: 'Store Monitoring', icon: 'fas fa-store' },
    { path: '/organizer/meetings', label: 'Schedule Meetings', icon: 'fas fa-calendar-alt' }
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body, #root { min-height: 100vh; }
        .page { font-family: 'Playfair Display', serif; background-color: var(--page-bg); min-height: 100vh; display:flex; color: var(--text-color); }
        .content { flex-grow:1; margin-left:0; padding:2rem; }
        h1 { font-family:'Cinzel', serif; color:var(--sea-green); margin-bottom:2rem; font-size:2.5rem; display:flex; align-items:center; gap:1rem; }
        .controls { display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:1rem; flex-wrap:wrap; }
        .filter-wrap { display:flex; gap:0.5rem; align-items:center; font-family:'Cinzel', serif; }
        .filter-btn { background:var(--card-bg); border-radius:8px; padding:0.5rem 0.9rem; border:1px solid var(--card-border); cursor:pointer; font-weight:700; color:var(--text-color); transition:all 0.15s ease; }
        .filter-btn.active { color:var(--on-accent); background-color:var(--sea-green); transform:translateY(-2px); }
        .select { padding:0.4rem; border-radius:8px; border:1px solid var(--card-border); background:var(--page-bg); color:var(--text-color); }
        .note { color:var(--text-color); margin-top:0.5rem; font-size:0.95rem; opacity:0.7; }
        .stats-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1.5rem; margin-bottom:1.5rem; }
        .stat-card { background:var(--card-bg); padding:1.5rem; border-radius:15px; box-shadow:none; text-align:center; border:1px solid var(--card-border); }
        .stat-value { font-size:2rem; font-weight:bold; color:var(--sea-green); margin-bottom:0.5rem; }
        .stat-label { color:var(--text-color); font-family:'Cinzel', serif; opacity:0.8; }
        .chart-wrapper { background:var(--card-bg); border-radius:15px; padding:1.5rem; box-shadow:none; margin-bottom:2rem; height:420px; overflow:hidden; border:1px solid var(--card-border); }
        .chart-scroll { width:100%; height:420px; overflow-x:auto; overflow-y:auto; padding-bottom:10px; -webkit-overflow-scrolling:touch; }
        .canvas { display:block; height:360px; }
        .back-link { display:inline-flex; align-items:center; gap:0.5rem; background:var(--sea-green); color:var(--on-accent); text-decoration:none; padding:0.8rem 1.5rem; border-radius:8px; transition:all 0.3s ease; font-family:'Cinzel', serif; font-weight:bold; }
        .error { color:#c62828; text-align:center; margin-bottom:1rem; }
        .export-btn { background:var(--sea-green); color:var(--on-accent); border:none; padding:8px 12px; border-radius:6px; cursor:pointer; }
      `}</style>

      <div className="page player-neo">
        <motion.div
          className="chess-knight-float"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.14, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 0, fontSize: '2.5rem', color: 'var(--sea-green)' }}
          aria-hidden="true"
        >
          <i className="fas fa-chart-line" />
        </motion.div>
        
        <AnimatedSidebar links={organizerLinks} logo={<i className="fas fa-chess" />} title={`ChessHive`} />

        <div className="organizer-dash-header" style={{ position: 'fixed', top: 18, right: 18, zIndex: 1001, display: 'flex', gap: '12px', alignItems: 'center' }}>
          <motion.button
            type="button"
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-color)',
              width: 40,
              height: 40,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}
          >
            <i className={isDark ? 'fas fa-sun' : 'fas fa-moon'} />
          </motion.button>
        </div>

        <div className="content">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <i className="fas fa-chart-line" /> Sales Analysis
          </motion.h1>

          <div className="controls">
            <div className="filter-wrap">
              <span style={{ fontWeight: 700, color: 'var(--sea-green)', marginRight: 6 }}>View:</span>
              <button type="button" className={`filter-btn ${mode === 'monthly' ? 'active' : ''}`} onClick={() => loadMonthly(selectedMonth || '')}>Monthly</button>
              <button type="button" className={`filter-btn ${mode === 'yearly' ? 'active' : ''}`} onClick={loadYearly}>Yearly</button>
            </div>

            <div className="filter-wrap">
              <label htmlFor="monthSelect" style={{ fontWeight: 700, color: 'var(--sea-green)' }}>Month:</label>
              <select id="monthSelect" value={selectedMonth} onChange={(e) => loadMonthly(e.target.value)} className="select">
                <option value="">Current</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div style={{ textAlign: 'right' }}>
              <small className="note">Default: current month (last 10 days visible). Scroll horizontally to see older days/months.</small>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="stats-grid" aria-live="polite">
            <div className="stat-card">
              <div className="stat-value">{loading ? '--' : formatCurrency(stats.total)}</div>
              <div className="stat-label">Total Sales (visible range)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{loading ? '--' : formatCurrency(stats.avg)}</div>
              <div className="stat-label">Average Sale</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{loading ? '--' : stats.count}</div>
              <div className="stat-label">Transactions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{loading ? '--' : stats.topLabel}</div>
              <div className="stat-label">Top Day</div>
            </div>
          </div>

          <div className="chart-wrapper">
            <div className="chart-scroll" ref={scrollRef}>
              <canvas ref={chartCanvasRef} className="canvas" />
            </div>
          </div>
          <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <button aria-label="Export sales CSV" onClick={() => {
              // CSV export from labels and dataPoints
              try {
                const rows = [['Label','Value'], ...labels.map((l, i) => [l, (dataPoints[i] ?? 0)])];
                const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sales_export_${mode}_${new Date().toISOString().slice(0,10)}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (e) {
                console.error('CSV export failed', e);
                alert('CSV export failed');
              }
            }} className="export-btn">Export CSV</button>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <Link to="/organizer/store_monitoring" className="back-link">
              <i className="fas fa-arrow-left" /> Back to Store Monitor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalysis;
