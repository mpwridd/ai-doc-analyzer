'use client';

import { useState, useRef, useCallback } from 'react';
import { FileText, Search, Lightbulb, BarChart3, Tag, HelpCircle, MessageSquare, Globe, Upload, Copy, Download, RefreshCw, Trash2 } from 'lucide-react';

const ANALYSIS_TYPES = [
  { id: 'summary', name: 'Summary', icon: FileText, color: 'text-blue-400', bg: 'from-blue-600 to-indigo-600', desc: 'Executive summary' },
  { id: 'insights', name: 'Insights', icon: Lightbulb, color: 'text-yellow-400', bg: 'from-yellow-600 to-orange-600', desc: 'Deep analysis' },
  { id: 'sentiment', name: 'Sentiment', icon: BarChart3, color: 'text-purple-400', bg: 'from-purple-600 to-violet-600', desc: 'Tone & emotion' },
  { id: 'keywords', name: 'Keywords', icon: Tag, color: 'text-green-400', bg: 'from-green-600 to-emerald-600', desc: 'Topics & themes' },
  { id: 'questions', name: 'Questions', icon: HelpCircle, color: 'text-cyan-400', bg: 'from-cyan-600 to-blue-600', desc: 'Generate Q&A' },
  { id: 'qa', name: 'Q&A Chat', icon: MessageSquare, color: 'text-pink-400', bg: 'from-pink-600 to-rose-600', desc: 'Ask anything' },
  { id: 'translate', name: 'Translate', icon: Globe, color: 'text-orange-400', bg: 'from-orange-600 to-red-600', desc: 'Multi-language' },
];

