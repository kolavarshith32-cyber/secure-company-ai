import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  FileText,
  MessageSquare,
  Lock,
  Search,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Paperclip,
  Send,
  LogOut,
  ChevronLeft,
  RefreshCw,
  Upload,
  Settings,
  LayoutDashboard,
  Eye,
  EyeOff,
  Database,
  Sparkles,
  X,
  Key,
  LockKeyhole,
  Moon,
  Sun,
  Save,
  Check,
  UserCheck,
  UserPlus,
  Code,
  Globe,
  Briefcase,
  Zap,
  Copy,
  Terminal,
  Table
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const INITIAL_MOCK_CREDENTIALS = [
  {
    email: 'marcus@nexlify.io',
    name: 'Marcus Reinholt',
    role: 'Admin',
    dept: 'Executive / Platform',
    avatar: 'MR',
    pass: 'admin123'
  },
  {
    email: 'priya.sharma@nexlify.io',
    name: 'Priya Sharma',
    role: 'Employee',
    dept: 'Customer Support',
    avatar: 'PS',
    pass: 'user123'
  },
  {
    email: 'sarah.finance@nexlify.io',
    name: 'Sarah Jenkins',
    role: 'Finance',
    dept: 'Financial Operations',
    avatar: 'SJ',
    pass: 'fin123'
  }
];

// Enterprise Database Tables connected to Chatbot RAG Engine
const COMPANY_DATABASE_TABLES = {
  incidents: [
    { id: 'INC-101', title: 'Payment Gateway Timeout', severity: 'P1', status: 'Resolved', assigned: 'Engineering', date: '2026-10-09' },
    { id: 'INC-102', title: 'API Rate Limiting Warning', severity: 'P2', status: 'In Progress', assigned: 'DevOps', date: '2026-10-10' },
    { id: 'INC-103', title: 'SSO Certificate Renewal', severity: 'P3', status: 'Open', assigned: 'Security', date: '2026-10-11' }
  ],
  sales_metrics: [
    { quarter: 'Q1 2026', revenue: '$3.2M', target: '$3.0M', growth: '+14%' },
    { quarter: 'Q2 2026', revenue: '$3.8M', target: '$3.5M', growth: '+18%' },
    { quarter: 'Q3 2026', revenue: '$4.2M', target: '$4.0M', growth: '+22%' }
  ],
  employees: [
    { id: 1, name: 'Marcus Reinholt', role: 'Admin', department: 'Executive', status: 'Active' },
    { id: 2, name: 'Priya Sharma', role: 'Employee', department: 'Customer Support', status: 'Active' },
    { id: 3, name: 'Sarah Jenkins', role: 'Finance', department: 'Financial Operations', status: 'Active' }
  ]
};

const INITIAL_DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'HR_Leave_Policy_2026.pdf',
    size: '1.4 MB',
    type: 'PDF',
    updated: '2 hours ago',
    roles: ['All Employees', 'HR', 'Admin'],
    status: 'Indexed',
    content: 'Remote contractors and full-time staff receive 20 paid vacation days per calendar year, accruing at 1.66 days per month worked. Unused leave up to 5 days can be carried over into Q1 of the following year.'
  },
  {
    id: 'doc-2',
    name: 'SLA_Terms_v4.pdf',
    size: '2.8 MB',
    type: 'PDF',
    updated: '1 day ago',
    roles: ['Support', 'Engineering', 'Admin'],
    status: 'Indexed',
    content: 'For P1 critical production incidents, acknowledgment is required within 15 minutes. Status updates must be posted every 30 minutes until resolution, with a post-mortem delivered within 48 hours.'
  },
  {
    id: 'doc-3',
    name: 'Engineering_Code_Review_Guidelines.docx',
    size: '850 KB',
    type: 'DOCX',
    updated: '3 days ago',
    roles: ['Engineering', 'Admin'],
    status: 'Indexed',
    content: 'All pull requests require approval from at least 2 senior engineers. Automated CI/CD security scanning must pass before merging to main branch.'
  },
  {
    id: 'doc-4',
    name: 'GDPR_Compliance_Overview.pdf',
    size: '3.1 MB',
    type: 'PDF',
    updated: '5 days ago',
    roles: ['Legal', 'Admin'],
    status: 'Indexed',
    content: 'Under GDPR compliance guidelines, user personal data must be permanently purged within 30 calendar days upon receipt of account deletion requests.'
  },
  {
    id: 'doc-5',
    name: 'Q3_Financial_Projections_Confidential.xlsx',
    size: '4.2 MB',
    type: 'XLSX',
    updated: '6 days ago',
    roles: ['Finance', 'Executive', 'Admin'],
    status: 'Indexed',
    content: 'Q3 projected ARR growth is 22% quarter-over-quarter. Net profit margin forecast is 18.5%. Cash reserves stand at $14.2M.'
  }
];

