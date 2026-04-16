'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User as UserIcon, Lock, LayoutDashboard, AlertCircle } from 'lucide-react';
import Hyperspeed from '../../components/Hyperspeed';
import StarBorder from '../../components/StarBorder';

const HYPERSPEED_OPTIONS = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [12, 80],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x131318,
    brokenLines: 0x131318,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3
  }
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleMode, setRoleMode] = useState('admin'); // admin or user
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const effectOptions = useMemo(() => HYPERSPEED_OPTIONS, []);

  useEffect(() => {
     // Pre-populate based on mode for easier demo testing
     setUsername(roleMode);
     setPassword(roleMode === 'admin' ? 'admin123' : 'user123');
  }, [roleMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Safe persistence for this project level
        localStorage.setItem('auth_user', JSON.stringify(data));
        router.push('/');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection to auth server lost.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden', background: '#000' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Hyperspeed effectOptions={effectOptions} />
      </div>
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '3rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Brand Identity */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ background: 'var(--primary-accent)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <LayoutDashboard size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>A#100210</h1>
          <p className="label-small">OPERATIONS MANAGEMENT PORTAL</p>
        </div>

        {/* Role Selection Switcher */}
        <div className="glass-card" style={{ padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px', marginBottom: '2rem', background: 'rgba(3,7,18,0.5)' }}>
           <button 
             onClick={() => setRoleMode('admin')}
             className={`btn ${roleMode === 'admin' ? 'btn-primary' : 'btn-secondary'}`} 
             style={{ flex: 1, padding: '8px', fontSize: '0.75rem', border: 'none' }}
           >
             <ShieldCheck size={14} /> Admin Access
           </button>
           <button 
             onClick={() => setRoleMode('user')}
             className={`btn ${roleMode === 'user' ? 'btn-primary' : 'btn-secondary'}`} 
             style={{ flex: 1, padding: '8px', fontSize: '0.75rem', border: 'none' }}
           >
             <UserIcon size={14} /> Viewer Access
           </button>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="label-small">IDENTIFIER</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                className="glass-input" 
                style={{ paddingLeft: '38px', width: '100%' }}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="label-small">CREDENTIALS</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password"
                className="glass-input" 
                style={{ paddingLeft: '38px', width: '100%' }}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.75rem', fontWeight: '700', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div style={{ marginTop: '1rem', width: '100%' }}>
            <StarBorder as="button" type="submit" color="#3b82f6" speed="4s" thickness={2} className="btn-primary" style={{ width: '100%', padding: '14px', fontWeight: '800', border: 'none', cursor: 'pointer' }} disabled={loading}>
              {loading ? 'VERIFYING...' : 'AUTHORIZE ACCESS'}
            </StarBorder>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px' }}>
          SECURED BY ENTERPRISE ENCRYPTION
        </p>
      </div>
    </div>
    </div>
  );
}
