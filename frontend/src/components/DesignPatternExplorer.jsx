import { useState, useEffect } from "react";
import { api } from "../services/api";
import { PATTERNS_DATA } from "../data/patternsData";
import {
  Layers,
  FileText,
  X,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Cpu,
  ShieldCheck,
  Terminal
} from "lucide-react";
import {
  BuilderDemo,
  PrototypeDemo,
  MediatorDemo,
  TemplateMethodDemo,
  StrategyDemo,
  MementoDemo,
  MVCDemo
} from "./PatternDemoPanels";

export const DesignPatternExplorer = () => {
  const [data, setData] = useState(PATTERNS_DATA);
  const [selectedPatternId, setSelectedPatternId] = useState("singleton");
  const [activeTab, setActiveTab] = useState("patterns");
  const [selectedUml, setSelectedUml] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    api.getPatterns()
      .then((res) => {
        if (res && res.success && res.data) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            // Merge server-reported patterns into static rich specs
            setData((prev) => ({
              ...prev,
              patterns: prev.patterns.map((p) => {
                const serverMatch = res.data.find((sp) => sp.id === p.id);
                return serverMatch ? { ...p, ...serverMatch } : p;
              })
            }));
          } else if (res.data.patterns) {
            setData(res.data);
          }
        }
      })
      .catch((err) => {
        console.warn("API getPatterns notice (using static PATTERNS_DATA):", err);
      });
  }, []);

  const patterns = data?.patterns || PATTERNS_DATA.patterns;
  const umlDiagrams = data?.umlDiagrams || PATTERNS_DATA.umlDiagrams;
  const selectedPattern = patterns.find((p) => p.id === selectedPatternId) || patterns[0];

  const handleCopyCode = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {/* Page Header */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.35rem 0.9rem",
            borderRadius: "var(--radius-full, 9999px)",
            background: "var(--palette-subtle)",
            border: "1px solid var(--palette-border)",
            color: "var(--palette-deep)",
            fontSize: "0.82rem",
            fontWeight: 650,
            marginBottom: "0.85rem"
          }}
        >
          <Cpu size={15} style={{ color: "var(--palette-rich)" }} />
          Software Architecture & Gang of Four Specifications
        </div>
        <h1
          style={{
            fontSize: "2.35rem",
            fontWeight: 800,
            color: "var(--text-main)",
            letterSpacing: "-0.03em",
            marginBottom: "0.5rem"
          }}
        >
          Design Patterns & UML Specifications
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            maxWidth: "760px",
            margin: "0 auto",
            fontSize: "0.98rem",
            lineHeight: "1.6"
          }}
        >
          Interactive exploration of Gang of Four (GoF) structural, creational, and behavioral patterns
          powering the EventBridge Java 21 backend and SQLite persistence layer.
        </p>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.75rem" }}>
          <button
            className={`btn-secondary ${activeTab === "patterns" ? "btn-primary" : ""}`}
            onClick={() => setActiveTab("patterns")}
            style={{ padding: "0.6rem 1.25rem", fontSize: "0.88rem" }}
          >
            <Layers size={17} />
            Design Patterns ({patterns.length})
          </button>
          <button
            className={`btn-secondary ${activeTab === "uml" ? "btn-primary" : ""}`}
            onClick={() => setActiveTab("uml")}
            style={{ padding: "0.6rem 1.25rem", fontSize: "0.88rem" }}
          >
            <FileText size={17} />
            UML Architecture Models ({umlDiagrams.length})
          </button>
        </div>
      </div>

      {activeTab === "patterns" ? (
        <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: "1.75rem", alignItems: "start" }}>
          {/* Pattern Sidebar Navigation */}
          <div
            className="glass-panel"
            style={{
              padding: "1.25rem",
              background: "#ffffff",
              border: "1px solid var(--palette-border)",
              borderRadius: "var(--radius-md)",
              position: "sticky",
              top: "90px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.85rem",
                paddingBottom: "0.65rem",
                borderBottom: "1px solid var(--palette-border)"
              }}
            >
              <span
                style={{
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-dim)",
                  fontWeight: 700
                }}
              >
                Catalog Index
              </span>
              <span
                style={{
                  fontSize: "0.74rem",
                  color: "var(--palette-deep)",
                  fontWeight: 700,
                  background: "var(--palette-subtle)",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "9999px"
                }}
              >
                Java 21
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "680px", overflowY: "auto", paddingRight: "0.2rem" }}>
              {patterns.map((p) => {
                const isSelected = selectedPatternId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPatternId(p.id);
                      setCopiedCode(false);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: "0.75rem 0.9rem",
                      borderRadius: "var(--radius-sm)",
                      textAlign: "left",
                      background: isSelected ? "var(--palette-subtle)" : "#ffffff",
                      border: isSelected ? "1px solid var(--palette-rich)" : "1px solid transparent",
                      color: isSelected ? "var(--palette-deep)" : "var(--text-main)",
                      cursor: "pointer",
                      transition: "all 0.18s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <span style={{ fontWeight: isSelected ? 700 : 600, fontSize: "0.88rem" }}>
                        {p.name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          color: isSelected ? "var(--palette-deep)" : "var(--text-dim)",
                          background: isSelected ? "#ffffff" : "var(--palette-surface)",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px"
                        }}
                      >
                        {p.category}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.74rem",
                        fontFamily: "var(--font-mono)",
                        color: isSelected ? "var(--palette-rich)" : "var(--text-dim)",
                        marginTop: "0.25rem"
                      }}
                    >
                      {p.targetClass}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pattern Detail Content */}
          <div
            className="glass-panel"
            style={{
              padding: "2rem 2.25rem",
              background: "#ffffff",
              border: "1px solid var(--palette-border)",
              borderRadius: "var(--radius-md)"
            }}
          >
            {/* Detail Top Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.75rem",
                marginBottom: "1rem"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="badge badge-inter" style={{ fontSize: "0.76rem" }}>
                  {selectedPattern.category} Pattern
                </span>
                <span
                  style={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    color: "var(--palette-deep)",
                    background: "var(--palette-subtle)",
                    border: "1px solid var(--palette-border)",
                    padding: "0.2rem 0.55rem",
                    borderRadius: "4px"
                  }}
                >
                  GoF Canonical
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--palette-deep)",
                  background: "var(--palette-surface)",
                  border: "1px solid var(--palette-border)",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "6px",
                  fontWeight: 600
                }}
              >
                {selectedPattern.filePath}
              </span>
            </div>

            <h2
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: "var(--text-main)",
                letterSpacing: "-0.025em",
                marginBottom: "0.5rem"
              }}
            >
              {selectedPattern.name}
            </h2>

            <p style={{ color: "var(--text-muted)", fontSize: "0.94rem", marginBottom: "1.75rem", lineHeight: "1.6" }}>
              <strong>Platform Role:</strong> {selectedPattern.featurePower}
            </p>

            {/* Problem & Solution Cards - Clean Cohesive Palette */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.75rem" }}>
              {/* Architectural Problem */}
              <div
                style={{
                  background: "var(--palette-surface)",
                  border: "1px solid var(--palette-border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1.1rem 1.25rem"
                }}
              >
                <div
                  style={{
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                    marginBottom: "0.45rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem"
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--palette-rich)"
                    }}
                  />
                  1. Architectural Problem
                </div>
                <p
                  style={{
                    color: "var(--text-main)",
                    fontSize: "0.92rem",
                    lineHeight: "1.65",
                    margin: 0
                  }}
                >
                  {selectedPattern.problem}
                </p>
              </div>

              {/* Pattern Solution */}
              <div
                style={{
                  background: "var(--palette-subtle)",
                  border: "1px solid var(--palette-border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1.1rem 1.25rem"
                }}
              >
                <div
                  style={{
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--palette-deep)",
                    marginBottom: "0.45rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem"
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--palette-deep)"
                    }}
                  />
                  2. Pattern Solution & Mechanics
                </div>
                <p
                  style={{
                    color: "var(--text-main)",
                    fontSize: "0.92rem",
                    lineHeight: "1.65",
                    margin: 0
                  }}
                >
                  {selectedPattern.solution}
                </p>
              </div>
            </div>

            {/* Concrete Classes Involved */}
            <div style={{ marginBottom: "1.75rem" }}>
              <div
                style={{
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-dim)",
                  marginBottom: "0.55rem"
                }}
              >
                3. Concrete Classes & Interfaces
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {selectedPattern.classesInvolved.map((cls, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "#ffffff",
                      color: "var(--palette-deep)",
                      fontSize: "0.82rem",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 650,
                      padding: "0.3rem 0.75rem",
                      borderRadius: "6px",
                      border: "1px solid var(--palette-border)"
                    }}
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>

            {/* Java Source Code Container with Header & Copy Button */}
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-dim)",
                  marginBottom: "0.55rem"
                }}
              >
                4. Core Implementation Source Code
              </div>
              <div
                style={{
                  background: "#161522",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)"
                }}
              >
                {/* Code Box Toolbar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.6rem 1rem",
                    background: "#201e30",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f56", display: "inline-block" }} />
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27c93f", display: "inline-block" }} />
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                        color: "#e2e8f0",
                        fontWeight: 600,
                        marginLeft: "0.35rem"
                      }}
                    >
                      {selectedPattern.targetClass}.java
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        background: "rgba(196, 164, 218, 0.18)",
                        color: "#C4A4DA",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "4px",
                        fontWeight: 700
                      }}
                    >
                      Java 21 LTS
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(selectedPattern.codeSnippet)}
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: copiedCode ? "#4ade80" : "#cbd5e1",
                      fontSize: "0.75rem",
                      padding: "0.3rem 0.65rem",
                      borderRadius: "5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      transition: "all 0.15s ease"
                    }}
                    title="Copy Java code to clipboard"
                  >
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>

                {/* Preformatted Code Content */}
                <pre
                  style={{
                    margin: 0,
                    padding: "1.1rem 1.25rem",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.84rem",
                    lineHeight: "1.6",
                    color: "#f1f5f9",
                    overflowX: "auto",
                    whiteSpace: "pre"
                  }}
                >
                  {selectedPattern.codeSnippet}
                </pre>
              </div>
            </div>

            {/* Section 5: Live Pattern Execution Sandbox */}
            <div
              style={{
                paddingTop: "1.75rem",
                borderTop: "1px solid var(--palette-border)"
              }}
            >
              <div
                style={{
                  fontSize: "0.84rem",
                  color: "var(--palette-deep)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "1rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <Terminal size={16} style={{ color: "var(--palette-rich)" }} />
                5. Live Pattern Execution & Verification
              </div>

              {selectedPattern.id === "builder" && <BuilderDemo />}
              {selectedPattern.id === "prototype" && <PrototypeDemo />}
              {selectedPattern.id === "mediator" && <MediatorDemo />}
              {selectedPattern.id === "template_method" && <TemplateMethodDemo />}
              {selectedPattern.id === "strategy" && <StrategyDemo />}
              {selectedPattern.id === "memento" && <MementoDemo />}
              {selectedPattern.id === "mvc" && <MVCDemo />}

              {!["builder", "prototype", "mediator", "template_method", "strategy", "memento", "mvc"].includes(
                selectedPattern.id
              ) && (
                <div
                  style={{
                    background: "var(--palette-surface)",
                    padding: "1.25rem 1.4rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--palette-border)"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      marginBottom: "0.75rem"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <CheckCircle2 size={18} color="var(--palette-rich)" />
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)" }}>
                        Active Architecture Component ({selectedPattern.targetClass})
                      </span>
                    </div>
                    <span
                      style={{
                        background: "var(--palette-subtle)",
                        color: "var(--palette-deep)",
                        border: "1px solid var(--palette-border)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "9999px"
                      }}
                    >
                      100% Java 21 LTS Verified
                    </span>
                  </div>

                  <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: "1.6", margin: 0 }}>
                    <strong>Live Production Role:</strong> {selectedPattern.featurePower}
                  </p>

                  <div
                    style={{
                      marginTop: "0.85rem",
                      fontSize: "0.8rem",
                      color: "var(--text-dim)",
                      background: "#ffffff",
                      padding: "0.6rem 0.9rem",
                      borderRadius: "6px",
                      border: "1px solid var(--palette-border)"
                    }}
                  >
                    Source file:{" "}
                    <code style={{ color: "var(--palette-deep)", fontWeight: 650 }}>
                      {selectedPattern.filePath}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* UML Diagrams Overview Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "1.5rem"
          }}
        >
          {umlDiagrams.map((uml, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: "1.5rem",
                background: "#ffffff",
                border: "1px solid var(--palette-border)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                position: "relative"
              }}
              onClick={() => setSelectedUml(uml)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.65rem"
                }}
              >
                <span className="badge badge-intra">{uml.category || uml.type}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 600 }}>
                  Spec #{idx + 1}
                </span>
              </div>
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <span>{uml.title}</span>
                <ExternalLink size={16} style={{ color: "var(--palette-rich)" }} />
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.88rem",
                  lineHeight: "1.55",
                  marginBottom: "1rem"
                }}
              >
                {uml.description}
              </p>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--palette-deep)",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
              >
                Inspect Mermaid specification →
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
            style={{
              maxWidth: "820px",
              width: "92%",
              background: "#ffffff",
              border: "1px solid var(--palette-border)",
              borderRadius: "var(--radius-md)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedUml(null)}
              title="Close (Go Back)"
            >
              <X size={22} style={{ color: "var(--text-main)" }} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span className="badge badge-intra">{selectedUml.category || selectedUml.type}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontWeight: 600 }}>
                Formal Architecture Model
              </span>
            </div>

            <h2 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.5rem" }}>
              {selectedUml.title}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: "1.6", marginBottom: "1.25rem" }}>
              {selectedUml.description}
            </p>

            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  fontSize: "0.76rem",
                  color: "var(--palette-deep)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.5rem",
                  fontWeight: 700
                }}
              >
                Mermaid Specification Code
              </div>
              <div
                style={{
                  background: "#161522",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.08)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.55rem 0.9rem",
                    background: "#201e30",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)"
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.76rem", color: "#e2e8f0" }}>
                    diagram.mmd
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(selectedUml.source || selectedUml.mermaidCode || selectedUml.description)}
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: copiedCode ? "#4ade80" : "#cbd5e1",
                      fontSize: "0.72rem",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem"
                    }}
                  >
                    {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedCode ? "Copied!" : "Copy Spec"}</span>
                  </button>
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: "1rem",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                    lineHeight: "1.55",
                    color: "#f1f5f9",
                    maxHeight: "420px",
                    overflowY: "auto",
                    whiteSpace: "pre"
                  }}
                >
                  {selectedUml.source || selectedUml.mermaidCode || selectedUml.description}
                </pre>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "1rem",
                borderTop: "1px solid var(--palette-border)"
              }}
            >
              <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                Press Esc or click Cross to return
              </span>
              <button className="btn-secondary" onClick={() => setSelectedUml(null)}>
                <ArrowLeft size={15} />
                Back to Diagrams Index
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
