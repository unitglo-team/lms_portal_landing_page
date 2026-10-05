import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  BookOpen,
  Bot,
  BarChart3,
  Lock,
  ArrowRight,
  CheckCircle2,
  Download,
  Building,
  GraduationCap,
  Users,
  Compass,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { offlineStorageService, OfflineLessonRecord } from './offlineStorageService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type: 'info' | 'warn' | 'error' } | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Offline Demo State
  const sampleCourseId = 'crs-sales-7045';
  const sampleLessonId = 'lsn-discovery-101';
  const [isOfflineCached, setIsOfflineCached] = useState<boolean>(false);
  const [offlineRecord, setOfflineRecord] = useState<OfflineLessonRecord | null>(null);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        setIsAuthenticated(true);
        const parsed = JSON.parse(storedUser);
        if (parsed.role) {
          const raw = String(parsed.role).toUpperCase();
          if (raw.includes('SUPER')) setUserRole('SUPER_ADMIN');
          else if (raw.includes('ORG') || raw.includes('ADMIN')) setUserRole('ORGANIZATION_ADMIN');
          else if (raw.includes('TRAIN')) setUserRole('TRAINER_MANAGER');
          else if (raw.includes('TEAM') || raw.includes('MANAGE')) setUserRole('TEAM_MANAGER');
          else setUserRole('LEARNER');
        }
      }
    } catch {}

    checkOfflineStatus();
  }, []);

  // Handle mobile drawer body scroll locking
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileNavOpen]);

  const checkOfflineStatus = async () => {
    const cached = await offlineStorageService.isAvailableOffline(sampleCourseId, sampleLessonId);
    setIsOfflineCached(cached);
    const rec = await offlineStorageService.getOfflineRecord(sampleCourseId, sampleLessonId);
    setOfflineRecord(rec);
  };

  const showSecurityNotice = (title: string, message: string, type: 'info' | 'warn' | 'error' = 'info') => {
    setToastMessage({ title, message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getAuthorizedPortalRoute = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/super-admin/dashboard';
      case 'ORGANIZATION_ADMIN':
        return '/organization-admin/dashboard';
      case 'TRAINER_MANAGER':
        return '/trainer-manager/dashboard';
      case 'TEAM_MANAGER':
        return '/team-manager/dashboard';
      case 'LEARNER':
      default:
        return '/learner/dashboard';
    }
  };

  const handleRoleCardClick = (targetRole: string, roleName: string) => {
    if (!isAuthenticated) {
      showSecurityNotice(
        'Authentication Required',
        `Please sign in to verify your authorized entitlements for ${roleName}.`,
        'warn'
      );
      setTimeout(() => navigate('/login'), 1200);
      return;
    }

    if (userRole === 'SUPER_ADMIN' || userRole === targetRole) {
      const dest = getAuthorizedPortalRoute(targetRole);
      navigate(dest);
    } else {
      const authorizedDest = getAuthorizedPortalRoute(userRole || 'LEARNER');
      showSecurityNotice(
        'RBAC Boundary Enforced',
        `Your authenticated role is ${userRole?.replace('_', ' ')}. You are not authorized for ${roleName}. Directing to your authorized portal...`,
        'warn'
      );
      setTimeout(() => navigate(authorizedDest), 1600);
    }
  };

  const handleDownloadDemo = async () => {
    if (isSimulatedOffline) {
      showSecurityNotice('Offline', 'Cannot initiate media downloads while disconnected.', 'error');
      return;
    }

    setDownloadProgress(0);
    try {
      await offlineStorageService.downloadLessonVideo(
        sampleCourseId,
        sampleLessonId,
        'Consultative Selling & Discovery Call Simulation',
        '/sample-video.mp4',
        (pct) => setDownloadProgress(pct)
      );
      showSecurityNotice('Download Complete', 'Course video encrypted with AES-GCM and stored in IndexedDB.', 'info');
      await checkOfflineStatus();
    } catch (e: any) {
      showSecurityNotice('Download Error', e.message || 'Download failed', 'error');
    } finally {
      setDownloadProgress(null);
    }
  };

  const handleRemoveDemo = async () => {
    await offlineStorageService.removeDownload(sampleCourseId, sampleLessonId);
    showSecurityNotice('Removed', 'Encrypted offline package purged.', 'info');
    await checkOfflineStatus();
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f8fafc] flex flex-col font-sans selection:bg-teal-500/20 overflow-x-hidden">
      {/* Security Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-[#18233e] border border-cyan-500/30 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5">
          <AlertCircle className="text-cyan-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-white">{toastMessage.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toastMessage.message}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-md border-b border-[#1e293b] px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3 group text-decoration-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center font-black text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              AI
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">AI LMS Studio</span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-teal-400 block">Enterprise Edition</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#roles" className="hover:text-white transition-colors">Portals</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#lifecycle" className="hover:text-white transition-colors">Progression</a>
            <a href="#offline" className="hover:text-white transition-colors">Offline Learning</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(getAuthorizedPortalRoute(userRole || 'LEARNER'))}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-teal-500/25 cursor-pointer"
              >
                Go to Portal ({userRole?.replace('_', ' ')})
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-teal-500/25 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="md:hidden p-2 rounded-xl bg-[#131d33] border border-[#1e293b] text-slate-300 hover:text-white hover:border-teal-500/40 transition-colors"
            aria-label="Toggle navigation"
            aria-expanded={isMobileNavOpen}
          >
            {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Menu */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#0d1424] border-l border-[#1e293b] p-6 flex flex-col justify-between transform transition-transform duration-300 ease-out md:hidden ${
          isMobileNavOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#1e293b] mb-6">
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">AI LMS Studio</span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-teal-400">Enterprise Edition</span>
            </div>
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="p-1.5 rounded-lg bg-[#18233e] text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <a
              href="#roles"
              onClick={() => setIsMobileNavOpen(false)}
              className="px-3 py-2.5 rounded-xl text-slate-200 hover:bg-[#18233e] hover:text-teal-400 font-semibold text-sm transition-colors"
            >
              Portals
            </a>
            <a
              href="#capabilities"
              onClick={() => setIsMobileNavOpen(false)}
              className="px-3 py-2.5 rounded-xl text-slate-200 hover:bg-[#18233e] hover:text-teal-400 font-semibold text-sm transition-colors"
            >
              Capabilities
            </a>
            <a
              href="#lifecycle"
              onClick={() => setIsMobileNavOpen(false)}
              className="px-3 py-2.5 rounded-xl text-slate-200 hover:bg-[#18233e] hover:text-teal-400 font-semibold text-sm transition-colors"
            >
              Progression
            </a>
            <a
              href="#offline"
              onClick={() => setIsMobileNavOpen(false)}
              className="px-3 py-2.5 rounded-xl text-slate-200 hover:bg-[#18233e] hover:text-teal-400 font-semibold text-sm transition-colors"
            >
              Offline Learning
            </a>
          </nav>
        </div>

        <div className="pt-6 border-t border-[#1e293b]">
          {isAuthenticated ? (
            <button
              onClick={() => {
                setIsMobileNavOpen(false);
                navigate(getAuthorizedPortalRoute(userRole || 'LEARNER'));
              }}
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              Go to Portal ({userRole?.replace('_', ' ')})
            </button>
          ) : (
            <button
              onClick={() => {
                setIsMobileNavOpen(false);
                navigate('/login');
              }}
              className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <section id="top" className="pt-16 md:pt-24 pb-14 px-4 md:px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-400 text-xs font-mono font-bold tracking-wide uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            AI-Powered Learning, Practice & Intelligence
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Turn Learning Into Measurable Skill Growth
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Learn, practice, assess and improve with AI-powered simulations, adaptive learning and measurable performance insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
            <button
              onClick={() => {
                if (isAuthenticated) navigate(getAuthorizedPortalRoute(userRole || 'LEARNER'));
                else navigate('/login');
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
            >
              <span>{isAuthenticated ? 'Enter Workspace' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
            <a
              href="#capabilities"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#131d33] hover:bg-[#18233e] active:scale-95 border border-[#1e293b] hover:border-slate-600 text-slate-200 font-bold text-sm transition-all text-center"
            >
              Explore Platform
            </a>
          </div>

          <div className="pt-10 flex items-center justify-center gap-4 sm:gap-8 flex-wrap text-xs text-slate-400 font-mono border-t border-slate-800/80">
            <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-teal-400" /> Multi-Tenant Isolation</span>
            <span className="flex items-center gap-1.5"><Lock size={15} className="text-teal-400" /> Role-Based Access Control</span>
            <span className="flex items-center gap-1.5"><Download size={15} className="text-teal-400" /> Encrypted Offline Storage</span>
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section id="roles" className="py-16 px-4 md:px-6 bg-[#0f172a]/40 border-y border-[#1e293b]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-teal-400">Role Entry</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Role-Based Platform Entry</h2>
            <p className="text-xs sm:text-sm text-slate-400">Dedicated enterprise portals tailored for governance, curriculum authoring, team tracking, and interactive simulation practice.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Org Admin */}
            <div className="p-6 rounded-2xl bg-[#131d33] border border-[#1e293b] flex flex-col justify-between hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-200 shadow-md">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Building size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Governance</span>
                  <h3 className="text-lg font-bold text-white">Organization Admin</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed min-h-[3.5rem]">
                  Govern learning, users, content, assignments, compliance and organization-wide intelligence.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={() => handleRoleCardClick('ORGANIZATION_ADMIN', 'Organization Admin Portal')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#18233e] hover:bg-teal-500 hover:text-white border border-[#1e293b] text-xs font-bold text-slate-200 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>Organization Admin Portal</span>
                  <ArrowRight size={14} />
                </button>
                <span className="block text-[10px] text-slate-500 text-center font-mono mt-1.5">RBAC Protected • Multi-Tenant Enforced</span>
              </div>
            </div>

            {/* Trainer Manager */}
            <div className="p-6 rounded-2xl bg-[#131d33] border border-[#1e293b] flex flex-col justify-between hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-200 shadow-md">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <BookOpen size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Curriculum & AI</span>
                  <h3 className="text-lg font-bold text-white">Trainer Manager</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed min-h-[3.5rem]">
                  Create courses, lessons, assessments, AI personas, scenarios and simulations.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={() => handleRoleCardClick('TRAINER_MANAGER', 'Trainer Manager Portal')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#18233e] hover:bg-teal-500 hover:text-white border border-[#1e293b] text-xs font-bold text-slate-200 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>Trainer Manager Portal</span>
                  <ArrowRight size={14} />
                </button>
                <span className="block text-[10px] text-slate-500 text-center font-mono mt-1.5">Authoring & Governance Workflow</span>
              </div>
            </div>

            {/* Team Manager */}
            <div className="p-6 rounded-2xl bg-[#131d33] border border-[#1e293b] flex flex-col justify-between hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-200 shadow-md">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Users size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Supervision</span>
                  <h3 className="text-lg font-bold text-white">Team Manager</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed min-h-[3.5rem]">
                  Assign learning, monitor team progress and support learner development.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={() => handleRoleCardClick('TEAM_MANAGER', 'Team Manager Portal')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#18233e] hover:bg-teal-500 hover:text-white border border-[#1e293b] text-xs font-bold text-slate-200 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>Team Manager Portal</span>
                  <ArrowRight size={14} />
                </button>
                <span className="block text-[10px] text-slate-500 text-center font-mono mt-1.5">Team Cohort Analytics & Assign</span>
              </div>
            </div>

            {/* Learner */}
            <div className="p-6 rounded-2xl bg-[#131d33] border border-[#1e293b] flex flex-col justify-between hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-200 shadow-md">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Learning & Practice</span>
                  <h3 className="text-lg font-bold text-white">Learner</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed min-h-[3.5rem]">
                  Learn, practice with AI, complete assessments and track skill growth.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={() => handleRoleCardClick('LEARNER', 'Learner Portal')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#18233e] hover:bg-teal-500 hover:text-white border border-[#1e293b] text-xs font-bold text-slate-200 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>Learner Portal</span>
                  <ArrowRight size={14} />
                </button>
                <span className="block text-[10px] text-slate-500 text-center font-mono mt-1.5">Simulation Hub & Certification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-teal-400">Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Capabilities</h2>
            <p className="text-xs sm:text-sm text-slate-400">Comprehensive enterprise learning infrastructure.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#131d33] border border-[#1e293b] space-y-4 hover:border-teal-500/30 transition-all">
              <div className="flex items-center gap-2 pb-3 border-b border-[#1e293b]">
                <BookOpen size={18} className="text-teal-400" />
                <h3 className="font-bold text-white text-sm">Learning</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-teal-400 shrink-0" /> Courses & Curriculum</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-teal-400 shrink-0" /> Modular Video & Text Lessons</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-teal-400 shrink-0" /> Structured Learning Paths</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-teal-400 shrink-0" /> Theory & Knowledge Assessments</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#131d33] border border-[#1e293b] space-y-4 hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-2 pb-3 border-b border-[#1e293b]">
                <Bot size={18} className="text-indigo-400" />
                <h3 className="font-bold text-white text-sm">AI Practice</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-indigo-400 shrink-0" /> AI Behavioral Personas</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-indigo-400 shrink-0" /> Dynamic Branching Scenarios</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-indigo-400 shrink-0" /> Interactive AI Customer Simulations</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-indigo-400 shrink-0" /> Voice & Video Practice Sessions</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#131d33] border border-[#1e293b] space-y-4 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-2 pb-3 border-b border-[#1e293b]">
                <BarChart3 size={18} className="text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Intelligence</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-cyan-400 shrink-0" /> Automated Matrix Evaluation</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-cyan-400 shrink-0" /> Communication Analytics</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-cyan-400 shrink-0" /> Skill Gap & Radar Diagnostics</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-cyan-400 shrink-0" /> Adaptive Learning Progression</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#131d33] border border-[#1e293b] space-y-4 hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-2 pb-3 border-b border-[#1e293b]">
                <ShieldCheck size={18} className="text-amber-400" />
                <h3 className="font-bold text-white text-sm">Governance</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-amber-400 shrink-0" /> Organization Governance</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-amber-400 shrink-0" /> Content Review & Approvals</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-amber-400 shrink-0" /> Mandatory Assignments</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-amber-400 shrink-0" /> Audit Logs & PDF Certificates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle Flow */}
      <section id="lifecycle" className="py-16 px-4 md:px-6 bg-[#0f172a]/30 border-t border-[#1e293b]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-teal-400">Value Chain</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Systematic Mastery Lifecycle</h2>
            <p className="text-xs sm:text-sm text-slate-400">Seamless coordination from enterprise governance to individual mastery.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[#131d33] border border-[#1e293b]">
              <span className="text-[10px] font-mono text-teal-400 font-bold block">STAGE 1</span>
              <span className="font-bold text-white text-sm block">Organization Admin</span>
              <span className="text-cyan-400 block my-1">↓</span>
              <span className="text-xs text-slate-400">Govern & Assign</span>
            </div>
            <div className="p-4 rounded-xl bg-[#131d33] border border-[#1e293b]">
              <span className="text-[10px] font-mono text-teal-400 font-bold block">STAGE 2</span>
              <span className="font-bold text-white text-sm block">Trainer Manager</span>
              <span className="text-cyan-400 block my-1">↓</span>
              <span className="text-xs text-slate-400">Create & Author</span>
            </div>
            <div className="p-4 rounded-xl bg-[#131d33] border border-[#1e293b]">
              <span className="text-[10px] font-mono text-teal-400 font-bold block">STAGE 3</span>
              <span className="font-bold text-white text-sm block">Team Manager</span>
              <span className="text-cyan-400 block my-1">↓</span>
              <span className="text-xs text-slate-400">Guide & Monitor</span>
            </div>
            <div className="p-4 rounded-xl bg-[#131d33] border border-[#1e293b]">
              <span className="text-[10px] font-mono text-teal-400 font-bold block">STAGE 4</span>
              <span className="font-bold text-white text-sm block">Learner</span>
              <span className="text-cyan-400 block my-1">↓</span>
              <span className="text-xs text-slate-400">Learn & Practice</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#131d33] border border-[#1e293b] text-center">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-4">
              Phase 2–9 Execution Pipeline
            </span>
            <div className="flex items-center justify-center flex-wrap gap-2 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-lg bg-[#18233e] text-slate-300">Learning</span>
              <span className="text-slate-600 hidden sm:inline">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-[#18233e] text-slate-300">Practice</span>
              <span className="text-slate-600 hidden sm:inline">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-[#18233e] text-slate-300">Assessment</span>
              <span className="text-slate-600 hidden sm:inline">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-[#18233e] text-slate-300">AI Simulation</span>
              <span className="text-slate-600 hidden sm:inline">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-[#18233e] text-slate-300">Evaluation</span>
              <span className="text-slate-600 hidden sm:inline">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-[#18233e] text-slate-300">Skill Gap</span>
              <span className="text-slate-600 hidden sm:inline">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-[#18233e] text-slate-300">Adaptive Practice</span>
              <span className="text-slate-600 hidden sm:inline">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm">Mastery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Offline Learning Section */}
      <section id="offline" className="py-16 px-4 md:px-6 border-t border-[#1e293b]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-teal-400">Security Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Encrypted Offline Learning</h2>
            <p className="text-xs sm:text-sm text-slate-400">Authorized learners can access lecture videos offline without exposing raw media storage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#131d33] border border-[#1e293b] space-y-2 hover:border-teal-500/30 transition-all">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck size={16} className="text-teal-400" /> No Public Media URLs
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Short-lived 15-minute license tokens prevent permanent download exposure and third-party scraping.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#131d33] border border-[#1e293b] space-y-2 hover:border-teal-500/30 transition-all">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Lock size={16} className="text-teal-400" /> AES-GCM Encrypted at Rest
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Local blobs in IndexedDB are encrypted with 256-bit AES-GCM tied to the learner's tenant and device session.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#131d33] border border-[#1e293b] space-y-2 hover:border-teal-500/30 transition-all">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Compass size={16} className="text-teal-400" /> Hardware DRM Pluggable
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clean media manager abstraction enables seamless integration with Widevine and FairPlay CDM when required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 px-4 md:px-8 bg-[#060910] border-t border-[#1e293b]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
              AI
            </div>
            <div>
              <div className="font-bold text-sm text-white">AI LMS Studio</div>
              <div className="text-[11px] text-slate-500">Enterprise Learning, Simulation & Workforce Intelligence OS</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 flex-wrap justify-center">
            <a href="#roles" className="hover:text-teal-400 transition-colors">Portals</a>
            <a href="#capabilities" className="hover:text-teal-400 transition-colors">Capabilities</a>
            <a href="#lifecycle" className="hover:text-teal-400 transition-colors">Mastery Architecture</a>
            <a href="#offline" className="hover:text-teal-400 transition-colors">Offline Security</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 text-center text-xs text-slate-500">
          &copy; 2026 AI LMS Studio. Multi-Tenant Isolated. All Rights Reserved. Built on existing Phase 2–9 Enterprise Architecture.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