const INITIAL_CONVERSATIONS = [
  {
    id: 'c1',
    title: 'New conversation',
    snippet: 'Ask a question, query database, or write code...',
    timestamp: 'Just now',
    timeGroup: 'TODAY',
    msgCount: 0,
    messages: []
  },
  {
    id: 'c2',
    title: 'Java Linked List Reversal',
    snippet: 'Write a Java program to reverse...',
    timestamp: '10 min ago',
    timeGroup: 'TODAY',
    msgCount: 2,
    messages: [
      { id: 'm1', sender: 'user', text: 'Write a Java class to reverse a singly linked list.' },
      { id: 'm2', sender: 'ai', text: 'Here is a clean Java implementation:\n\n```java\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode(int val) { this.val = val; }\n}\n\npublic class LinkedListReverser {\n    public static ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode current = head;\n        while (current != null) {\n            ListNode nextTemp = current.next;\n            current.next = prev;\n            prev = current;\n            current = nextTemp;\n        }\n        return prev;\n    }\n}\n```', detectedMode: 'Code AI (Java)' }
    ]
  }
];

const detectQueryCategory = (text) => {
  const lower = text.toLowerCase();
  
  // Database Query Detection Keywords
  const dbTerms = ['select', 'database', 'table', 'records', 'sql', 'query', 'incidents', 'sales_metrics', 'employees', 'revenue', 'rows', 'count'];
  const isDatabase = dbTerms.some(term => lower.includes(term));

  if (isDatabase && (lower.includes('show') || lower.includes('list') || lower.includes('get') || lower.includes('fetch') || lower.includes('query'))) {
    return { mode: 'database', label: 'Company Database (Live Query)' };
  }

  // Code Detection Keywords
  const codeLanguages = ['java', 'python', 'c++', 'c language', 'c program', 'c++ program', 'javascript', 'typescript', 'sql', 'html', 'css', 'go', 'rust'];
  const codeTerms = ['code', 'program', 'function', 'class', 'algorithm', 'binary search', 'linked list', 'loop', 'array', 'pointer', 'struct', 'method', 'script', 'compile', 'recursion'];
  
  const isCode = codeLanguages.some(lang => lower.includes(lang)) || codeTerms.some(term => lower.includes(term));
  
  let detectedLanguage = 'General Code';
  if (lower.includes('java')) detectedLanguage = 'Java';
  else if (lower.includes('python')) detectedLanguage = 'Python';
  else if (lower.includes('c++')) detectedLanguage = 'C++';
  else if (lower.includes('c program') || lower.includes('in c') || lower.includes('c language')) detectedLanguage = 'C';
  else if (lower.includes('sql')) detectedLanguage = 'SQL';
  else if (lower.includes('javascript') || lower.includes('js')) detectedLanguage = 'JavaScript';

  if (isCode) {
    return { mode: 'code', label: `Code AI (${detectedLanguage})` };
  }

  // Company RAG Detection Keywords
  const companyTerms = ['leave', 'policy', 'sla', 'incident', 'document', 'gdpr', 'financial', 'hr', 'vacation', 'guideline', 'nexlify', 'workspace', 'contractor', 'q3'];
  const isCompany = companyTerms.some(term => lower.includes(term));

  if (isCompany) {
    return { mode: 'company', label: 'Company Work AI' };
  }

  return { mode: 'general', label: 'General AI' };
};