const LANGUAGES = ['English', 'Indonesian', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Arabic', 'Portuguese'];

const SAMPLE_DOCUMENTS: Record<string, string> = {
  summary: `Artificial Intelligence (AI) has emerged as one of the most transformative technologies of the 21st century. From healthcare to finance, AI applications are reshaping industries at an unprecedented pace.

Key developments include:
1. Large Language Models (LLMs) like GPT and Claude have demonstrated remarkable natural language understanding capabilities.
2. Computer vision has achieved human-level accuracy in image recognition tasks.
3. Reinforcement learning has enabled breakthroughs in robotics and game-playing AI.

The market for AI is projected to reach $1.8 trillion by 2030, with compound annual growth rates exceeding 35%. Major players include OpenAI, Google DeepMind, Anthropic, and emerging Chinese competitors like Xiaomi and Baidu.

However, challenges remain. AI safety, alignment, and regulation are critical concerns. The technology's potential for misuse — from deepfakes to autonomous weapons — requires careful governance frameworks.`,
  insights: `The global cryptocurrency market has undergone significant transformation since Bitcoin's inception in 2009. Key developments include:

1. DeFi (Decentralized Finance) has grown to over $50B in total value locked
2. NFTs peaked at $25B in 2022 before correcting sharply
3. Layer 2 solutions like Arbitrum and Optimism are solving Ethereum's scalability issues
4. Institutional adoption has accelerated with Bitcoin ETF approvals

Market cycles have become more complex, influenced by macroeconomic factors, regulatory changes, and technological innovation. The halving cycle of Bitcoin continues to drive supply-side economics.`,
};

export default function Home() {
  const [content, setContent] = useState('');
  const [analysisType, setAnalysisType] = useState('summary');
  const [question, setQuestion] = useState('');
  const [targetLang, setTargetLang] = useState('Indonesian');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [history, setHistory] = useState<{ type: string; result: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateCounts = useCallback((text: string) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  }, []);

  const handleContentChange = (text: string) => {
    setContent(text);
    updateCounts(text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      handleContentChange(text);
    };
    reader.readAsText(file);
  };

  const analyze = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, analysisType, question, targetLang }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
      setHistory(prev => [{ type: analysisType, result: data.result }, ...prev].slice(0, 8));
    } catch (err: unknown) {
      setResult(`❌ Error: ${err instanceof Error ? err.message : 'Failed to analyze'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    const sample = SAMPLE_DOCUMENTS[analysisType] || SAMPLE_DOCUMENTS.summary;
    handleContentChange(sample);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${analysisType}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText size={28} />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                AI Document Analyzer
              </h1>
              <p className="text-gray-400 text-sm">Upload, analyze, and understand any document</p>
            </div>
          </div>
        </header>

        {/* Analysis Type Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
          {ANALYSIS_TYPES.map(a => (
            <button
              key={a.id}
              onClick={() => setAnalysisType(a.id)}
              className={`p-3 rounded-xl text-center transition-all ${
                analysisType === a.id
                  ? `bg-gradient-to-br ${a.bg} shadow-lg ring-2 ring-white/20`
                  : 'bg-gray-900 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              <a.icon size={18} className={`mx-auto mb-1 ${a.color}`} />
              <span className="block text-xs font-medium">{a.name}</span>
              <span className="block text-[10px] text-gray-400 mt-0.5">{a.desc}</span>
            </button>
          ))}
        </div>

        {/* Main Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input */}
          <div className="bg-gray-900 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold flex items-center gap-2">
                <FileText size={16} className="text-blue-400" />
                Document
                <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400 font-normal">
                  {wordCount} words · {charCount} chars
                </span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={loadSample}
                  className="text-xs bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-lg text-gray-400 transition-colors"
                >
                  Sample
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-lg text-gray-400 transition-colors flex items-center gap-1"
                >
                  <Upload size={12} /> Upload
                </button>
                <button
                  onClick={() => { handleContentChange(''); setResult(''); }}
                  className="text-xs bg-gray-800 hover:bg-red-600/20 px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.csv,.json,.xml,.html,.log,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <textarea
              className="w-full h-72 bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Paste your document here, or upload a file..."
              value={content}
              onChange={e => handleContentChange(e.target.value)}
            />

            {analysisType === 'qa' && (
              <input
                className="w-full mt-3 bg-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Ask a question about the document..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && analyze()}
              />
            )}

            {analysisType === 'translate' && (
              <select
                className="w-full mt-3 bg-gray-800 rounded-xl px-4 py-3 text-sm border border-gray-700"
                value={targetLang}
                onChange={e => setTargetLang(e.target.value)}
              >
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            )}

            <button
              onClick={analyze}
              disabled={loading || !content.trim()}
              className="mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 rounded-xl py-3.5 font-bold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><RefreshCw size={18} className="animate-spin" /> Analyzing...</>
              ) : (
                <span className="flex items-center gap-2">Analyze</span>
              )}
            </button>
          </div>

          {/* Output */}
          <div className="bg-gray-900 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold flex items-center gap-2">
                <Search size={16} className="text-indigo-400" />
                Analysis Result
              </h2>
              {result && !result.startsWith('❌') && (
                <div className="flex gap-2">
                  <button
                    onClick={downloadResult}
                    className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-1.5 text-sm transition-colors"
                  >
                    <Download size={14} /> Export
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-1.5 text-sm transition-colors"
                  >
                    {copied ? '✅ Copied!' : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
              )}
            </div>

            <div className="h-[380px] overflow-y-auto bg-gray-800 rounded-xl p-5">
              {result ? (
                result.startsWith('❌') ? (
                  <div className="text-red-400">{result}</div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-gray-200 leading-relaxed">
                    {result}
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Search size={48} className="mx-auto text-gray-700 mb-3" />
                    <p className="font-medium">Ready to analyze</p>
                    <p className="text-sm mt-1">Paste a document and select analysis type</p>
                  </div>
                </div>
              )}
            </div>

            {/* History */}
            {history.length > 1 && (
              <div className="mt-4">
                <h3 className="text-xs font-medium text-gray-500 mb-2">Previous Analyses</h3>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {history.slice(1).map((h, i) => (
                    <button
                      key={i}
                      onClick={() => setResult(h.result)}
                      className="flex-shrink-0 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-gray-400 transition-colors"
                    >
                      {h.type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Supported formats */}
        <div className="mt-6 text-center text-xs text-gray-600">
          Supported formats: .txt · .md · .csv · .json · .xml · .html · .log · .pdf · .doc
        </div>
      </div>
    </div>
  );
}
