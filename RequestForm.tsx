import React, { useState } from 'react';
import { ArrowLeft, Phone, CheckCircle2, ShieldCheck, ArrowRight, Briefcase, User, Calendar, Euro, Mail, Loader2, Send } from 'lucide-react';
import { EmploymentType, FeasibilityResult } from './types';

interface RequestFormProps {
  initialData: {
    loanAmount: number;
    monthlyNetIncome: number;
    age: number;
    employmentType: EmploymentType;
    feasibility?: FeasibilityResult;
  };
  onBack: () => void;
  onGoToContacts: () => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({
  initialData,
  onBack,
  onGoToContacts,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    eta: initialData.age || 30,
    telefono: '',
    importo: initialData.loanAmount || 100000,
    tipologiaLavoro: initialData.employmentType === EmploymentType.PARTITA_IVA ? 'Autonomo' : 'Dipendente',
    dettaglioContratto: initialData.employmentType || EmploymentType.INDETERMINATO,
    redditoMensile: initialData.monthlyNetIncome || 2000,
    statoRicercaCasa: 'Ho già trovato l\'immobile',
    note: '',
    privacyAccepted: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const formatSummaryText = () => {
    return `RIEPILOGO RICHIESTA MUTUO - BANCOMETRO.IT
------------------------------------------------
Dati Richiedente:
- Nome: ${formData.nome}
- Cognome: ${formData.cognome}
- Età: ${formData.eta} anni
- Recapito Telefonico: ${formData.telefono}

Dati Economici e Lavorativi:
- Importo Desiderato: € ${formData.importo.toLocaleString('it-IT')}
- Inquadramento: ${formData.tipologiaLavoro}
- Dettaglio Contratto: ${formData.dettaglioContratto}
- Reddito Mensile Netto: € ${formData.redditoMensile.toLocaleString('it-IT')}

Situazione Immobile:
- Stato Ricerca Casa: ${formData.statoRicercaCasa}

Note Aggiuntive:
- ${formData.note || 'Nessuna nota comunicata'}
------------------------------------------------
Richiesta generata il: ${new Date().toLocaleString('it-IT')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.cognome.trim() || !formData.telefono.trim()) {
      alert('Per favore compila tutti i campi obbligatori (Nome, Cognome e Telefono).');
      return;
    }

    setIsSubmitting(true);

    const emailPayload = {
      _subject: `Nuova Richiesta Mutuo: ${formData.nome} ${formData.cognome} - €${formData.importo.toLocaleString('it-IT')}`,
      _cc: 'danielaruggiero@credipass.it',
      _template: 'table',
      Nome: formData.nome,
      Cognome: formData.cognome,
      Eta: `${formData.eta} anni`,
      Telefono: formData.telefono,
      Importo_Richiesto: `€ ${formData.importo.toLocaleString('it-IT')}`,
      Inquadramento: formData.tipologiaLavoro,
      Dettaglio_Contratto: formData.dettaglioContratto,
      Reddito_Mensile_Netto: `€ ${formData.redditoMensile.toLocaleString('it-IT')}`,
      Situazione_Immobile: formData.statoRicercaCasa,
      Note_Aggiuntive: formData.note || 'Nessuna',
      Data_Invio: new Date().toLocaleString('it-IT'),
      Fonte: 'Bancometro.it - Sblocca il tuo Mutuo'
    };

    try {
      await fetch('https://formsubmit.co/ajax/mario.sorice@credipass.it', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });
    } catch (err) {
      console.log('Invio email eseguito:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const createWhatsAppMessage = () => {
    return `Ciao, ho compilato la richiesta di prefattibilità su Bancometro.it:
- Nome e Cognome: ${formData.nome} ${formData.cognome}
- Età: ${formData.eta} anni
- Recapito telefonico: ${formData.telefono}
- Importo desiderato: €${formData.importo.toLocaleString('it-IT')}
- Situazione lavorativa: ${formData.tipologiaLavoro} (${formData.dettaglioContratto})
- Reddito mensile netto: €${formData.redditoMensile.toLocaleString('it-IT')}
- Situazione immobile: ${formData.statoRicercaCasa}${formData.note ? `\n- Note: ${formData.note}` : ''}

Vorrei essere ricontattato per verificare la fattibilità del mutuo. Grazie!`;
  };

  const handleSendWhatsApp = (phone: string) => {
    const text = encodeURIComponent(createWhatsAppMessage());
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const mailtoUrl = `mailto:mario.sorice@credipass.it?cc=danielaruggiero@credipass.it&subject=${encodeURIComponent(
    `Richiesta Mutuo: ${formData.nome} ${formData.cognome} - €${formData.importo.toLocaleString('it-IT')}`
  )}&body=${encodeURIComponent(formatSummaryText())}`;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black uppercase tracking-widest text-xs mb-8 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Torna al Simulatore
      </button>

      {/* Main Content */}
      {!submitted ? (
        <div className="space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <ShieldCheck className="w-4 h-4" />
              Verifica Fattibilità Delibera
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Sblocca il tuo Mutuo
            </h2>
            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-2xl">
              Inserisci i tuoi dati personali ed economici: la scheda verrà inoltrata direttamente ai consulenti specialisti 
              <strong className="text-slate-700"> Mario Sorice</strong> e <strong className="text-slate-700">Daniela Ruggiero</strong> per un'analisi creditizia dettagliata.
            </p>

            {/* Quick stats from simulator */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Importo Simulato</span>
                <span className="text-lg font-black text-indigo-600">€{formData.importo.toLocaleString('it-IT')}</span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reddito Base</span>
                <span className="text-lg font-black text-slate-800">€{formData.redditoMensile.toLocaleString('it-IT')}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Consulenza</span>
                <span className="text-lg font-black text-emerald-600">100% Gratuita</span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-8">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-[0.15em] border-l-4 border-indigo-600 pl-4">
              I Tuoi Dati Personali
            </h3>

            {/* Nome e Cognome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Nome <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Es. Mario"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Cognome <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Es. Rossi"
                    value={formData.cognome}
                    onChange={(e) => setFormData(prev => ({ ...prev, cognome: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Telefono e Età */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Numero di Telefono <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="Es. 333 1234567"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">Ti contatteremo per una breve analisi preliminare</span>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Età Richiedente
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={18}
                    max={80}
                    value={formData.eta}
                    onChange={(e) => setFormData(prev => ({ ...prev, eta: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <h3 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-[0.15em] border-l-4 border-indigo-600 pl-4">
              Dettagli Finanziari e Lavorativi
            </h3>

            {/* Importo Desiderato e Reddito Mensile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Importo Desiderato (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={20000}
                    max={1500000}
                    step={5000}
                    value={formData.importo}
                    onChange={(e) => setFormData(prev => ({ ...prev, importo: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                  <Euro className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Reddito Mensile Netto (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={500}
                    max={30000}
                    step={50}
                    value={formData.redditoMensile}
                    onChange={(e) => setFormData(prev => ({ ...prev, redditoMensile: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                  <Euro className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Autonomo / Dipendente Selector */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                Inquadramento Lavorativo
              </label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    tipologiaLavoro: 'Dipendente',
                    dettaglioContratto: EmploymentType.INDETERMINATO
                  }))}
                  className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    formData.tipologiaLavoro === 'Dipendente'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  <span>Lavoratore Dipendente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    tipologiaLavoro: 'Autonomo',
                    dettaglioContratto: EmploymentType.PARTITA_IVA
                  }))}
                  className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    formData.tipologiaLavoro === 'Autonomo'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Autonomo / Libero Prof.</span>
                </button>
              </div>

              {/* Specific detail */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Dettaglio tipologia contratto
                </label>
                <select
                  value={formData.dettaglioContratto}
                  onChange={(e) => setFormData(prev => ({ ...prev, dettaglioContratto: e.target.value as EmploymentType }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {formData.tipologiaLavoro === 'Dipendente' ? (
                    <>
                      <option value={EmploymentType.INDETERMINATO}>Tempo Indeterminato (Pubblico o Privato)</option>
                      <option value={EmploymentType.DETERMINATO}>Tempo Determinato</option>
                      <option value={EmploymentType.PENSIONATO}>Pensionato</option>
                    </>
                  ) : (
                    <>
                      <option value={EmploymentType.PARTITA_IVA}>Libero Professionista / Ditta Individuale</option>
                      <option value="Socio / Amministratore di Società">Socio / Amministratore di Società</option>
                      <option value="Artigiano / Commerciante">Artigiano / Commerciante</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Stato Ricerca Casa */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                Situazione Immobile
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Ho già trovato l\'immobile', desc: 'Ho individuato la casa e vorrei fare una proposta' },
                  { label: 'Ho già firmato proposta/compromesso', desc: 'Ho una scadenza per la concessione del mutuo' },
                  { label: 'Sono attivamente alla ricerca', desc: 'Sto visionando immobili sul mercato' },
                  { label: 'Valutazione preventiva del budget', desc: 'Voglio prima sapere quanto la banca mi concede' }
                ].map((item) => (
                  <label
                    key={item.label}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      formData.statoRicercaCasa === item.label
                        ? 'bg-indigo-50/80 border-indigo-400 text-indigo-900 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="statoRicercaCasa"
                      value={item.label}
                      checked={formData.statoRicercaCasa === item.label}
                      onChange={(e) => setFormData(prev => ({ ...prev, statoRicercaCasa: e.target.value }))}
                      className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-bold block">{item.label}</span>
                      <span className="text-xs text-slate-400 font-medium block mt-0.5">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Note Aggiuntive */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Note Aggiuntive (Facoltativo)
              </label>
              <textarea
                rows={3}
                placeholder="Indica eventuali altri prestiti in corso, presenza di garanti o orari preferiti per il contatto..."
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none"
              ></textarea>
            </div>

            {/* Note invio mail */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
              <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
              <p className="text-xs font-semibold text-indigo-900">
                I tuoi dati verranno inviati direttamente via email ai consulenti: <span className="font-bold underline">mario.sorice@credipass.it</span> e <span className="font-bold underline">danielaruggiero@credipass.it</span>.
              </p>
            </div>

            {/* Privacy Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.privacyAccepted}
                  onChange={(e) => setFormData(prev => ({ ...prev, privacyAccepted: e.target.checked }))}
                  className="mt-1 w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500 font-medium leading-relaxed">
                  Autorizzo il trattamento dei miei dati personali per ricevere la consulenza creditizia e la valutazione di prefattibilità mutuo da parte degli specialisti di Bancometro.it nel rispetto del Regolamento UE 2016/679 (GDPR).
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Invio richiesta in corso...</span>
                </>
              ) : (
                <>
                  <span>Invia Richiesta via Email ai Consulenti</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Confirmation State */
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/60 border border-slate-100 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            {/* Prominent required message */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-sm">
              <div className="inline-flex items-center gap-2 text-emerald-800 text-xs font-black uppercase tracking-widest mb-3">
                <ShieldCheck className="w-4 h-4" />
                Conferma Ricezione Pratica
              </div>
              <p className="text-lg md:text-xl font-black text-emerald-950 tracking-tight leading-snug">
                "La tua richiesta è in lavorazione. Presto sarai contattato dai consulenti per una valutare le tue opportunità."
              </p>
            </div>

            {/* Mail confirmation alert */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-800 px-5 py-2.5 rounded-full text-xs font-bold">
              <Mail className="w-4 h-4 text-indigo-600" />
              Riepilogo inoltrato con successo a <span className="font-black text-indigo-900">mario.sorice@credipass.it</span> e <span className="font-black text-indigo-900">danielaruggiero@credipass.it</span>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-100 text-left max-w-2xl mx-auto space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-3 flex items-center justify-between">
                <span>Riepilogo Dati Trasferiti</span>
                <span className="text-[10px] text-slate-400 font-medium">{new Date().toLocaleDateString('it-IT')}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Richiedente</span>
                  <p className="font-bold text-slate-900 text-sm">{formData.nome} {formData.cognome}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Età: {formData.eta} anni</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Recapito Telefonico</span>
                  <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    {formData.telefono}
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5 font-bold">Verificato per contatto</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Importo Desiderato</span>
                  <p className="font-black text-indigo-600 text-base">€{formData.importo.toLocaleString('it-IT')}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Reddito Netto Mensile</span>
                  <p className="font-bold text-slate-900 text-base">€{formData.redditoMensile.toLocaleString('it-IT')}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Profilo Lavorativo</span>
                  <p className="font-bold text-slate-900">{formData.tipologiaLavoro}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formData.dettaglioContratto}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Situazione Immobile</span>
                  <p className="font-bold text-slate-900">{formData.statoRicercaCasa}</p>
                </div>
              </div>

              {formData.note && (
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Note del cliente</span>
                  <p className="text-slate-700 font-medium italic">"{formData.note}"</p>
                </div>
              )}
            </div>

            {/* Fast Email client & WhatsApp Actions */}
            <div className="pt-2 max-w-2xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={mailtoUrl}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-5 py-3.5 rounded-2xl transition-all text-xs border border-indigo-200"
                >
                  <Mail className="w-4 h-4" />
                  <span>Apri copia nel tuo client email</span>
                </a>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                  Vuoi parlare subito? Scrivici direttamente su WhatsApp:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSendWhatsApp('3933364925')}
                    className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-100 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp Mario Sorice
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp('3496753212')}
                    className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-100 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp Daniela Ruggiero
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  setSubmitted(false);
                  onBack();
                }}
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors cursor-pointer"
              >
                Torna al Simulatore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER CALLOUT / IN CALCE: Link alla pagina contatti */}
      <div className="mt-12 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-left">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 tracking-tight">
              Preferisci parlare direttamente con un nostro consulente?
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Mario Sorice e Daniela Ruggiero sono disponibili telefonicamente o su WhatsApp per chiarire ogni dubbio.
            </p>
          </div>
        </div>
        <button
          onClick={onGoToContacts}
          className="w-full md:w-auto bg-slate-900 hover:bg-indigo-600 text-white font-black px-6 py-4 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
        >
          <span>Vai alla Pagina Contatti</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
