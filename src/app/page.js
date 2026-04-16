'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Calendar,
  Users,
  Eye,
  EyeOff,
  ShieldCheck,
  User as UserIcon,
  Settings,
  X,
  RefreshCw,
  Download,
  LayoutDashboard,
  LogOut,
  Home
} from 'lucide-react';
import StarBorder from '../components/StarBorder';

export default function TeamTracker() {
  const router = useRouter();
  
  // --- Auth State ---
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- Data State ---
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // --- Filtering State ---
  const [selectedUser, setSelectedUser] = useState('All Members');
  
  // --- UI Control State ---
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  // --- Auth Guard & Initial Load ---
  useEffect(() => {
    const authData = localStorage.getItem('auth_user');
    if (!authData) {
      router.push('/login');
      return;
    }
    const loggedInUser = JSON.parse(authData);
    setUser(loggedInUser);
    setIsAdmin(loggedInUser.role === 'admin');
    
    fetchInitialData(loggedInUser.role === 'admin');
  }, [router]);

  const fetchInitialData = async (adminMode) => {
    setLoading(true);
    await Promise.all([fetchTasks(adminMode), fetchMembers()]);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  const fetchTasks = async (adminMode = isAdmin, memberFilter = selectedUser) => {
    try {
      let url = `/api/tasks?admin=${adminMode}`;
      if (memberFilter !== 'All Members') url += `&name=${encodeURIComponent(memberFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error(err);
      setTasks([]);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterUser = (val) => {
    if (hasUnsavedChanges && !confirm('Discard unsaved edits?')) return;
    setSelectedUser(val);
    fetchTasks(isAdmin, val);
  };

  const exportToCSV = () => {
    if (tasks.length === 0) return;
    const headers = ['Member', 'Date', 'Description', 'Skills', 'Project', 'Status', 'Proof'];
    const csv = [headers.join(','), ...tasks.map(t => [t.roll_no, t.week_date, `"${t.task_description}"`, `"${t.skill_applied}"`, `"${t.project_name}"`, t.progress, t.proof].join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.body.appendChild(document.createElement('a'));
    link.href = URL.createObjectURL(blob);
    link.download = `weekly_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    document.body.removeChild(link);
  };

  const addRow = () => {
    setTasks([...tasks, { id: Date.now(), roll_no: selectedUser !== 'All Members' ? selectedUser : '', task_description: '', skill_applied: '', project_name: '', progress: 'Pending', proof: '', week_date: new Date().toISOString().split('T')[0], is_hidden: 0 }]);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tasks) });
      if (res.ok) { setHasUnsavedChanges(false); fetchTasks(); }
    } catch (err) { alert('Sync error'); }
    finally { setLoading(false); }
  };

  const stats = useMemo(() => tasks.reduce((acc, t) => {
    const s = t.progress?.toUpperCase() || '';
    if (s.includes('COMPLETED')) acc.completed++;
    else if (s.includes('PROGRESS')) acc.inProgress++;
    else acc.pending++;
    return acc;
  }, { completed: 0, inProgress: 0, pending: 0 }), [tasks]);

  const filteredTasks = useMemo(() => tasks.filter(t => [t.task_description, t.project_name, t.roll_no].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()))), [tasks, searchQuery]);

  if (!user) return null; // Prevent flicker

  return (
    <div className="container">
      {/* Enterprise Navigation */}
      <nav className="glass-card animate-fade-in" style={{ padding: '0.75rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--primary-accent)', padding: '6px', borderRadius: '6px' }}><LayoutDashboard size={18} color="white" /></div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: '800' }}>A#100210</h2>
            <div className="label-small">OPERATIONS MANAGEMENT</div>
          </div>
        </div>

        {/* Page Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(3,7,18,0.5)', padding: '4px', borderRadius: '10px' }}>
          <button onClick={() => router.push('/home')} className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.75rem', border: 'none' }}>
            <Home size={14} /> Home
          </button>
          <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.75rem', border: 'none' }}>
            <LayoutDashboard size={14} /> Dashboard
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800' }}>{user.name}</div>
                <div className="label-small" style={{ color: isAdmin ? 'var(--status-progress)' : 'var(--text-secondary)' }}>{user.role?.toUpperCase()} ACCESS</div>
             </div>
             {isAdmin ? <ShieldCheck size={20} color="var(--primary-accent)" /> : <UserIcon size={20} color="var(--text-secondary)" />}
          </div>
          <div style={{ height: '24px', width: '1px', background: 'var(--glass-border)' }}></div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px', border: 'none' }} title="Secure Logout">
            <LogOut size={18} color="var(--text-secondary)" />
          </button>
        </div>
      </nav>

      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ letterSpacing: '-1px' }}>Operational Overview</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Real-time synchronization for team milestones and key asset tracking.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => fetchInitialData(isAdmin)} className="btn btn-secondary" style={{ padding: '10px' }}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={exportToCSV} className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>
              <Download size={14} /> Export Report
            </button>
          </div>
        </div>
        <div className="divider" style={{ margin: '1.5rem 0 0 0' }}></div>
      </header>

      {/* Metrics Section */}
      <section className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3.5rem' }}>
        {[
          { label: 'Completed Deliverables', value: stats.completed, color: 'var(--status-completed)', icon: <CheckCircle2 size={22} /> },
          { label: 'Active Progress', value: stats.inProgress, color: 'var(--status-progress)', icon: <Clock size={22} /> },
          { label: 'Pending Items', value: stats.pending, color: 'var(--status-pending)', icon: <AlertCircle size={22} /> },
          { label: 'Assigned Entities', value: members.length, color: 'var(--secondary-accent)', icon: <Users size={22} /> }
        ].map((s, i) => (
          <div key={i} className="glass-card card-hover" style={{ padding: '1.5rem', borderLeft: `2px solid ${s.color}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ color: s.color, opacity: 0.2, position: 'absolute', top: '1rem', left: '1rem' }}>{s.icon}</div>
            <div className="number-dominant" style={{ marginTop: '0.5rem' }}>{s.value}</div>
            <div className="label-small" style={{ marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', background: `linear-gradient(to top, ${s.color}08, transparent)`, pointerEvents: 'none' }}></div>
          </div>
        ))}
      </section>

      {/* Control Surface */}
      <section className="glass-card animate-fade-in" style={{ padding: '20px', marginBottom: '2.5rem', background: 'rgba(17, 24, 39, 0.4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="label-small">ENTITY FILTER</span>
            <select className="glass-input" value={selectedUser} onChange={(e) => handleFilterUser(e.target.value)}>
              <option>All Members</option>
              {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="label-small">REGISTRY SEARCH</span>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="glass-input" style={{ paddingLeft: '40px' }} placeholder="Filter by keyword..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            {isAdmin && (
              <>
                <button onClick={() => setShowMemberModal(true)} className="btn btn-secondary" style={{ flex: 1, height: '44px' }}><Settings size={16} /> Team Config</button>
                <div style={{ flex: 1 }}>
                  <StarBorder as="button" onClick={addRow} color="#3b82f6" speed="5s" thickness={2} className="btn-primary" style={{ width: '100%', height: '44px', fontWeight: '800', border: 'none' }}><Plus size={18} /> NEW NODE</StarBorder>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Data Matrix */}
      <section className="glass-card animate-fade-in" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                {['Resource', 'Date', 'Description', 'Skill Map', 'Project ID', 'Milestone', 'Proof'].map(h => (
                  <th key={h} style={{ textAlign: 'left', letterSpacing: '-0.2px' }}>{h}</th>
                ))}
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? filteredTasks.map((t) => (
                <tr key={t.id} style={{ opacity: t.is_hidden ? 0.4 : 1 }}>
                  <td>
                    <select disabled={!isAdmin} className="glass-input" style={{ width: '140px', background: 'transparent', border: 'none', fontWeight: '700', color: 'var(--primary-accent)', fontSize: '0.8rem' }} value={t.roll_no} onChange={(e) => { setTasks(tasks.map(x => x.id === t.id ? { ...x, roll_no: e.target.value } : x)); setHasUnsavedChanges(true); }}>
                      <option value="">Unassigned</option>
                      {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </td>
                  <td><input type="date" readOnly={!isAdmin} className="glass-input" style={{ width: '120px', background: 'none', border: 'none', fontSize: '0.8rem' }} value={t.week_date} onChange={(e) => { setTasks(tasks.map(x => x.id === t.id ? { ...x, week_date: e.target.value } : x)); setHasUnsavedChanges(true); }} /></td>
                  <td><input readOnly={!isAdmin} className="glass-input" style={{ width: '300px', background: 'none', border: 'none' }} placeholder="..." value={t.task_description} onChange={(e) => { setTasks(tasks.map(x => x.id === t.id ? { ...x, task_description: e.target.value } : x)); setHasUnsavedChanges(true); }} /></td>
                  <td><input readOnly={!isAdmin} className="glass-input" style={{ width: '150px', background: 'none', border: 'none' }} placeholder="..." value={t.skill_applied} onChange={(e) => { setTasks(tasks.map(x => x.id === t.id ? { ...x, skill_applied: e.target.value } : x)); setHasUnsavedChanges(true); }} /></td>
                  <td><input readOnly={!isAdmin} className="glass-input" style={{ width: '150px', background: 'none', border: 'none' }} placeholder="..." value={t.project_name} onChange={(e) => { setTasks(tasks.map(x => x.id === t.id ? { ...x, project_name: e.target.value } : x)); setHasUnsavedChanges(true); }} /></td>
                  <td>
                    <select disabled={!isAdmin} className="glass-input" style={{ background: 'rgba(255,255,255,0.03)', fontSize: '0.75rem', fontWeight: 'bold' }} value={t.progress} onChange={(e) => { setTasks(tasks.map(x => x.id === t.id ? { ...x, progress: e.target.value } : x)); setHasUnsavedChanges(true); }}>
                      <option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td><input readOnly={!isAdmin} className="glass-input" style={{ width: '140px', background: 'none', border: 'none', color: 'var(--primary-accent)', textDecoration: 'underline' }} value={t.proof} onChange={(e) => { setTasks(tasks.map(x => x.id === t.id ? { ...x, proof: e.target.value } : x)); setHasUnsavedChanges(true); }} /></td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => { setTasks(tasks.map(x => x.id === t.id ? { ...x, is_hidden: x.is_hidden ? 0 : 1 } : x)); setHasUnsavedChanges(true); }}>{t.is_hidden ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.5 }} onClick={() => { if (confirm('Delete?')) { if (t.id < 1000000000000) fetch(`/api/tasks?id=${t.id}`, { method: 'DELETE' }); setTasks(prev => prev.filter(x => x.id !== t.id)); setHasUnsavedChanges(true); } }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td colSpan="8" style={{ padding: '10rem', textAlign: 'center', color: 'var(--text-muted)' }}>Operational registry currently contains no available data points.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sync Footer */}
      {isAdmin && (
        <footer style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--primary-accent)" />
            <span className="label-small">AUTHORIZED SYSTEM CONTROL ACCESS</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {hasUnsavedChanges && <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: '800' }}>● UNSAVED MODIFICATIONS</div>}
            <button onClick={() => fetchTasks(isAdmin)} className="btn btn-secondary"><RotateCcw size={16} /> Revert</button>
            <StarBorder as="button" onClick={handleSave} color="#10b981" speed="4s" thickness={2} className="btn-primary" style={{ padding: '14px 60px', border: 'none' }}>{loading ? 'Syncing...' : 'SAVE MODIFICATIONS'}</StarBorder>
          </div>
        </footer>
      )}

      {/* Modal Toolsets */}
      {showMemberModal && isAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowMemberModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>Resource Registry</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '2rem' }}>
              <input className="glass-input" placeholder="Name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
              <input className="glass-input" placeholder="Role" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} />
              <button className="btn btn-primary" onClick={async () => { if (!newMemberName) return; await fetch('/api/members', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: newMemberName, role: newMemberRole }) }); setNewMemberName(''); setNewMemberRole(''); fetchMembers(); }}><Plus size={20} /></button>
            </div>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {members.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', marginBottom: '8px' }}>
                  <div><div style={{ fontWeight: '700' }}>{m.name}</div><div className="label-small">{m.role?.toUpperCase()}</div></div>
                  <button style={{ background: 'none', border: 'none', color: '#ef4444' }} onClick={async () => { if(confirm('Remove?')){ await fetch(`/api/members?id=${m.id}`, {method: 'DELETE'}); fetchMembers(); } }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: #0c111d; color: white; }
      `}</style>
    </div>
  );
}
