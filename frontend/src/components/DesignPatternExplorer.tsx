import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PATTERNS_DATA } from '../data/patternsData';
import { BookOpen, Layers, FileText, X, ExternalLink, ArrowLeft } from 'lucide-react';

export const DesignPatternExplorer: React.FC = () => {
  const [data, setData] = useState<{ patterns: any[]; umlDiagrams: any[] }>(PATTERNS_DATA);
  const [selectedPatternId, setSelectedPatternId] = useState<string>('singleton');
  const [activeTab, setActiveTab] = useState<'patterns' | 'uml'>('patterns');

  // Selected UML Diagram modal state
  const [selectedUml, setSelectedUml] = useState<any | null>(null);

  useEffect(() => {
    api.getPatterns()
      .then((res) => {
        if (res && res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        // Fallback to static PATTERNS_DATA if API request fails
        console.warn('API getPatterns failed, using static PATTERNS_DATA fallback:', err);
      });
  }, []);

  const selectedPattern = data.patterns.find((p) => p.id === selectedPatternId) || data.patterns[0];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: '9999px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          <BookOpen size={16} />
          Academic Software Engineering Documentation
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
          Design Patterns & UML Architecture Explorer
        </h1>
        <p style={{ color: '#475569', maxWidth: '750px', margin: '0.5rem auto 0 auto', fontSize: '1rem' }}>
          Interactive proof of object-oriented architecture in EventBridge. Inspect exact problems, solutions, class responsibilities, and source files.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <button
          className={`btn-secondary ${activeTab === 'patterns' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          <Layers size={18} />
          8 Implemented Design Patterns
        </button>
        <button
          className={`btn-secondary ${activeTab === 'uml' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('uml')}
        >
          <FileText size={18} />
          10 UML Diagram Specifications
        </button>
      </div>

      {activeTab === 'patterns' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
          {/* Pattern Sidebar List */}
          <div className="glass-panel" style={{ padding: '1rem', background: '#ffffff' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '1rem', fontWeight: 700 }}>
              Pattern Index
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {data.patterns.map((p) => {
                const isSelected = selectedPatternId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatternId(p.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      textAlign: 'left',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      border: isSelected ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                      color: isSelected ? '#1d4ed8' : '#334155',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</span>
                    <span style={{ fontSize: '0.74rem', color: isSelected ? '#2563eb' : '#64748b' }}>{p.category} • {p.targetClass}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pattern Detail Section */}
          <div className="glass-panel" style={{ padding: '2rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-inter">{selectedPattern.category} Pattern</span>
              <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#0284c7', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '0.25rem 0.55rem', borderRadius: '4px', fontWeight: 600 }}>
                {selectedPattern.filePath}
              </span>
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              {selectedPattern.name}
            </h2>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem', fontWeight: 700 }}>
                1. Architectural Problem
              </h4>
              <p style={{ color: '#991b1b', fontSize: '0.95rem', background: '#fef2f2', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444', lineHeight: '1.6' }}>
                {selectedPattern.problem}
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem', fontWeight: 700 }}>
                2. Pattern Solution & Mechanics
              </h4>
              <p style={{ color: '#166534', fontSize: '0.95rem', background: '#f0fdf4', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: '4px solid #22c55e', lineHeight: '1.6' }}>
                {selectedPattern.solution}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', fontWeight: 700 }}>
                3. Concrete Classes Involved
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedPattern.classesInvolved.map((cls: string, idx: number) => (
                  <span
                    key={idx}
                    style={{
                      background: '#f1f5f9',
                      color: '#0f172a',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.85rem', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', fontWeight: 700 }}>
                4. Core Implementation Source Code
              </h4>
              <pre className="code-box">{selectedPattern.codeSnippet}</pre>
            </div>
          </div>
        </div>
      ) : (
        /* UML Diagrams Overview Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {data.umlDiagrams.map((uml: any, idx: number) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onClick={() => setSelectedUml(uml)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-intra">{uml.type}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>UML Diagram #{idx + 1}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{uml.title}</span>
                <ExternalLink size={16} style={{ color: '#2563eb' }} />
              </h3>
              <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                {uml.description}
              </p>
              <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Click to view diagram & specification →
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UML Diagram Viewer Modal */}
      {selectedUml && (
        <div className="modal-overlay" onClick={() => setSelectedUml(null)}>
          <div
            className="glass-panel modal-content"
            style={{ maxWidth: '780px', width: '92%', background: '#ffffff' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close / Cross Button */}
            <button className="modal-close" onClick={() => setSelectedUml(null)} title="Close (Go Back)">
              <X size={24} style={{ color: '#0f172a' }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-intra">{selectedUml.type} Diagram</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Architecture Spec</span>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              {selectedUml.title}
            </h2>

            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {selectedUml.description}
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', fontWeight: 700 }}>
                Formal Mermaid / PlantUML Specification
              </h4>
              <pre className="code-box" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {selectedUml.mermaidCode || selectedUml.description}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Press Esc or click Cross button to return</span>
              <button className="btn-secondary" onClick={() => setSelectedUml(null)}>
                <ArrowLeft size={16} />
                Back to Diagrams Index
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
