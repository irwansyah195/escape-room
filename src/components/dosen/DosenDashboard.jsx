import React, { useState } from 'react';
import { X, BookOpen, Users, Settings, ShieldCheck, LogOut } from 'lucide-react';
import QuestionManager from './QuestionManager';
import ResultRecap from './ResultRecap';
import SettingsTab from './SettingsTab';

export default function DosenDashboard({ isOpen, onClose, rooms, onUpdateRooms }) {
  const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'results', 'settings'

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '960px', width: '95%', maxHeight: '92vh', padding: 'clamp(16px, 3.5vw, 28px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Dosen Portal */}
        <div className="dosen-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--purple) 0%, var(--pink) 100%)',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(155, 107, 204, 0.3)'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--purple-dark)', fontSize: '1.4em' }}>
                Portal Manajemen Dosen
              </h2>
              <p style={{ margin: 0, fontSize: '0.86em', color: 'var(--gray)' }}>
                Escape Room: Observasi Dunia Bermain Anak
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-confirm-no"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}
              onClick={onClose}
              title="Keluar ke Permainan"
            >
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="dosen-tabs">
          <button
            type="button"
            className={`dosen-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            <BookOpen size={18} />
            <span>Kelola Ruangan & Soal</span>
          </button>

          <button
            type="button"
            className={`dosen-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            <Users size={18} />
            <span>Rekap Nilai Mahasiswa</span>
          </button>

          <button
            type="button"
            className={`dosen-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Pengaturan PIN</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div style={{ minHeight: '380px' }}>
          {activeTab === 'questions' && (
            <QuestionManager rooms={rooms} onUpdateRooms={onUpdateRooms} />
          )}

          {activeTab === 'results' && (
            <ResultRecap />
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}
        </div>
      </div>
    </div>
  );
}