export default function App() {
  const [currentView, setCurrentView] = useState('auth');
  const [themeMode, setThemeMode] = useState('light');
  const [userCredentials, setUserCredentials] = useState(INITIAL_MOCK_CREDENTIALS);
  const [currentUser, setCurrentUser] = useState(INITIAL_MOCK_CREDENTIALS[0]);
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState('c1');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [selectedAiMode, setSelectedAiMode] = useState('auto');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocRole, setNewDocRole] = useState('All Employees');
  const [newDocContent, setNewDocContent] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeChatId]);

  const isDark = themeMode === 'dark';

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type || 'Document',
        content: event.target.result
      });
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleLogin = (userCreds) => {
    setCurrentUser({
      email: userCreds.email,
      name: userCreds.name,
      role: userCreds.role,
      dept: userCreds.dept || 'Engineering',
      workspace: 'Nexlify Software'
    });
    setCurrentView('chat');
  };

  const handleRegisterAccount = (newAccountData) => {
    setUserCredentials((prev) => [newAccountData, ...prev]);
    setCurrentUser({
      email: newAccountData.email,
      name: newAccountData.name,
      role: newAccountData.role,
      dept: newAccountData.dept,
      workspace: 'Nexlify Software'
    });
    setCurrentView('chat');
  };

  const handleSignOut = () => {
    setCurrentView('auth');
  };

  const createNewChat = () => {
    const newId = `c_${Date.now()}`;
    const newChat = {
      id: newId,
      title: 'New conversation',
      snippet: 'Ask a question or query enterprise database...',
      timestamp: 'Just now',
      timeGroup: 'TODAY',
      msgCount: 0,
      messages: []
    };
    setConversations([newChat, ...conversations]);
    setActiveChatId(newId);
    if (currentView !== 'chat') setCurrentView('chat');
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if ((!text.trim() && !attachedFile) || isProcessing) return;

    const targetChatId = activeChatId;

    let fullQuery = text;
    let fileMetaInfo = null;

    if (attachedFile) {
      fileMetaInfo = { name: attachedFile.name, size: attachedFile.size };
      fullQuery = text 
        ? `[Attached File: ${attachedFile.name}]\nFile Content:\n"""\n${attachedFile.content}\n"""\n\nUser Question: ${text}`
        : `[Attached File: ${attachedFile.name}]\nPlease analyze this uploaded file thoroughly and answer details:\n"""\n${attachedFile.content}\n"""`;
    }

    const autoAnalysis = detectQueryCategory(fullQuery);
    const activeMode = selectedAiMode === 'auto' ? autoAnalysis.mode : selectedAiMode;
    const modeBadgeLabel = selectedAiMode === 'auto' 
      ? (attachedFile ? `File Analyzer AI (${attachedFile.name})` : `Auto-Detected: ${autoAnalysis.label}`) 
      : `${selectedAiMode.toUpperCase()} AI Mode`;

    const userDisplayMessage = text && attachedFile 
      ? `📄 [Attached: ${attachedFile.name}]\n${text}`
      : text 
      ? text 
      : `📄 Analyzed uploaded file: ${attachedFile.name}`;

    const currentFileContent = attachedFile ? attachedFile.content : null;
    const currentFileName = attachedFile ? attachedFile.name : null;
    setAttachedFile(null);
    setInputMessage('');

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === targetChatId) {
          const isFirstMsg = c.messages.length === 0;
          return {
            ...c,
            title: isFirstMsg ? (currentFileName || text).slice(0, 28) + '...' : c.title,
            snippet: (text || currentFileName).slice(0, 32) + '...',
            msgCount: c.msgCount + 1,
            timestamp: 'Just now',
            messages: [...c.messages, { id: `m_${Date.now()}`, sender: 'user', text: userDisplayMessage, attachedFile: fileMetaInfo }]
          };
        }
        return c;
      })
    );

    setIsProcessing(true);

    // Database Direct Query Handler
    if (activeMode === 'database' || fullQuery.toLowerCase().includes('select') || fullQuery.toLowerCase().includes('database')) {
      let dbResultText = "";
      let sourceTag = "PostgreSQL Enterprise Database";

      if (fullQuery.toLowerCase().includes('incident')) {
        dbResultText = `### 📊 Live Database Query Results: \`incidents\` Table\n\n| Incident ID | Title | Severity | Status | Assigned |\n|---|---|---|---|---|\n` +
          COMPANY_DATABASE_TABLES.incidents.map(i => `| ${i.id} | ${i.title} | **${i.severity}** | ${i.status} | ${i.assigned} |`).join('\n') +
          `\n\n*Executed SQL*: \`SELECT id, title, severity, status, assigned FROM public.incidents ORDER BY created_at DESC;\``;
      } else if (fullQuery.toLowerCase().includes('sale') || fullQuery.toLowerCase().includes('revenue')) {
        dbResultText = `### 📊 Live Database Query Results: \`sales_metrics\` Table\n\n| Quarter | Revenue | Target | Growth |\n|---|---|---|---|\n` +
          COMPANY_DATABASE_TABLES.sales_metrics.map(s => `| ${s.quarter} | ${s.revenue} | ${s.target} | **${s.growth}** |`).join('\n') +
          `\n\n*Executed SQL*: \`SELECT quarter, revenue, target, growth FROM public.sales_metrics;\``;
      } else {
        dbResultText = `### 📊 Live Enterprise Database Connection Active\n\nConnected Schemas:\n- \`public.users\` (${COMPANY_DATABASE_TABLES.employees.length} records)\n- \`public.incidents\` (${COMPANY_DATABASE_TABLES.incidents.length} records)\n- \`public.sales_metrics\` (${COMPANY_DATABASE_TABLES.sales_metrics.length} records)\n\nAll queries execute with role-level column security for role **${currentUser.role}**.`;
      }

      setTimeout(() => {
        setIsProcessing(false);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetChatId) {
              return {
                ...c,
                msgCount: c.msgCount + 1,
                messages: [
                  ...c.messages,
                  { id: `m_ai_${Date.now()}`, sender: 'ai', text: dbResultText, sources: [sourceTag], detectedMode: modeBadgeLabel }
                ]
              };
            }
            return c;
          })
        );
      }, 600);

      return;
    }

    // RBAC Security Filter
    const allowedDocs = documents.filter((doc) => {
      if (currentUser.role === 'Admin') return true;
      if (doc.roles.includes('All Employees')) return true;
      return doc.roles.includes(currentUser.role);
    });

    const restrictedDocsAttempted = documents.filter((doc) => {
      if (currentUser.role === 'Admin') return false;
      const isAllowed = doc.roles.includes('All Employees') || doc.roles.includes(currentUser.role);
      if (isAllowed) return false;
      const lowerQuery = fullQuery.toLowerCase();
      if (doc.name.toLowerCase().includes('financial') && (lowerQuery.includes('financial') || lowerQuery.includes('q3') || lowerQuery.includes('revenue') || lowerQuery.includes('profit'))) return true;
      if (doc.name.toLowerCase().includes('gdpr') && (lowerQuery.includes('gdpr') || lowerQuery.includes('retention') || lowerQuery.includes('erased'))) return true;
      return false;
    });

    if (activeMode === 'company' && restrictedDocsAttempted.length > 0) {
      const aiReplyText = `🔒 Access Denied: Your credential role (${currentUser.role}) is not authorized to access restricted documents like ${restrictedDocsAttempted.map(d => d.name).join(', ')}. Please contact an administrator if you require access elevation.`;
      setIsProcessing(false);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetChatId) {
            return {
              ...c,
              msgCount: c.msgCount + 1,
              messages: [
                ...c.messages,
                { id: `m_ai_${Date.now()}`, sender: 'ai', text: aiReplyText, sources: [], accessDenied: true, detectedMode: modeBadgeLabel }
              ]
            };
          }
          return c;
        })
      );
      return;
    }

    let aiReplyText = '';
    let sourcesUsed = currentFileName ? [currentFileName] : [];

    setTimeout(() => {
      if (currentFileName) {
        aiReplyText = `### Analysis for ${currentFileName}\n\n- **File Content Processed**: Successfully indexed file contents.\n- **Summary**: All data extracted without errors. Ready for querying.`;
      } else if (activeMode === 'code') {
        if (fullQuery.toLowerCase().includes('java')) {
          aiReplyText = `Here is a complete Java implementation:\n\n\`\`\`java\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Executing Java Enterprise Solution");\n    }\n}\n\`\`\``;
        } else if (fullQuery.toLowerCase().includes('python')) {
          aiReplyText = `Here is the clean Python implementation:\n\n\`\`\`python\ndef process_data(records):\n    return [r for r in records if r.get('status') == 'Active']\n\`\`\``;
        } else {
          aiReplyText = `Here is the C / C++ solution:\n\n\`\`\`c\n#include <stdio.h>\n\nint main() {\n    printf("Running optimized C binary.\\n");\n    return 0;\n}\n\`\`\``;
        }
      } else if (activeMode === 'company') {
        aiReplyText = `Based on your authorized ${currentUser.role} role access, here are the verified details from the enterprise knowledge base.`;
        sourcesUsed = ['HR_Leave_Policy_2026.pdf'];
      } else {
        aiReplyText = `Hello ${currentUser.name}! I am your Enterprise AI Assistant. How can I assist you with your tasks today?`;
      }

      setIsProcessing(false);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetChatId) {
            return {
              ...c,
              msgCount: c.msgCount + 1,
              messages: [
                ...c.messages,
                { id: `m_ai_${Date.now()}`, sender: 'ai', text: aiReplyText, sources: sourcesUsed, detectedMode: modeBadgeLabel }
              ]
            };
          }
          return c;
        })
      );
    }, 700);
  };

  const handleUploadDocument = (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: newDocName.endsWith('.pdf') || newDocName.endsWith('.docx') ? newDocName : `${newDocName}.pdf`,
      size: '1.2 MB',
      type: newDocName.endsWith('.docx') ? 'DOCX' : 'PDF',
      updated: 'Just now',
      roles: [newDocRole, 'Admin'],
      status: 'Indexed',
      content: newDocContent || 'Company policy document uploaded for authorized role access.'
    };
    setDocuments([newDoc, ...documents]);
    setNewDocName('');
    setNewDocContent('');
    setIsUploadModalOpen(false);
  };

  const activeChat = conversations.find((c) => c.id === activeChatId) || conversations[0];

  const filteredConversations = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (currentView === 'auth') {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegisterAccount}
        userCredentials={userCredentials}
      />
    );
  }

  return (
    <div className={`flex h-screen w-full font-sans antialiased overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Sidebar Navigation */}
      <aside
        className={`border-r flex flex-col justify-between transition-all duration-300 z-20 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div>
          <div className={`h-16 px-4 flex items-center border-b justify-between ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            {!isSidebarCollapsed ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  S
                </div>
                <span className={`font-bold tracking-tight text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  SecureCompanyAI
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm mx-auto">
                S
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <div className="p-3">
              <div className={`border rounded-xl p-2.5 flex items-center space-x-3 ${
                isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <div className={`p-2 rounded-lg border shadow-2xs text-blue-600 ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <Database className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className={`font-semibold text-xs truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    {currentUser.workspace}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">nexlify.io workspace</div>
                </div>
              </div>
            </div>
          )}

          <nav className="p-2 space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Workspace
              </div>
            )}

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>

            <button
              onClick={() => setCurrentView('chat')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'chat'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>AI Chat & Coding</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentView === 'chat' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-700'
                }`}>
                  {conversations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('documents')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'documents'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Documents</span>}
            </button>

            {!isSidebarCollapsed && (
              <div className="px-3 pt-4 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Account
              </div>
            )}

            <button
              onClick={() => setCurrentView('settings')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'settings'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Settings & Theme</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md font-semibold">
                  {themeMode.toUpperCase()}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className={`p-3 border-t space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          {!isSidebarCollapsed && (
            <div className={`border rounded-xl p-2.5 space-y-1 ${
              isDark ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-emerald-50/80 border-emerald-200/80'
            }`}>
              <div className={`flex items-center space-x-1.5 text-xs font-semibold ${
                isDark ? 'text-emerald-300' : 'text-emerald-800'
              }`}>
                <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Role Scope: {currentUser.role}</span>
              </div>
              <p className={`text-[10px] ${isDark ? 'text-emerald-400/80' : 'text-emerald-700'}`}>
                {currentUser.dept}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {currentUser.name.split(' ').map((n) => n[0]).join('')}
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden">
                  <div className={`font-semibold text-xs truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>Sign out</span>}
            </button>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1 rounded-md text-slate-400 ${
                isDark ? 'hover:bg-slate-800 hover:text-slate-200' : 'hover:bg-slate-100 hover:text-slate-600'
              }`}
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {currentView === 'chat' && (
          <ChatView
            conversations={filteredConversations}
            activeChat={activeChat}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            createNewChat={createNewChat}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            messagesEndRef={messagesEndRef}
            currentUser={currentUser}
            documents={documents}
            isDark={isDark}
            selectedAiMode={selectedAiMode}
            setSelectedAiMode={setSelectedAiMode}
            attachedFile={attachedFile}
            setAttachedFile={setAttachedFile}
            fileInputRef={fileInputRef}
            handleFileSelect={handleFileSelect}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            createNewChat={createNewChat}
            setIsUploadModalOpen={setIsUploadModalOpen}
            documents={documents}
            conversations={conversations}
            isDark={isDark}
          />
        )}

        {currentView === 'documents' && (
          <DocumentsView
            documents={documents}
            currentUser={currentUser}
            setIsUploadModalOpen={setIsUploadModalOpen}
            isDark={isDark}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            isDark={isDark}
          />
        )}
      </main>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-500" />
                <span>Ingest Document (RBAC Tagged)</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">
                  Document File Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote_Work_Policy_2026.pdf"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">
                  Required Role Permission Tag
                </label>
                <select
                  value={newDocRole}
                  onChange={(e) => setNewDocRole(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                  }`}
                >
                  <option value="All Employees">All Employees</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Legal">Legal</option>
                  <option value="Admin">Admin Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">
                  Document Content Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste policy text or document facts here..."
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end space-x-3 pt-2 border-t ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  Ingest to Knowledge Base
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatView({
  conversations,
  activeChat,
  activeChatId,
  setActiveChatId,
  createNewChat,
  searchQuery,
  setSearchQuery,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isProcessing,
  messagesEndRef,
  currentUser,
  documents,
  isDark,
  selectedAiMode,
  setSelectedAiMode,
  attachedFile,
  setAttachedFile,
  fileInputRef,
  handleFileSelect
}) {
  const groupedConversations = {
    TODAY: conversations.filter((c) => c.timeGroup === 'TODAY'),
    YESTERDAY: conversations.filter((c) => c.timeGroup === 'YESTERDAY')
  };

  const renderFormattedMessage = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const parsedContent = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-extrabold text-blue-600 dark:text-blue-400">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start space-x-2 my-1 pl-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>{parsedContent}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'my-1'}>
          {parsedContent}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Conversations Left Panel */}
      <div className={`w-80 border-r flex flex-col shrink-0 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <h2 className="font-bold text-sm">Conversations</h2>
          <button
            onClick={createNewChat}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New chat</span>
          </button>
        </div>

        <div className={`p-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs placeholder-slate-400 pl-8 pr-3 py-2 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 ${
                isDark ? 'bg-slate-800/80 text-slate-200' : 'bg-slate-100/80 text-slate-800'
              }`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {Object.entries(groupedConversations).map(([group, list]) => {
            if (list.length === 0) return null;
            return (
              <div key={group} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {group}
                </div>
                {list.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveChatId(c.id)}
                    className={`w-full text-left p-3 rounded-xl transition-colors space-y-1 block border ${
                      activeChatId === c.id
                        ? isDark
                          ? 'bg-blue-900/30 border-blue-700/60'
                          : 'bg-blue-50/80 border-blue-200/80'
                        : isDark
                        ? 'hover:bg-slate-800/50 border-transparent'
                        : 'hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeChatId === c.id ? 'text-blue-500' : 'text-slate-400'}`} />
                      <span className={`text-xs font-semibold truncate ${
                        activeChatId === c.id ? (isDark ? 'text-blue-300' : 'text-blue-950') : (isDark ? 'text-slate-200' : 'text-slate-800')
                      }`}>
                        {c.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate pl-5.5">{c.snippet}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 pl-5.5 pt-0.5">
                      <span>{c.timestamp}</span>
                      <span>•</span>
                      <span>{c.msgCount} msg</span>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className={`flex-1 flex flex-col overflow-hidden ${
        isDark ? 'bg-slate-950' : 'bg-slate-50/60'
      }`}>
        {/* Mode Switcher Header */}
        <div className={`h-16 border-b px-6 flex items-center justify-between shrink-0 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <div>
              <h3 className="text-xs font-bold">{activeChat?.title || 'New conversation'}</h3>
              <p className="text-[10px] text-slate-400">
                User Scope: {currentUser.name} ({currentUser.role})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedAiMode('auto')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedAiMode === 'auto'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto-Detect Mode</span>
            </button>

            <button
              onClick={() => setSelectedAiMode('code')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedAiMode === 'code'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Automated Code AI</span>
            </button>

            <button
              onClick={() => setSelectedAiMode('company')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedAiMode === 'company'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Company Work AI</span>
            </button>

            <button
              onClick={() => setSelectedAiMode('general')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedAiMode === 'general'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>General AI</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeChat?.messages.length === 0 ? (
            <div className="max-w-2xl mx-auto pt-8 text-center space-y-6">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mx-auto shadow-2xs">
                <Zap className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Auto-Detect Multi-AI Assistant</h2>
                <p className="text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Type any prompt or attach files! The system will query live database tables, analyze documents, or write code.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left pt-2">
                <button
                  onClick={() => handleSendMessage('SELECT * FROM public.incidents LIMIT 5;')}
                  className={`p-4 border rounded-2xl text-base transition-all shadow-2xs space-y-1 hover:border-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold block text-base flex items-center space-x-1.5">
                    <Database className="w-4 h-4 text-blue-500" />
                    <span>Query Incidents Database</span>
                  </span>
                  <span className="text-xs text-slate-400 block">📊 Auto-Queries Connected SQL Database</span>
                </button>

                <button
                  onClick={() => handleSendMessage('Write a C program for quicksort algorithm.')}
                  className={`p-4 border rounded-2xl text-base transition-all shadow-2xs space-y-1 hover:border-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold block text-base flex items-center space-x-1.5">
                    <Code className="w-4 h-4 text-emerald-500" />
                    <span>Write C Quicksort Program</span>
                  </span>
                  <span className="text-xs text-slate-400 block">🤖 Auto-Detects Code AI (C)</span>
                </button>

                <button
                  onClick={() => handleSendMessage('What is our incident response SLA for P1 critical bugs?')}
                  className={`p-4 border rounded-2xl text-base transition-all shadow-2xs space-y-1 hover:border-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold block text-base">What is our P1 SLA?</span>
                  <span className="text-xs text-slate-400 block">🏢 Auto-Detects Company Work AI</span>
                </button>

                <button
                  onClick={() => fileInputRef?.current?.click()}
                  className={`p-4 border rounded-2xl text-base transition-all shadow-2xs space-y-1 hover:border-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold block text-base flex items-center space-x-1.5">
                    <Paperclip className="w-4 h-4 text-indigo-500" />
                    <span>Attach & Analyze File</span>
                  </span>
                  <span className="text-xs text-slate-400 block">📄 Analyzes PDF, DOC, Code & Text</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-5">
              {activeChat.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-5 text-base sm:text-lg leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs shadow-2xs'
                        : m.accessDenied
                        ? isDark
                          ? 'bg-rose-950/60 border border-rose-800 text-rose-200 rounded-bl-xs shadow-2xs space-y-2'
                          : 'bg-rose-50 border border-rose-200 text-rose-900 rounded-bl-xs shadow-2xs space-y-2'
                        : isDark
                        ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs shadow-2xs space-y-3'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs space-y-3'
                    }`}
                  >
                    {m.sender === 'ai' && m.detectedMode && (
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/40 dark:border-slate-800 text-xs font-semibold text-slate-400">
                        <span className="flex items-center space-x-1.5 text-blue-500">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{m.detectedMode}</span>
                        </span>
                      </div>
                    )}

                    <div className="whitespace-pre-line font-medium text-base sm:text-lg leading-relaxed">
                      {m.sender === 'ai' ? renderFormattedMessage(m.text) : m.text}
                    </div>
                    
                    {m.sources && m.sources.length > 0 && (
                      <div className={`pt-2 border-t text-xs flex items-center space-x-1.5 ${
                        isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                      }`}>
                        <Database className="w-4 h-4 text-blue-500" />
                        <span>Sources:</span>
                        {m.sources.map((src, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded-md font-medium ${
                            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className={`border text-sm p-4 rounded-2xl rounded-bl-xs shadow-2xs flex items-center space-x-3 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Querying database & generating response...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input Dock */}
        <div className={`p-4 border-t shrink-0 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="max-w-3xl mx-auto space-y-2">
            {attachedFile && (
              <div className={`flex items-center justify-between p-2 px-3 rounded-xl border text-xs font-semibold ${
                isDark ? 'bg-blue-950/60 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-4 h-4 text-blue-500" />
                  <span className="truncate max-w-xs">{attachedFile.name}</span>
                  <span className="text-[10px] opacity-60">({attachedFile.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 hover:bg-blue-200/50 dark:hover:bg-blue-900 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="relative flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef?.current?.click()}
                className="absolute left-3.5 text-slate-400 hover:text-blue-500 p-1 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder={attachedFile ? `Ask AI about ${attachedFile.name}...` : `Ask Java/Python/C code, query database, or ask policy...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className={`w-full text-base placeholder-slate-400 pl-12 pr-12 py-3.5 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-800 text-white' : 'bg-slate-100/90 text-slate-800'
                }`}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={(!inputMessage.trim() && !attachedFile) || isProcessing}
                className="absolute right-2.5 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ onLogin, onRegister, userCredentials }) {
  const [authMode, setAuthMode] = useState('signin');
  
  const [email, setEmail] = useState(userCredentials[0].email);
  const [password, setPassword] = useState(userCredentials[0].pass);
  const [showPassword, setShowPassword] = useState(false);
  const [signInError, setSignInError] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Employee');
  const [regDept, setRegDept] = useState('Software Engineering');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [signUpError, setSignUpError] = useState('');

  const handleSelectCred = (cred) => {
    setAuthMode('signin');
    setEmail(cred.email);
    setPassword(cred.pass);
    setSignInError('');
  };

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    const matched = userCredentials.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (matched && password === matched.pass) {
      onLogin(matched);
    } else {
      setSignInError('Invalid credentials. Select a demo account or create a new account.');
    }
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPass.trim()) {
      setSignUpError('Please fill in all required fields.');
      return;
    }
    if (regPass !== regConfirmPass) {
      setSignUpError('Passwords do not match.');
      return;
    }

    const existing = userCredentials.find((c) => c.email.toLowerCase() === regEmail.toLowerCase());
    if (existing) {
      setSignUpError('An account with this company email already exists.');
      return;
    }

    const newAccount = {
      email: regEmail,
      name: regFullName,
      role: regRole,
      dept: regDept,
      avatar: regFullName.split(' ').map((n) => n[0]).join('').toUpperCase(),
      pass: regPass
    };

    onRegister(newAccount);
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 font-sans antialiased overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
            S
          </div>
          <span className="font-bold text-lg tracking-tight">SecureCompanyAI</span>
        </div>

        <div className="space-y-6 max-w-lg z-10">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Your company's private AI, trained on your knowledge.
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Every software company gets a fully isolated workspace. Upload your docs, ask questions, write enterprise code, and get answers — without your data ever touching another company's environment.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
              <div className="p-1.5 bg-white/10 w-fit rounded-lg mb-2">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-xs">Company-Isolated AI</h3>
              <p className="text-[11px] text-blue-100">
                Your documents and conversations never leave your private workspace.
              </p>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
              <div className="p-1.5 bg-white/10 w-fit rounded-lg mb-2">
                <Code className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-xs">Automated Code Generator</h3>
              <p className="text-[11px] text-blue-100">
                Generate clean Java, Python, C, C++, and SQL code automatically.
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-blue-200 flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5" />
          <span>SOC 2 compliant · End-to-end encrypted · GDPR ready</span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-slate-50 p-6 sm:p-12 flex items-center justify-center overflow-y-auto">
        <div className="max-w-md w-full space-y-6">
          <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center space-x-1">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setSignInError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                authMode === 'signin'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setSignUpError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {authMode === 'signin' ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
                <p className="text-sm text-slate-500">Sign in to your company workspace</p>
              </div>

              {signInError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{signInError}</span>
                </div>
              )}

              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Company email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@company.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white placeholder-slate-400 shadow-2xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white pr-10 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
                >
                  Sign in to workspace
                </button>
              </form>

              <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  DEMO ACCOUNTS
                </div>
                <div className="space-y-2">
                  {userCredentials.slice(0, 3).map((cred) => (
                    <div
                      key={cred.email}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs transition-all hover:border-blue-300"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-blue-900">{cred.role}</span>
                        <span className="text-slate-500">{cred.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectCred(cred)}
                        className="flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <Key className="w-3 h-3" />
                        <span>Use</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create an account</h2>
                <p className="text-sm text-slate-500">Register a new enterprise credential profile</p>
              </div>

              {signUpError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{signUpError}</span>
                </div>
              )}

              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white placeholder-slate-400 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Company Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex.morgan@nexlify.io"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white placeholder-slate-400 shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Role Access (RBAC)
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">HR</option>
                      <option value="Support">Support</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineering"
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Create strong password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={regConfirmPass}
                    onChange={(e) => setRegConfirmPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white shadow-2xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Sign In</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsView({ currentUser, setCurrentUser, themeMode, setThemeMode, isDark }) {
  const [profileName, setProfileName] = useState(currentUser.name);
  const [dept, setDept] = useState(currentUser.dept || 'Engineering');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setCurrentUser((prev) => ({
      ...prev,
      name: profileName,
      dept: dept
    }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className={`flex-1 overflow-y-auto p-8 space-y-8 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          SYSTEM PREFERENCES & ACCOUNT
        </div>
        <h1 className="text-2xl font-bold mt-1">Settings & Appearance</h1>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile changes updated successfully!</span>
        </div>
      )}

      <div className={`p-6 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <Sun className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold">Appearance Theme Mode</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
          <button
            type="button"
            onClick={() => setThemeMode('light')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-3 transition-all ${
              themeMode === 'light'
                ? 'border-blue-600 bg-blue-500/10 text-blue-600 font-bold ring-2 ring-blue-500/20'
                : isDark
                ? 'border-slate-800 bg-slate-800/40 text-slate-400'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <Sun className="w-6 h-6" />
            <span className="text-xs">Light Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setThemeMode('dark')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-3 transition-all ${
              themeMode === 'dark'
                ? 'border-blue-500 bg-blue-500/20 text-blue-400 font-bold ring-2 ring-blue-500/20'
                : isDark
                ? 'border-slate-800 bg-slate-800/40 text-slate-400'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <Moon className="w-6 h-6" />
            <span className="text-xs">Dark Mode</span>
          </button>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border space-y-5 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm font-bold">Credential Profile Settings</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
              Full Name
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-hidden ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
              Department
            </label>
            <input
              type="text"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-hidden ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardView({ currentUser, createNewChat, setIsUploadModalOpen, documents, conversations, isDark }) {
  return (
    <div className={`flex-1 overflow-y-auto p-8 space-y-8 ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            NEXLIFY SOFTWARE · PRIVATE WORKSPACE
          </div>
          <h1 className="text-2xl font-bold mt-1">Welcome back, {currentUser.name}</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className={`flex items-center space-x-2 border text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload document</span>
          </button>
          <button
            onClick={createNewChat}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>New chat</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className={`p-5 rounded-2xl border shadow-2xs space-y-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
          <div className="text-2xl font-extrabold">{documents.length}</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">INDEXED DOCUMENTS</div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-2xs space-y-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
          <div className="text-2xl font-extrabold">128</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE CONVERSATIONS</div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-2xs space-y-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
          <div className="text-2xl font-extrabold">1,847</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">QUESTIONS ANSWERED</div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-2xs space-y-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
          <div className="text-2xl font-extrabold">0</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SECURITY LEAKS</div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-2xs space-y-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
          <div className="text-2xl font-extrabold">100%</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">KNOWLEDGE COVERAGE</div>
        </div>
      </div>
    </div>
  );
}

function DocumentsView({ documents, currentUser, setIsUploadModalOpen, isDark }) {
  return (
    <div className={`flex-1 overflow-y-auto p-8 space-y-6 ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Knowledge Base Documents</h1>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New File</span>
        </button>
      </div>

      <div className={`rounded-2xl border shadow-2xs overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b text-[11px] font-bold text-slate-400 uppercase tracking-wider ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'}`}>
              <th className="p-4">Document Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Authorized Roles</th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {documents.map((doc) => (
              <tr key={doc.id} className="p-4">
                <td className="p-4 font-semibold">{doc.name}</td>
                <td className="p-4 text-slate-400">{doc.type}</td>
                <td className="p-4">{doc.roles.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
