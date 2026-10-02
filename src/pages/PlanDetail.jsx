import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subscribeToPlans, updatePlan, addIdea, subscribeToIdeas, deleteIdea } from '../lib/store';
import ChecklistSection from '../components/ChecklistSection';
import { ArrowLeft, Check, X, ThumbsUp, Trash2, RotateCcw, ListTodo, Pencil, ShieldAlert } from 'lucide-react';

export default function PlanDetail({ user }) {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [newProp, setNewProp] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [editing, setEditing] = useState(null); // { id, text }

  useEffect(() => subscribeToIdeas(setIdeas), []);

  useEffect(() => {
    const unsubscribe = subscribeToPlans((plans) => {
      const p = plans.find(x => x.id === id);
      setPlan(p);
    });
    return () => unsubscribe();
  }, [id]);

  if (!plan) return <div className="p-8 text-center">Cargando plan...</div>;

  const proposals = plan.proposals || [];

  const pendingProps = proposals.filter(p => p.status === 'pending');
  const acceptedProps = proposals.filter(p => p.status === 'accepted');
  const discardedProps = proposals.filter(p => p.status === 'discarded');

  const handleAddProposal = async (e) => {
    e.preventDefault();
    if (!newProp.trim()) return;
    const newProposal = {
      id: Date.now().toString(),
      text: newProp,
      votes: [user.uid],
      status: 'pending' // automatically pending until the other votes
    };
    await updatePlan(plan.id, { proposals: [...proposals, newProposal] });
    setNewProp('');
  };

  const handleVote = async (propId) => {
    const updated = proposals.map(p => {
      if (p.id === propId) {
        const hasVoted = p.votes.includes(user.uid);
        let newVotes = hasVoted ? p.votes.filter(v => v !== user.uid) : [...p.votes, user.uid];
        // If both voted (assuming 2 users)
        let status = newVotes.length >= 2 ? 'accepted' : 'pending';
        return { ...p, votes: newVotes, status };
      }
      return p;
    });
    await updatePlan(plan.id, { proposals: updated });
  };

  const handleDiscard = async (propId) => {
    const prop = proposals.find(p => p.id === propId);
    await addIdea({ text: prop.text, fromPlanId: plan.id, fromPlanName: plan.name, discardedBy: user.uid, createdAt: new Date().toISOString() });
    await updatePlan(plan.id, { proposals: proposals.filter(p => p.id !== propId) });
  };

  const addIdeaToPlan = async (idea) => {
    const proposal = { id: Date.now().toString(), text: idea.text, votes: [user.uid], status: 'pending' };
    await updatePlan(plan.id, { proposals: [...proposals, proposal] });
    await deleteIdea(idea.id);
  };

  const handleRecover = async (propId) => {
    const updated = proposals.map(p => p.id === propId ? { ...p, status: 'pending', votes: [user.uid] } : p);
    await updatePlan(plan.id, { proposals: updated });
  };

  const saveEdit = async () => {
    const text = editing.text.trim();
    if (text) await updatePlan(plan.id, { proposals: proposals.map(p => p.id === editing.id ? { ...p, text } : p) });
    setEditing(null);
  };

  const proposalText = (p, className) => editing?.id === p.id ? (
    <input
      autoFocus
      className="input-field flex-1"
      style={{ padding: '0.4rem 0.75rem', fontSize: '1rem' }}
      value={editing.text}
      onChange={e => setEditing({ ...editing, text: e.target.value })}
      onBlur={saveEdit}
      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(null); }}
    />
  ) : (
    <span className={`flex-1 ${className}`}>
      {p.text}
      <button onClick={() => setEditing({ id: p.id, text: p.text })} className="icon-btn" style={{ padding: '0.25rem', marginLeft: '0.4rem' }} title="Editar">
        <Pencil size={14} />
      </button>
    </span>
  );

  const handleHardDelete = async (propId) => {
    const updated = proposals.filter(p => p.id !== propId);
    await updatePlan(plan.id, { proposals: updated });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <Link to="/planes" className="inline-flex items-center gap-2 text-muted hover:text-pink mb-6 transition-colors">
        <ArrowLeft size={20} /> Volver a planes
      </Link>

      <div className="card glass mb-12 border-t-4" style={{ borderTopColor: 'var(--accent-green)' }}>
        <h1 className="text-4xl font-extrabold text-main mb-3">{plan.name}</h1>
        <p className="text-muted text-lg">{plan.description}</p>
      </div>

      <div className="grid gap-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '4rem' }}>
        
        {/* Lado Izquierdo: Propuestas */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-pink flex items-center gap-2">
             Propuestas 
          </h2>
          
          <form onSubmit={handleAddProposal} className="mb-6 flex gap-2">
            <input 
              type="text" 
              className="input-field flex-1" 
              placeholder="Ej: Ir al cine..."
              value={newProp}
              onChange={e => setNewProp(e.target.value)}
            />
            <button type="submit" className="btn btn-pink px-4">Añadir</button>
          </form>

          {ideas.length > 0 && (
            <div className="mb-6">
              <div className="text-xs text-muted mb-2 uppercase">Del banco de ideas</div>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {ideas.slice(0, 8).map(i => (
                  <button key={i.id} onClick={() => addIdeaToPlan(i)} className="badge badge-violet" title="Añadir al plan">+ {i.text}</button>
                ))}
              </div>
            </div>
          )}

          {/* Propuestas Pendientes */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-muted">Votando ({pendingProps.length})</h3>
            <div className="flex flex-col gap-4">
              {pendingProps.map(p => {
                const myVote = p.votes.includes(user.uid);
                return (
                  <div key={p.id} className="card bg-surface-light p-3 flex flex-col gap-1 border border-border-color" style={{ padding: '1rem', borderRadius: '12px' }}>
                    <div className="flex justify-between items-center w-full">
                      {proposalText(p, 'font-medium')}
                      <div className="flex gap-2">
                        <button onClick={() => handleVote(p.id)} className={`btn-outline p-2 rounded-full transition-all`} title="Votar a favor" style={{ padding: '0.5rem', borderColor: myVote ? 'var(--accent-green)' : '', color: myVote ? 'var(--accent-green)' : '', backgroundColor: myVote ? 'rgba(0, 230, 118, 0.1)' : 'transparent' }}>
                          <ThumbsUp size={16} />
                        </button>
                        <button onClick={() => handleDiscard(p.id)} className="btn-outline p-2 rounded-full transition-all" title="Descartar" style={{ padding: '0.5rem' }} onMouseOver={e => { e.currentTarget.style.color='var(--accent-pink)'; e.currentTarget.style.borderColor='var(--accent-pink)'; }} onMouseOut={e => { e.currentTarget.style.color=''; e.currentTarget.style.borderColor=''; }}>
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      {p.votes.length > 0 ? (
                        <span className="text-green flex items-center gap-1 opacity-80" style={{ fontSize: '0.85rem' }}>
                          <Check size={14} /> {p.votes.join(' y ')}
                        </span>
                      ) : (
                        <span className="text-muted italic" style={{ fontSize: '0.85rem' }}>Aún no tiene votos</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Propuestas Descartadas */}
          {discardedProps.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-3 text-muted">Descartadas / Para otra vez</h3>
              <div className="flex flex-col gap-3">
                {discardedProps.map(p => (
                  <div key={p.id} className="card bg-surface-light p-4 flex justify-between items-center opacity-70">
                    <span className="flex-1 line-through">{p.text}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleRecover(p.id)} className="btn-outline p-2 rounded-full hover:text-green" title="Recuperar">
                        <RotateCcw size={18} />
                      </button>
                      <button onClick={() => handleHardDelete(p.id)} className="btn-outline p-2 rounded-full hover:text-pink" title="Borrar del todo">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lado Derecho: Análisis y Cosas Aceptadas */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-green flex items-center gap-2">
            <Check size={24} /> ¡Plan Confirmado!
          </h2>
          
          <div className="card glass border-green mb-8">
            <h3 className="font-medium text-muted mb-4 uppercase text-xs tracking-wider">Actividades Aprobadas por ambos</h3>
            {acceptedProps.length === 0 ? (
              <p className="text-sm text-muted italic">Aún no hay actividades con 2 votos.</p>
            ) : (
              <ul className="list-disc list-inside space-y-2">
                {acceptedProps.map(p => (
                   <li key={p.id} className="text-lg font-medium text-main">{proposalText(p, '')}</li>
                ))}
              </ul>
            )}
          </div>

          <ChecklistSection
            plan={plan} field="analysis" kind="preparativos" icon={ListTodo} accent="var(--accent-pink)"
            title="Análisis y Preparativos"
            hint="¿Qué necesitamos para que esto sea perfecto? (Entradas, reservas, maleta...)"
            placeholder="Ej: Comprar entradas, Reservar mesa..."
          />

          <ChecklistSection
            plan={plan} field="contingencies" kind="imprevistos" icon={ShieldAlert} accent="var(--violet-400)"
            title="Imprevistos y cosas a tener en cuenta"
            hint="¿Qué podría salir mal y cómo lo cubrimos? (Mal tiempo, retrasos, plan B...)"
            placeholder="Ej: Si llueve, plan B en el museo..."
          />

        </div>
      </div>
    </div>
  );
}
