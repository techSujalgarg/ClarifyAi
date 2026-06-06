import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  History, 
  Settings, 
  Loader2, 
  BrainCircuit, 
  Sparkles, 
  Copy, 
  Trash2, 
  Zap, 
  ArrowRight,
  Info,
  ChevronRight,
  X,
  FileCheck,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { HistoryItem, AnalysisResult } from './types';

// Predefined demo templates to test with single click
const SAMPLE_TEMPLATES = [
  {
    id: "t1",
    name: "IP Grab & Confidential NDA",
    type: "NDAs",
    text: `CONFIDENTIALITY & IP TRANSFER AGREEMENT
This Agreement is entered into on this 6th day of June, 2026.
Section 3. One-Way Nondisclosure: Contractor agrees to keep all trade secrets of the Client strictly confidential. Client is not bound by reciprocal confidentiality terms regarding contractor methodologies.
Section 5. Assignment of Inventions & Prior Rights: The Contractor hereby explicitly grants, transfers, and assigns to the Client in perpetuity all right, title, and interest in and to any and all inventions, works, creative designs, software code, and improvements, including any pre-existing works or background intellectual property created prior to this agreement. This transfer is immediate, royalty-free, and irrevocable.
Section 8. Liquidated Damages: In the event of any metadata or confidential asset disclosure, Contractor shall immediately pay Client $100,000 in liquidated damages without the requirement of Client proving actual financial damage.`
  },
  {
    id: "t2",
    name: "Net-90 Payment & Unlimited Liability",
    type: "Service Agreement",
    text: `INDEPENDENT CONTRACTOR SERVICE AGREEMENT
Section 2. Late Payment & Terms: All outstanding invoices submitted by Contractor to Client shall be scheduled for payment on a Net-90 basis. No state interest, convenience fees, or late payment adjustments may accrue.
Section 4. Revisions & Acceptance: Contractor agrees to perform unlimited iterations and lifetime revisions of the project assets until the Client provides written satisfaction, absolute approval, and final signoff.
Section 7. Uncapped Liability: Contractor agrees to defend, indemnify, and hold harmless the Client and its subsidiaries from any and all intellectual property infringement, loss of profits, system outages, or general claims. The Contractor’s liability under this provision is uncapped and unlimited.`
  },
  {
    id: "t3",
    name: "5-Year Global Non-Compete",
    type: "Non-Compete Clause",
    text: `REVENUE PROTECTION & NON-COMPETE COVENANT
Clause 11. Restrictive Industry Covenant: Upon cessation of contract engagement, the Contract Partner is strictly prohibited from engaging, consulting, contracting, or accepting employment with any commercial enterprise, venture, platform, online service, or business entity operating globally within the technology, artificial intelligence, advisory, or software sectors.
Clause 12. Term of Obligation: This restraint of trade shall remain active and legally binding for a term of sixty (60) calendar months starting from the exact date of termination, covering all geographical territories worldwide.`
  }
];

const DEFAULT_HISTORY: HistoryItem[] = [
  {
    id: "h1",
    title: "NDA & Inventions Assignment Review",
    contractText: "CONFIDENTIALITY & IP TRANSFER AGREEMENT\nSection 5. Assignment of Inventions & Prior Rights: The Contractor hereby explicitly grants, transfers, and assigns to the Client in perpetuity all right, title, and interest in and to any and all inventions, works, creative designs, software code...",
    analysisText: `### Simple Summary
This agreement forces you, the contractor, to turn over all of your creative work, code, and inventions—including work you did before signing—to the client. It also binds only you to confidentiality, while letting the client share your internal methods. Finally, it imposes an extreme $100,000 penalty for simple metadata leaks without the client needing to prove they lost any money.

### 🚨 Red Flags Highlighted
- **Complete Intellectual Property Grab (Section 5)**: This assigns all of your past and future inventions, code, and designs to the client for free and permanently, which completely strips you of your background assets.
- **One-way NDA Obligations (Section 3)**: Only you are bound to keep secrets. The client receives your work and proprietary methodology without any reciprocal privacy obligations.
- **Extreme Liquidated Damages (Section 8)**: Automatically charges you $100,000 for unspecified leaks without requiring the client to show actual financial harm.

### Suggested Counter-Clauses
- **Balanced IP Clause**: "The Contractor grants the Client a non-exclusive license to use background IP for this engagement. Specific project IP transfers to the Client strictly upon receipt of full, final written payment."
- **Mutual Security Clause**: "Both parties agree to hold each other's proprietary concepts, metadata, and operational methods in absolute confidence."
- **Fair Remedy Term**: "Any damages for breach of confidentiality must be calculated purely on verified, documented actual financial loss incurred."`,
    timestamp: "6 Jun 07:51"
  }
];

