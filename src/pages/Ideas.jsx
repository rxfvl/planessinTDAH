import { useState, useEffect } from 'react';
import { RotateCcw, Trash2, Lightbulb } from 'lucide-react';
import { subscribeToIdeas, subscribeToPlans, updatePlan, deleteIdea } from '../lib/store';
import Modal from '../components/Modal';

export default function Ideas({ user }) {
  const [ideas, setIdeas] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [recovering, setRecovering] = useState(null); // idea a recuperar

  useEffect(() => {
    const a = subscribeToIdeas(setIdeas);
    const b = subscribeToPlans(setPlans);
    return () => { a(); b(); };
  }, []);

  const recoverTo = async (plan) => {
    const proposal = { id: Date.now().toString(), text: recovering.text, votes: [user.uid], status: 'pending' };
    await updatePlan(plan.id, { proposals: [...(plan.proposals || []), proposal] });
    await deleteIdea(recovering.id);
    setRecovering(null);
  };

  const shown = ideas.filter(i => i.text.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page animate-fade-in">
      <h1 className="page-title"><Lightbulb className="text-green" style={{ verticalAlign: 'middle' }} /> Banco de ideas</h1>
      <p className="text-muted mb-6">Propuestas descartadas de cualquier plan. Recupéralas cuando vuelvan a apetecer.</p>
      <input className="input-field w-full mb-6" placeholder="Buscar idea..." value={search} onChange={e => setSearch(e.target.value)} />

      {shown.length === 0 ? (
        <div className="card glass empty-state">No hay ideas guardadas todavía.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map(i => (
            <div key={i.id} className="card glass flex justify-between items-center gap-4" style={{ padding: '1rem 1.25rem' }}>
              <div>
                <div className="font-semibold">{i.text}</div>
                <div className="text-xs text-muted">{i.fromPlanName ? `Descartada en "${i.fromPlanName}"` : ''} {i.discardedBy && `· ${i.discardedBy}`}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setRecovering(i)} className="icon-btn green" title="Recuperar en un plan"><RotateCcw size={18} /></button>
                <button onClick={() => window.confirm('¿Borrar esta idea del todo?') && deleteIdea(i.id)} className="icon-btn" title="Borrar"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {recovering && (
        <Modal onClose={() => setRecovering(null)}>
          <h2 className="text-xl font-bold mb-2">¿En qué plan la recuperamos?</h2>
          <p className="text-muted mb-4">“{recovering.text}”</p>
          <div className="flex flex-col gap-2">
            {plans.length === 0 && <p className="text-muted">Primero crea un plan.</p>}
            {plans.map(p => <button key={p.id} onClick={() => recoverTo(p)} className="btn btn-outline">{p.name}</button>)}
          </div>
          <button onClick={() => setRecovering(null)} className="btn btn-outline mt-4 w-full">Cancelar</button>
        </Modal>
      )}
    </div>
  );
}
