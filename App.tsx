
import React, { useState, useMemo } from 'react';
import { UserData, EmploymentType, FeasibilityResult, BankProduct } from './types';
import { evaluateFeasibility, calculateMonthlyPayment } from './utils/math';
import { BENCHMARKS_2026, BANK_PROFILES } from './constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MessageCircle, Phone, User, ArrowLeft, X } from 'lucide-react';

// --- Components ---

const Modal: React.FC<{ title: string; isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto text-sm text-slate-600 leading-relaxed space-y-4">
          {children}
        </div>
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-indigo-700 transition-all"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{ setView: (v: 'simulator' | 'contacts') => void; currentView: string }> = ({ setView, currentView }) => (
  <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50 shadow-sm">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('simulator')}>
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
            Bancometro<span className="text-indigo-600">.it</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Analisi Creditizia Personale</p>
        </div>
      </div>
      <div className="hidden md:flex gap-8 items-center">
        <nav className="flex gap-6">
          <button
            onClick={() => setView('simulator')}
            className={`text-xs font-black uppercase tracking-widest transition-colors ${currentView === 'simulator' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Simulatore
          </button>
          <button
            onClick={() => setView('contacts')}
            className={`text-xs font-black uppercase tracking-widest transition-colors ${currentView === 'contacts' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Contatti
          </button>
        </nav>
        <div className="h-8 w-px bg-slate-200"></div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Target Rate 2026</span>
          <span className="text-sm font-bold text-indigo-600">3.20% Fixed</span>
        </div>
        <button
          onClick={() => setView('contacts')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-100 uppercase tracking-wider"
        >
          Richiedi Consulenza
        </button>
      </div>
    </div>
  </header>
);

const InputField: React.FC<{ label: string; value: number; onChange: (v: number) => void; suffix?: string; min?: number; max?: number; step?: number }> = ({ label, value, onChange, suffix, min, max, step = 1 }) => (
  <div className="mb-6">
    <div className="flex justify-between mb-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <span className="text-sm font-bold text-slate-900 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100">{value.toLocaleString('it-IT')}{suffix}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
    />
  </div>
);

const StatusBadge: React.FC<{ status: FeasibilityResult['status'] }> = ({ status }) => {
  const styles = {
    GREEN: 'bg-indigo-500 text-white border-indigo-600',
    YELLOW: 'bg-amber-400 text-white border-amber-500',
    RED: 'bg-rose-500 text-white border-rose-600',
  };
  const labels = {
    GREEN: 'PROFILO ECCELLENTE',
    YELLOW: 'PROFILO DA RIVEDERE',
    RED: 'PROFILO CRITICO'
  };

  return (
    <div className={`px-6 py-2.5 rounded-full shadow-lg text-xs font-black tracking-widest inline-flex items-center gap-3 border-b-4 ${styles[status]}`}>
      <span className={`w-2 h-2 rounded-full bg-white ${status === 'GREEN' || status === 'RED' || status === 'YELLOW' ? 'animate-pulse' : ''}`}></span>
      {labels[status]}
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'simulator' | 'contacts'>('simulator');
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'transparency' | null>(null);
  const [userData, setUserData] = useState<UserData>({
    price: 150000,
    loanAmount: 100000,
    durationYears: 30,
    monthlyNetIncome: 2000,
    otherLoans: 0,
    age: 30,
    dependents: 0,
    employmentType: EmploymentType.INDETERMINATO,
    isUnder36: true,
    interestRate: BENCHMARKS_2026.FIXED_RATE * 100,
  });

  const feasibility = useMemo(() => evaluateFeasibility(userData), [userData]);

  const bankComparison = useMemo((): BankProduct[] => {
    return BANK_PROFILES.map(bank => {
      const rate = BENCHMARKS_2026.FIXED_RATE + bank.spreadAdj;
      const payment = calculateMonthlyPayment(userData.loanAmount, rate, userData.durationYears);
      return {
        name: bank.name,
        tan: rate * 100,
        taeg: (rate + 0.002) * 100,
        monthlyPayment: payment,
        totalCost: payment * userData.durationYears * 12,
        logo: bank.logo,
      };
    });
  }, [userData]);

  const chartData = [
    { name: 'Rata Mensile', value: Math.round(feasibility.monthlyPayment), fill: '#4f46e5' },
    { name: 'Altri Debiti', value: userData.otherLoans, fill: '#94a3b8' },
    { name: 'Reddito Libero', value: Math.max(0, userData.monthlyNetIncome - feasibility.monthlyPayment - userData.otherLoans), fill: '#818cf8' },
  ];

  const generateWhatsAppLink = (phone: string) => {
    const message = `Ciao vorrei essere contattato per maggiori info. Il mio nome è ...
Riepilogo simulazione Bancometro.it:
- Prezzo Immobile: €${userData.price.toLocaleString('it-IT')}
- Importo Mutuo: €${userData.loanAmount.toLocaleString('it-IT')}
- Durata: ${userData.durationYears} anni
- Rata Mensile: €${Math.round(feasibility.monthlyPayment).toLocaleString('it-IT')}
- DTI: ${(feasibility.dti * 100).toFixed(0)}%
- LTV: ${(feasibility.ltv * 100).toFixed(0)}%`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header setView={setView} currentView={view} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {view === 'simulator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: INPUTS */}
            <section className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
                <h2 className="text-sm font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-[0.15em] border-l-4 border-indigo-600 pl-4">
                  Configuratore Mutuo
                </h2>

                <InputField
                  label="Costo Immobile"
                  value={userData.price}
                  onChange={(v) => setUserData(prev => ({ ...prev, price: v, loanAmount: Math.round(v * 0.8) }))}
                  suffix=" €"
                  min={50000}
                  max={1000000}
                  step={5000}
                />

                <InputField
                  label="Finanziamento"
                  value={userData.loanAmount}
                  onChange={(v) => setUserData(prev => ({ ...prev, loanAmount: v }))}
                  suffix=" €"
                  min={30000}
                  max={userData.price}
                  step={5000}
                />

                <InputField
                  label="Anni di ammortamento"
                  value={userData.durationYears}
                  onChange={(v) => setUserData(prev => ({ ...prev, durationYears: v }))}
                  suffix=" anni"
                  min={5}
                  max={30}
                />

                <InputField
                  label="Tasso di Interesse (TAN)"
                  value={userData.interestRate}
                  onChange={(v) => setUserData(prev => ({ ...prev, interestRate: v }))}
                  suffix=" %"
                  min={0.1}
                  max={10}
                  step={0.05}
                />

                <InputField
                  label="Entrate Mensili Nette"
                  value={userData.monthlyNetIncome}
                  onChange={(v) => setUserData(prev => ({ ...prev, monthlyNetIncome: v }))}
                  suffix=" €"
                  min={800}
                  max={15000}
                  step={50}
                />

                <InputField
                  label="Uscite per altri Prestiti"
                  value={userData.otherLoans}
                  onChange={(v) => setUserData(prev => ({ ...prev, otherLoans: v }))}
                  suffix=" €"
                  min={0}
                  max={3000}
                  step={10}
                />

                <div className="grid grid-cols-2 gap-6 mb-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Età Richiedente</label>
                      <input
                        type="number"
                        value={userData.age}
                        onChange={(e) => setUserData(prev => ({ ...prev, age: Number(e.target.value) }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Persone a carico</label>
                      <input
                        type="number"
                        value={userData.dependents}
                        onChange={(e) => setUserData(prev => ({ ...prev, dependents: Number(e.target.value) }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                   </div>
                </div>

                <div className="mb-8">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Situazione Lavorativa</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                    value={userData.employmentType}
                    onChange={(e) => setUserData(prev => ({ ...prev, employmentType: e.target.value as EmploymentType }))}
                  >
                    {Object.values(EmploymentType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-4 cursor-pointer group bg-indigo-600 p-5 rounded-2xl shadow-xl shadow-indigo-200">
                  <input
                    type="checkbox"
                    checked={userData.isUnder36}
                    onChange={(e) => setUserData(prev => ({ ...prev, isUnder36: e.target.checked }))}
                    className="w-6 h-6 rounded-lg border-indigo-400 text-white focus:ring-indigo-500 bg-indigo-700"
                  />
                  <div>
                    <span className="text-xs font-black text-white uppercase tracking-tighter block">Bonus Under 36</span>
                    <span className="text-[9px] text-indigo-200 font-bold uppercase tracking-widest">Garanzia CONSAP Inclusa</span>
                  </div>
                </label>
              </div>
            </section>

            {/* RIGHT: RESULTS */}
            <section className="lg:col-span-8 space-y-8">

              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Esito Simulazione Bancometro.it</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Calcolo istantaneo sostenibilità creditizia</p>
                  </div>
                  <StatusBadge status={feasibility.status} />
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 bg-slate-50 rounded-2xl text-center border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Impegno Mensile</p>
                      <p className="text-4xl font-black text-indigo-600">€{Math.round(feasibility.monthlyPayment).toLocaleString('it-IT')}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl text-center border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Peso Reddituale</p>
                      <p className={`text-4xl font-black ${(feasibility.dti * 100) > 33 ? 'text-rose-500' : 'text-slate-800'}`}>{(feasibility.dti * 100).toFixed(0)}%</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl text-center border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Indice LTV</p>
                      <p className={`text-4xl font-black ${feasibility.ltv > 0.8 ? 'text-amber-500' : 'text-slate-800'}`}>{(feasibility.ltv * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-slate-800 mb-6 uppercase tracking-[0.2em] flex items-start gap-2">
                        <span className="w-8 h-1 bg-indigo-600 rounded-full mt-1.5"></span>
                        <span>Analisi di<br/>Sostenibilità</span>
                      </h3>
                      <div className={`flex gap-4 p-5 rounded-2xl border ${
                        feasibility.status === 'RED' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                        feasibility.status === 'YELLOW' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                        'bg-indigo-50 border-indigo-100 text-indigo-800'
                      }`}>
                        <div className="mt-1">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                          {feasibility.messages.map((msg, i) => (
                            <span key={i} className="text-sm font-bold leading-relaxed">{msg}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 h-80 relative shadow-inner border border-slate-50">
                       <h3 className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em] text-center">Breakdown Budget Mensile</h3>
                       <ResponsiveContainer width="100%" height="90%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={90}
                              paddingAngle={10}
                              dataKey="value"
                              stroke="none"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                              itemStyle={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#1e293b' }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              formatter={(value) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{value}</span>}
                            />
                          </PieChart>
                       </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>


              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-indigo-300">
                <div className="text-center md:text-left space-y-2">
                  <h3 className="text-3xl font-black text-white tracking-tighter">Puntiamo alla delibera?</h3>
                  <p className="text-indigo-100 text-sm font-medium">I consulenti Bancometro.it analizzano gratuitamente la tua richiesta di mutuo</p>
                </div>
                <button
                  onClick={() => setView('contacts')}
                  className="bg-white text-indigo-700 font-black px-10 py-5 rounded-2xl shadow-xl hover:bg-indigo-50 hover:scale-105 active:scale-100 transition-all uppercase tracking-widest text-xs"
                >
                  SBLOCCA IL TUO MUTUO
                </button>
              </div>

            </section>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-12">
            <button
              onClick={() => setView('simulator')}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black uppercase tracking-widest text-xs mb-12 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Torna al Simulatore
            </button>

            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">I Nostri Esperti</h2>
              <p className="text-slate-500 font-medium">Scegli un consulente per ricevere assistenza personalizzata su WhatsApp.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  name: 'Mario SORICE',
                  phone: '3933364925',
                  role: 'Resp.le Analisi Crediti',
                  icon: 'https://img.icons8.com/color/200/businessman.png'
                },
                {
                  name: 'Daniela RUGGIERO',
                  phone: '3496753212',
                  role: 'Specialista Mutui e Prestiti',
                  icon: 'https://img.icons8.com/color/200/businesswoman.png'
                }
              ].map((contact, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col items-center text-center group hover:border-indigo-500 transition-all">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-inner group-hover:bg-indigo-50 transition-colors overflow-hidden">
                    <img
                      src={contact.icon}
                      alt={contact.name}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">{contact.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{contact.role}</p>

                  <div className="flex flex-col gap-3 w-full">
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl transition-all border border-slate-100"
                    >
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </a>
                    <a
                      href={generateWhatsAppLink(contact.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-100"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Esito Mutuo su WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 p-8 bg-indigo-50 rounded-3xl border border-indigo-100 text-center flex flex-col items-center gap-6">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-inner border-4 border-white overflow-hidden">
                <img
                  src="https://img.icons8.com/color/200/businessman.png"
                  alt="Consulente Bancometro"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <p className="text-indigo-800 font-bold text-sm">
                I nostri consulenti sono disponibili<br/>
                tutti i giorni dal Lunedì al Venerdì,<br/>
                dalle 09:00 alle 20:00.<br/>
                Chiama!!! E' gratuito e puoi risparmare.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white py-16 px-6 mt-12 text-center border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-[0.4em]">Bancometro<span className="text-indigo-600">.it</span> <span className="text-slate-400">2026</span></h2>
            <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
          </div>
          <p className="text-[10px] text-slate-400 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest font-bold">
            Simulazione effettuata su basi statistiche 2026. Bancometro.it non è un intermediario finanziario.
            Le informazioni fornite non costituiscono consulenza finanziaria personalizzata.
            L'approvazione finale è soggetta a perizia tecnica e valutazione del merito creditizio.
          </p>
          <div className="flex justify-center gap-6 text-slate-300 text-[9px] font-black uppercase tracking-widest">
            <button onClick={() => setActiveModal('privacy')} className="hover:text-indigo-600 transition-colors cursor-pointer">Privacy Policy</button>
            <span>/</span>
            <button onClick={() => setActiveModal('terms')} className="hover:text-indigo-600 transition-colors cursor-pointer">Termini & Servizi</button>
            <span>/</span>
            <button onClick={() => setActiveModal('transparency')} className="hover:text-indigo-600 transition-colors cursor-pointer">Trasparenza</button>
          </div>
        </div>
      </footer>

      <Modal
        title="Privacy Policy"
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
      >
        <p className="font-bold text-slate-800">Informativa sul trattamento dei dati</p>
        <p>Bancometro.it rispetta la tua privacy. I dati inseriti nel simulatore (reddito, età, importo mutuo) vengono utilizzati esclusivamente per generare il calcolo in tempo reale e non vengono memorizzati in database permanenti a meno che non venga esplicitamente richiesta una consulenza.</p>
        <p>In caso di contatto tramite WhatsApp, i dati verranno trattati dai nostri consulenti nel rispetto del GDPR per la sola finalità di assistenza creditizia.</p>
      </Modal>

      <Modal
        title="Termini & Servizi"
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
      >
        <p className="font-bold text-slate-800">Condizioni d'uso del servizio</p>
        <p>Bancometro.it è uno strumento gratuito e puramente informativo. I risultati della simulazione sono basati su algoritmi statistici e dati di mercato aggiornati al 2026.</p>
        <p><strong>Importante:</strong> Il simulatore non costituisce una consulenza finanziaria personalizzata, né una proposta contrattuale o un'offerta di credito. L'esito della simulazione non garantisce l'effettiva erogazione del mutuo, che resta subordinata alla valutazione discrezionale dell'istituto bancario erogante.</p>
        <p>L'utente riconosce che l'utilizzo dello strumento avviene sotto la propria responsabilità e che Bancometro.it non risponde di eventuali discrepanze tra la simulazione e l'offerta reale della banca.</p>
      </Modal>

      <Modal
        title="Trasparenza"
        isOpen={activeModal === 'transparency'}
        onClose={() => setActiveModal(null)}
      >
        <p className="font-bold text-slate-800">Trasparenza e Metodologia</p>
        <p>I tassi di interesse utilizzati (TAN 3.20% Fixed) rappresentano i benchmark medi previsti per l'anno 2026. I calcoli includono una stima del TAEG basata su costi medi di istruttoria e perizia.</p>
        <p>Il calcolo della sostenibilità (DTI) segue le linee guida bancarie standard, considerando un impegno massimo del 33% del reddito netto mensile. La valutazione LTV (Loan to Value) tiene conto delle agevolazioni previste per i giovani Under 36 (Fondo di Garanzia CONSAP).</p>
      </Modal>
    </div>
  );
};

export default App;