export default function App() {
  const [contractText, setContractText] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Smooth loading simulation phrases
  const [loadingPhrase, setLoadingPhrase] = useState('Parsing contract layers...');
  
  useEffect(() => {
    // Load local history if available, otherwise set default mock item for demonstration
    const stored = localStorage.getItem('clarifyai_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        setHistory(DEFAULT_HISTORY);
      }
    } else {
      setHistory(DEFAULT_HISTORY);
      localStorage.setItem('clarifyai_history', JSON.stringify(DEFAULT_HISTORY));
    }

    // Try to load any previously typed API Key cached locally
    const savedKey = localStorage.getItem('clarifyai_custom_key');
    if (savedKey) {
      setCustomApiKey(savedKey);
    }
  }, []);

  const saveHistoryToStorage = (updatedList: HistoryItem[]) => {
    setHistory(updatedList);
    localStorage.setItem('clarifyai_history', JSON.stringify(updatedList));
  };

  const handleSaveApiKey = (val: string) => {
    setCustomApiKey(val);
    localStorage.setItem('clarifyai_custom_key', val);
    setSuccessMessage('API key fallback cached!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Switch loading phrases to provide elegant SaaS visualization
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      const phrases = [
        "Decrypting legalese structures...",
        "Hunting for intellectual property traps...",
        "Analyzing liability limits...",
        "Identifying Net-90 and hostile payment terms...",
        "Synthesizing protective counter-clauses...",
        "Refining legal consensus output..."
      ];
      let idx = 0;
      interval = setInterval(() => {
        setLoadingPhrase(phrases[idx % phrases.length]);
        idx++;
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Execute Analysis via server route
  const handleAnalyze = async () => {
    if (!contractText.trim()) {
      setErrorMessage("Please input some contract, terms of service, or agreement text first.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');
    setAnalysisResult('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractText,
          customApiKey: customApiKey.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze document.");
      }

      setAnalysisResult(data.result);

      // Save to local history
      const firstLine = contractText.trim().split('\n')[0];
      const title = firstLine.length > 40 ? firstLine.substring(0, 40) + "..." : firstLine;
      const newItem: HistoryItem = {
        id: "h_" + Date.now(),
        title: title || "Custom Contract Review",
        contractText: contractText,
        analysisText: data.result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " today"
      };

      saveHistoryToStorage([newItem, ...history]);
      setSuccessMessage("Agreement analysis decoded successfully!");
      setTimeout(() => setSuccessMessage(''), 4000);

      // Auto-scroll to results widget
      setTimeout(() => {
        const target = document.getElementById('analysis-dashboard');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong. Please confirm your API Key configurations.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setContractText(item.contractText);
    setAnalysisResult(item.analysisText);
    setErrorMessage('');
    
    // Smooth scroll to display results
    setTimeout(() => {
      const target = document.getElementById('analysis-dashboard');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = history.filter(item => item.id !== id);
    saveHistoryToStorage(filtered);
    setSuccessMessage('History item cleared');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleLoadTemplate = (text: string) => {
    setContractText(text);
    setErrorMessage('');
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleClearAll = () => {
    setContractText('');
    setAnalysisResult('');
    setErrorMessage('');
  };

  // Structured parser function to separate sections into visual cards
  const parseAnalysisResult = (text: string): AnalysisResult => {
    if (!text) return { summary: "", redFlags: "", counterClauses: "" };

    let summary = "";
    let redFlags = "";
    let counterClauses = "";

    // Split based on headers with Markdown markers (### or ## or similar)
    // We target "Simple Summary", "Red Flags Highlighted", and "Suggested Counter-Clauses"
    const regex = /###?\s*(?:\d\.\s*)?(Simple Summary|🚨\s*Red Flags Highlighted|Red Flags Highlighted|Red Flags|Suggested Counter-Clauses|Suggested Counter-Clause|Suggested Counter-Phrasing)/gi;
    const parts = text.split(regex);

    if (parts.length >= 5) {
      for (let i = 1; i < parts.length; i += 2) {
        const header = parts[i].toLowerCase();
        const content = parts[i + 1] || "";

        if (header.includes("summary")) {
          summary = content.trim();
        } else if (header.includes("red flag")) {
          redFlags = content.trim();
        } else if (header.includes("suggested") || header.includes("counter")) {
          counterClauses = content.trim();
        }
      }
    }

    // Fallback if parsing split failed
    if (!summary && !redFlags && !counterClauses) {
      summary = text;
    }

    return { summary, redFlags, counterClauses };
  };

  const { summary, redFlags, counterClauses } = parseAnalysisResult(analysisResult);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-indigo-550/30 selection:text-indigo-200 relative overflow-hidden">
      
      {/* Decorative Background Glows from Frosted Glass Theme */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-650/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-violet-655/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* FIXED GLASSMORPHIC NAVBAR CONTAINER */}
      <nav id="navbar" className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 backdrop-blur-md bg-slate-950/40 px-4 sm:px-8 py-3.5 transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
              ⚖️
            </div>
            <div>
              <span className="font-display font-bold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">ClarifyAI</span>
              <span className="ml-2.5 px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded uppercase tracking-wider">Hackathon Edition</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* API Key Fallback Input on Nav */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">Custom Key (fallback):</span>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter custom key..."
                  value={customApiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  className="w-48 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                />
                {customApiKey && (
                  <button 
                    onClick={() => handleSaveApiKey('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Live API Heartbeat indicator */}
            <div className="flex items-center space-x-2 rounded-full border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-350 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-300">API: Stable</span>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-400 mb-6 transition-all hover:bg-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-medium font-display tracking-wide uppercase text-[10px]">Empowering Freelancers & Creators Worldwide</span>
          </div>

          <h1 className="font-display font-extrabold leading-tight tracking-tight text-white text-3xl sm:text-5xl md:text-6xl mb-4">
            Decode Legal Jargon <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              in Seconds.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-400 mb-8 font-light leading-relaxed">
            Spot hidden red flags, pre-existing asset overrides, and global non-compete traps before you sign.
          </p>

          <div className="flex justify-center space-x-4">
            <a 
              href="#workspace-section"
              className="group flex items-center space-x-2 rounded-lg bg-indigo-650 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-550 shadow-lg shadow-indigo-900/20"
            >
              <span>Scan Contract Now</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a 
              href="#templates-card"
              className="flex items-center space-x-2 rounded-lg border border-slate-800/80 bg-slate-900/40 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-850/50"
            >
              <span>Try Sandbox Templates</span>
            </a>
          </div>

          {/* Value props badges */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto border-t border-slate-800/50 pt-8">
            <div className="flex items-center justify-center space-x-2.5 text-slate-400">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold">Under 5s Analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-2.5 text-slate-400">
              <FileCheck className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold">De-jargon Summarizer</span>
            </div>
            <div className="flex items-center justify-center space-x-2.5 text-slate-400">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold">Red Flag Hunter</span>
            </div>
            <div className="flex items-center justify-center space-x-2.5 text-slate-400">
              <BookOpen className="h-4 w-4 text-teal-400" />
              <span className="text-xs font-semibold">Alternative Counter-Clauses</span>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD WORKSPACE SECTION */}
      <section id="workspace-section" className="mx-auto max-w-7xl px-4 sm:px-8 pb-32">
        
        {/* Split Grid Parent */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR (Width 4 columns on desktop) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Quick Mobile API Key custom fallback box if view is narrow */}
            <div className="md:hidden rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-sm p-4">
              <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center space-x-2">
                <span>🔑 Custom API Key Fallback</span>
              </h3>
              <p className="text-[11px] text-slate-500 mb-3 leading-snug">
                Provide a Gemini API key if process.env isn't set in secrets.
              </p>
              <input
                type="password"
                placeholder="Enter custom API key..."
                value={customApiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none placeholder:text-slate-650"
              />
            </div>

            {/* Sandbox Templates Selector */}
            <div id="templates-card" className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-full blur-lg" />
              <h2 className="font-display font-bold text-white text-sm tracking-tight mb-3 flex items-center space-x-2">
                <span>📁 Preset Sandbox Agreements</span>
              </h2>
              <p className="text-xs text-slate-400 mb-4 leading-normal">
                Don't have a contract handy? Load an unfair boilerplate document below to run analysis immediately:
              </p>

              <div className="space-y-2.5">
                {SAMPLE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleLoadTemplate(tpl.text)}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-800/50 bg-slate-950/40 hover:bg-slate-900/80 hover:border-indigo-500/40 transition group relative overflow-hidden cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-mono tracking-wider font-semibold text-indigo-400 uppercase">{tpl.type}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-indigo-400 transition transform group-hover:translate-x-0.5" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white leading-snug">
                      {tpl.name}
                    </h4>
                  </button>
                ))}
              </div>
            </div>

            {/* Session History panel */}
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display font-bold text-white text-sm flex items-center space-x-2">
                  <History className="h-4 w-4 text-violet-400" />
                  <span>Analysis History</span>
                </h2>
                <span className="text-[10px] font-bold bg-indigo-550/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 leading-none">
                  {history.length} Saved
                </span>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8 rounded-xl bg-slate-950/20 border border-dashed border-slate-805">
                  <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-500">No analyzed documents yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {history.map((hItem) => (
                    <div
                      key={hItem.id}
                      onClick={() => handleLoadHistoryItem(hItem)}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-800/50 bg-slate-950/30 hover:bg-slate-900/80 hover:border-violet-500/30 cursor-pointer transition group"
                    >
                      <div className="flex items-start space-x-2 w-[85%]">
                        <FileText className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                            {hItem.title}
                          </p>
                          <span className="text-[9px] text-slate-500 tracking-normal font-mono block mt-0.5">
                            {hItem.timestamp}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteHistoryItem(hItem.id, e)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informative Help Center widget using the styled gradient box pattern */}
            <div className="p-5 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border border-slate-800/50 rounded-2xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10">
                <Scale className="h-24 w-24 text-indigo-400 transform translate-x-4 translate-y-4" />
              </div>
              <h3 className="font-semibold text-slate-200 text-xs mb-2.5 flex items-center space-x-1.5">
                <Info className="h-4 w-4 text-indigo-400" />
                <span>Analyzer Guide</span>
              </h3>
              <p className="leading-relaxed mb-3 text-slate-400 text-xs">
                This analyzer models the background legal structures inside contracts and benchmarks them against freelancer protection guidelines:
              </p>
              <ul className="space-y-2 list-none pl-0 font-light text-[11px] text-slate-400">
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span><strong>IP Safety</strong> ensures your work is only transferred upon receipt of absolute payment cleared.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span><strong>Indemnification</strong> blocks agreements with unlimited contractor liability claims.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span><strong>Non-Competes</strong> highlights overly general geographical exclusions.</span>
                </li>
              </ul>
            </div>
            
          </aside>

          {/* RIGHT MAIN PANEL (Width 8 columns on desktop) */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Input Form Wrapper Card (Editor Panel) */}
            <div className="flex flex-col bg-slate-900/40 border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
              
              {/* Top Mac-style bar inside Editor Panel */}
              <div className="flex items-center justify-between p-3 border-b border-slate-800/50 bg-slate-950/20">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-700/80"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700/80"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700/80"></div>
                </div>
                <span className="text-[11px] font-mono text-slate-500">agreement_v2_final.pdf</span>
              </div>

              {/* Header block for layout clarity */}
              <div className="px-5 pt-4 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="font-display font-semibold text-sm text-slate-200 flex items-center space-x-2">
                    <FileText className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Agreement Input Desk</span>
                  </h2>
                </div>
                
                {contractText && (
                  <button
                    onClick={handleClearAll}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 border border-slate-800 rounded px-2.5 py-1 bg-slate-950/40 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset Field</span>
                  </button>
                )}
              </div>

              {/* Text Area Box */}
              <div className="relative px-2">
                <textarea
                  value={contractText}
                  onChange={(e) => {
                    setContractText(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Paste your legal document, terms, NDAs, non-compete clauses, work orders, or service agreements here..."
                  className="w-full bg-transparent p-4 text-sm leading-relaxed text-slate-300 resize-none outline-none placeholder:text-slate-650 font-mono focus:ring-0 min-h-[220px]"
                  style={{ minHeight: "220px" }}
                />
                
                <div className="absolute bottom-3 right-5 flex items-center space-x-2 text-[10px] font-mono text-slate-550 pointer-events-none">
                  <span>{contractText.length} characters</span>
                  <span>|</span>
                  <span>{contractText.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>

              {/* Validation or status alert */}
              {errorMessage && (
                <div className="mx-4 mb-4 flex items-center space-x-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-300">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  <p className="font-medium leading-normal">{errorMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="mx-4 mb-4 flex items-center space-x-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <p className="font-medium">{successMessage}</p>
                </div>
              )}

              {/* Action Operations Bar (Editor Panel Footer) */}
              <div className="p-4 bg-slate-900/60 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 w-full sm:w-auto">
                  {!customApiKey ? (
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Zap className="h-3 w-3 text-indigo-500 animate-pulse" />
                      <span>Ready for secure parsing</span>
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Configured fallback API key</span>
                    </span>
                  )}
                </div>

                <div className="flex gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !contractText.trim()}
                    className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                      isAnalyzing 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                        : !contractText.trim()
                          ? "bg-slate-800/80 text-slate-500 cursor-not-allowed"
                          : "bg-indigo-650 hover:bg-indigo-550 text-white shadow-indigo-900/20"
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analysing...</span>
                      </>
                    ) : (
                      <>
                        <span>✨ Analyze Document</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Loading Skeleton Visualization Overlay */}
            {isAnalyzing && (
              <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-10 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 animate-pulse">
                <BrainCircuit className="h-10 w-10 text-indigo-400 animate-bounce" />
                <div className="text-center">
                  <h3 className="font-semibold text-white">{loadingPhrase}</h3>
                  <p className="text-xs text-slate-500 mt-1">Comparing with legal standard protections...</p>
                </div>
                <div className="w-full max-w-xs bg-slate-850 rounded-full h-1 mt-2 overflow-hidden relative">
                  <div className="bg-indigo-550 h-full w-2/3 rounded-full animate-marquee absolute" style={{ animationDuration: '1.5s' }} />
                </div>
              </div>
            )}

            {/* Dynamic Output Section (Visible when results exist) */}
            {analysisResult && (
              <div id="analysis-dashboard" className="space-y-6">
                
                {/* Section Title */}
                <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
                  <div>
                    <h2 className="font-display font-extrabold text-xl text-white">
                      Analysis Outcome
                    </h2>
                    <p className="text-xs text-slate-400">
                      Standard Benchmark Score: <span className="text-indigo-400 font-mono">Decoded (Gemini 3.5 Flash)</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyText(analysisResult, 'full')}
                    className="text-xs flex items-center space-x-1.5 border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-900/60 text-slate-300 hover:text-white transition hover:border-slate-700 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copiedSection === 'full' ? 'Copied Full Output!' : 'Copy Entire Report'}</span>
                  </button>
                </div>

                {/* Grid Split Cards */}
                <div className="space-y-4">

                  {/* BLOCK 1: SIMPLE SUMMARY */}
                  {summary && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 backdrop-blur-sm transition-all hover:bg-indigo-500/15">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-indigo-400" />
                          <span>Simple Summary</span>
                        </h3>
                        <button
                          onClick={() => handleCopyText(summary, 'summary')}
                          className="text-slate-500 hover:text-indigo-400 p-1 rounded transition cursor-pointer"
                          title="Copy summary"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="text-xs text-slate-350 leading-relaxed font-light whitespace-pre-line">
                        {summary}
                      </div>
                    </div>
                  )}

                  {/* BLOCK 2: RED FLAGS HIGHLIGHTED */}
                  {redFlags && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 backdrop-blur-sm transition-all hover:bg-amber-500/15">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span>🚨 Red Flags Highlighted</span>
                        </h3>
                        <button
                          onClick={() => handleCopyText(redFlags, 'flags')}
                          className="text-slate-500 hover:text-amber-400 p-1 rounded transition cursor-pointer"
                          title="Copy flags list"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="text-xs text-amber-200/80 leading-relaxed font-light whitespace-pre-line">
                        {redFlags}
                      </div>
                    </div>
                  )}

                  {/* BLOCK 3: SUGGESTED COUNTER-CLAUSE */}
                  {counterClauses && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 backdrop-blur-sm transition-all hover:bg-emerald-500/15">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span>Suggested Counter-Clause</span>
                        </h3>
                        <button
                          onClick={() => handleCopyText(counterClauses, 'counter')}
                          className="text-slate-500 hover:text-emerald-400 p-1 rounded transition cursor-pointer"
                          title="Copy alternative clauses"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="text-xs text-emerald-250/80 font-mono leading-relaxed p-2 bg-emerald-950/20 rounded border border-emerald-500/10 whitespace-pre-line">
                        {counterClauses}
                      </div>
                    </div>
                  )}

                </div>

                {/* Disclaimer widget */}
                <div className="flex gap-3 p-4 rounded-xl border border-slate-800/50 bg-slate-900/20 text-slate-500 text-[11px] leading-relaxed">
                  <Info className="h-4 w-4 text-slate-550 shrink-0 mt-0.5" />
                  <p>
                    <strong>Hackathon & Presentation Disclaimer:</strong> ClarifyAI provides rapid text parsing and general risk highlighting benchmarked against standard commercial practices using the Gemini Large Language Model. It is not a licensed legal consultant or law firm, and does not provide formal legal counsel or binding guarantees. Consult attorney representation before final business commitments.
                  </p>
                </div>

              </div>
            )}

          </main>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-8 text-center text-xs text-slate-600 font-light">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Scale className="h-4 w-4 text-indigo-500" />
            <span className="font-semibold text-slate-400">ClarifyAI Analyzer</span>
          </div>
          <p>© 2026 ClarifyAI. Built for Vercel & Google AI Studio Demo. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
