'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon, 
  Search, 
  Home,
  ChevronRight,
  Users
} from 'lucide-react';
import Bubbles from '../../components/Bubbles';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authData = localStorage.getItem('auth_user');
    if (!authData) {
      router.push('/login');
      return;
    }
    const loggedInUser = JSON.parse(authData);
    setUser(loggedInUser);
    setIsAdmin(loggedInUser.role === 'admin');
    fetchMembers();
  }, [router]);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    return members.filter(m => 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(m.id).includes(searchQuery)
    );
  }, [members, searchQuery]);

  if (!user) return null;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Bubbles />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        {/* Navigation Bar */}
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
            <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.75rem', border: 'none' }}>
              <Home size={14} /> Home
            </button>
            <button onClick={() => router.push('/')} className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.75rem', border: 'none' }}>
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

        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '0.5rem' }}>A#100210 Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Team members registered in the operations system</p>
          <div className="divider" style={{ margin: '1.5rem auto 0', maxWidth: '600px' }}></div>
        </header>

        {/* Search */}
        <div style={{ maxWidth: '500px', margin: '0 auto 2.5rem', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            className="glass-input" 
            style={{ paddingLeft: '46px', width: '100%', textAlign: 'center', fontSize: '0.95rem' }}
            placeholder="Search student..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        {/* Members Grid */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '3rem' }}>
          {filteredMembers.length > 0 ? filteredMembers.map((m) => (
            <div 
              key={m.id} 
              className="animate-fade-in"
              style={{ 
                padding: '1.5rem 1.25rem', 
                textAlign: 'center', 
                cursor: 'pointer',
                borderLeft: '3px solid var(--primary-accent)',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#0a0a0a',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'; }}
              onClick={() => router.push(`/?member=${encodeURIComponent(m.name)}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#111' }}>{m.name}</div>
                  <div style={{ marginTop: '4px', fontSize: '0.7rem', fontWeight: '700', color: '#666', letterSpacing: '0.5px' }}>
                    ID: {m.id} {m.role ? `• ${m.role.toUpperCase()}` : ''}
                  </div>
                </div>
                <ChevronRight size={18} color="#999" />
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              {loading ? 'Loading members...' : searchQuery ? 'No matching members found.' : 'No members registered yet.'}
            </div>
          )}
        </section>

        {/* Stats Footer */}
        <div style={{ textAlign: 'center', paddingBottom: '3rem' }}>
          <div className="label-small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Users size={14} /> {members.length} REGISTERED MEMBERS
          </div>
        </div>
      </div>
    </div>
  );
}
