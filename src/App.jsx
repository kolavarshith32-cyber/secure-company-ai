import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, Lock, Shield, Sparkles, Send, Paperclip, FileText, 
  BarChart2, Settings, Bell, LogOut, Sun, Moon, Database, Code, 
  User, CheckCircle, AlertCircle, ChevronRight, X
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'dashboard', 'settings'
  const [currentUser, setCurrentUser] = useState(null); // null = Auth Screen

  // Auth Form State
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('marcus@nexlify.io');
  const [password, setPassword] = useState('••••••••');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Admin');

  // Chat & File States
  const [aiMode, setAiMode] = useState('auto'); // 'auto', 'coding', 'company', 'general'
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello Marcus! I'm SecureCompanyAI. I can analyze company documents, query structured databases, or write code in Java, Python, C, C++, and SQL.",
      timestamp: 'Just now',
      mode: 'General AI'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  const isDark = theme === 'dark';

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      setCurrentUser({
        name: email.includes('marcus') ? 'Marcus Reinholt' : email.split('@')[0],
        email: email,
        role: email.includes('marcus') ? 'Admin' : 'Employee'
      });
    } else {
      setCurrentUser({
        name: fullName || 'New User',
        email: email,
        role: role
      });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleSendMessage = () => {
    if (!inputQuery.trim() && !attachedFile) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputQuery,
      file: attachedFile ? attachedFile.name : null,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputQuery;
    const currentFile = attachedFile;

    setInputQuery('');
    setAttachedFile(null);

    // AI Response Simulation with Auto-Detection Engine
    setTimeout(() => {
      let responseText = '';
      let detectedMode = aiMode;

      if (aiMode === 'auto') {
        const lower = currentQuery.toLowerCase();
        if (lower.includes('code') || lower.includes('java') || lower.includes('python') || lower.includes('c++') || lower.includes('c ') || lower.includes('sql')) {
          detectedMode = 'coding';
        } else if (lower.includes('leave') || lower.includes('sla') || lower.includes('gdpr') || lower.includes('policy') || lower.includes('document')) {
          detectedMode = 'company';
        } else {
          detectedMode = 'general';
        }
      }

      if (currentFile) {
        responseText = `📄 **File Analysis Completed (${currentFile.name}):**\n\nI have thoroughly processed the attached file contents. Key findings:\n* Document Structure: Validated\n* Content Status: Indexed in workspace\n* AI Recommendation: Clean syntax and compliance tags verified.`;
      } else if (detectedMode === 'coding') {
        responseText = `💻 **Automated Coding AI Engine**\n\nHere is the requested solution in **Java**:\n\n\`\`\`java\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Secure Execution Active");\n    }\n}\n\`\`\`\n\nFeatures:\n* Memory-safe execution boundaries\n* Strictly validated against enterprise lint standards.`;
      } else if (detectedMode === 'company') {
        responseText = `🏢 **Company Work AI (RBAC Scope: ${currentUser?.role || 'Employee'})**\n\nBased on Nexlify's private document database:\n* **Annual Leave Allowance:** 24 paid vacation days annually.\n* **P1 Incident Response SLA:** 15-minute acknowledgement window.`;
      } else {
        responseText = `🌐 **General AI:** Hello! I'm fully initialized and ready to assist with project planning, general technical queries, or system architecture setup.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: responseText,
          timestamp: 'Just now',
          mode: detectedMode.toUpperCase()
        }
      ]);
    }, 800);
  };

  // --- AUTHENTICATION VIEW ---
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        {/* Left Branding Side */}
        <div className="hidden lg:flex flex-1 bg-blue-600 p-12 flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-white" />
            <span className="font-bold text-2xl tracking-tight text-white">SecureCompanyAI</span>
          </div>
          <div className="max-w-xl z-10">
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Your company's private AI, trained on your knowledge.
            </h1>
            <p className="text-blue-100 text-lg mb-8">
              Every software enterprise gets a fully isolated workspace. Upload docs, run SQL queries, and generate code without data cross-leakage.
            </p>
          </div>
          <div className="text-sm text-blue-200">
            SOC 2 compliant • End-to-end encrypted • GDPR ready
          </div>
        </div>

        {/* Right Auth Form Side */}
        <div className="flex-1 flex flex-col justify-center items-center p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Tab Toggle */}
            <div className={`p-1 rounded-xl flex gap-1 ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                  authMode === 'signup'
                    ? 'bg-blue-600 text-white shadow'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                {authMode === 'login' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {authMode === 'login' ? 'Sign in to your company workspace' : 'Set up your workspace credentials'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Marcus Reinholt"
                    className={`w-full px-4 py-3 rounded-xl outline-none border transition ${
                      isDark 
                        ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' 
                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Company Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="marcus@nexlify.io"
                  className={`w-full px-4 py-3 rounded-xl outline-none border transition ${
                    isDark 
                      ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Workspace Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl outline-none border transition ${
                      isDark 
                        ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' 
                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  >
                    <option value="Admin">Admin (Full Access)</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR & Personnel</option>
                    <option value="Finance">Finance</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl outline-none border transition ${
                    isDark 
                      ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition"
              >
                {authMode === 'login' ? 'Sign in to workspace' : 'Create workspace account'}
              </button>
            </form>

            {/* Demo Quick Accounts */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <div className="text-xs font-bold uppercase text-slate-500 mb-3">Quick Demo Accounts</div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { setEmail('marcus@nexlify.io'); setPassword('••••••••'); setAuthMode('login'); }}
                  className="w-full flex items-center justify-between text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 transition"
                >
                  <span className="font-semibold text-blue-600">Admin</span>
                  <span className="text-slate-500">marcus@nexlify.io</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('priya.sharma@nexlify.io'); setPassword('••••••••'); setAuthMode('login'); }}
                  className="w-full flex items-center justify-between text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 transition"
                >
                  <span className="font-semibold text-emerald-600">Employee</span>
                  <span className="text-slate-500">priya.sharma@nexlify.io</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN WORKSPACE APP ---
  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'}`}>
      {/* Sidebar Navigation */}
      <aside className={`w-64 border-r flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div>
          {/* Logo Header */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
            <Shield className="w-7 h-7 text-blue-500" />
            <span className="font-bold text-lg tracking-tight">SecureCompanyAI</span>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow'
                  : isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              AI Chat
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow'
                  : isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </nav>
        </div>

        {/* User Profile & Signout */}
        <div className="p-4 border-t border-slate-800/50 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-bold text-sm truncate">{currentUser.name}</div>
              <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
            </div>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* VIEW: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="p-8 max-w-3xl overflow-y-auto space-y-6">
            <h2 className="text-2xl font-bold">Settings & Workspace Control</h2>
            
            {/* Theme Toggle Panel */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="font-bold text-lg mb-4">Appearance Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border flex items-center gap-3 font-semibold transition ${
                    theme === 'light' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                  Light Mode
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border flex items-center gap-3 font-semibold transition ${
                    theme === 'dark' ? 'border-blue-600 bg-slate-800 text-blue-400' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Moon className="w-5 h-5" />
                  Dark Mode
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: AI CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full">
            {/* Chat Header & Mode Picker */}
            <header className={`p-4 border-b flex items-center justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-blue-500" />
                <div>
                  <div className="font-bold text-base">Enterprise Assistant</div>
                  <div className="text-xs text-slate-400">Isolated Workspace Mode</div>
                </div>
              </div>

              {/* AI Engine Switcher */}
              <div className={`p-1 rounded-xl flex gap-1 border text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                {['auto', 'coding', 'company', 'general'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setAiMode(m)}
                    className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                      aiMode === m 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m === 'auto' ? '✨ Auto-Detect' : m}
                  </button>
                ))}
              </div>
            </header>

            {/* Chat Message History */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-5 text-base leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : isDark ? 'bg-slate-900 border border-slate-800 text-slate-100' : 'bg-white border border-slate-200 text-slate-900 shadow-sm'
                    }`}
                  >
                    {msg.mode && (
                      <div className="text-xs font-bold tracking-wider uppercase text-blue-400 mb-2">
                        {msg.mode}
                      </div>
                    )}
                    {msg.file && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20 text-xs mb-3 font-mono">
                        <FileText className="w-4 h-4" />
                        Attached File: {msg.file}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Dock */}
            <footer className={`p-4 border-t ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="max-w-4xl mx-auto space-y-2">
                {attachedFile && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-semibold border border-blue-500/30">
                    <FileText className="w-4 h-4" />
                    <span>{attachedFile.name}</span>
                    <button onClick={() => setAttachedFile(null)} className="hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-3 rounded-xl border transition ${
                      isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Paperclip className="w-5 h-5 text-slate-400" />
                  </button>

                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask questions, upload files, write Java/Python code..."
                    className={`flex-1 px-4 py-3.5 rounded-xl border outline-none text-base transition ${
                      isDark 
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />

                  <button
                    onClick={handleSendMessage}
                    className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}