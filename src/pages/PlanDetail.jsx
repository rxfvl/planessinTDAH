import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subscribeToPlans, updatePlan } from '../lib/store';
import { ArrowLeft, Check, X, ThumbsUp, Trash2, RotateCcw, ListTodo } from 'lucide-react';

export default function PlanDetail({ user }) {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [newProp, setNewProp] = useState('');
  const [newReq, setNewReq] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToPlans((plans) => {
      const p = plans.find(x => x.id === id);
      setPlan(p);
    });
    return () => unsubscribe();
  }, [id]);

  if (!plan) return <div className="p-8 text-center">Cargando plan...</div>;

  const proposals = plan.proposals || [];
  const analysis = plan.analysis || [];

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
    const updated = proposals.map(p => p.id === propId ? { ...p, status: 'discarded' } : p);
    await updatePlan(plan.id, { proposals: updated });
  };

  const handleRecover = async (propId) => {
    const updated = proposals.map(p => p.id === propId ? { ...p, status: 'pending', votes: [user.uid] } : p);
    await updatePlan(plan.id, { proposals: updated });
  };

  const handleHardDelete = async (propId) => {
    const updated = proposals.filter(p => p.id !== propId);
    await updatePlan(plan.id, { proposals: updated });
  };

  const handleAddRequirement = async (e) => {
    e.preventDefault();
    if (!newReq.trim()) return;
    const req = { id: Date.now().toString(), text: newReq, completed: false };
    await updatePlan(plan.id, { analysis: [...analysis, req] });
    setNewReq('');
  };

  const toggleRequirement = async (reqId) => {
    const updated = analysis.map(a => a.id === reqId ? { ...a, completed: !a.completed } : a);
    await updatePlan(plan.id, { analysis: updated });
  };

  const deleteRequirement = async (reqId) => {
    const updated = analysis.filter(a => a.id !== reqId);
    await updatePlan(plan.id, { analysis: updated });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-pink mb-6 transition-colors">
        <ArrowLeft size={20} /> Volver al Dashboard
      </Link>

      <div className="card glass mb-12 border-t-4" style={{ borderTopColor: 'var(--accent-green)' }}>
        <h1 className="text-4xl font-extrabold text-main mb-3">{plan.name}</h1>
        <p className="text-muted text-lg">{plan.description}</p>
      </div>

      <div className="grid gap-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
        
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

          {/* Propuestas Pendientes */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-muted">Votando ({pendingProps.length})</h3>
            <div className="flex flex-col gap-4">
              {pendingProps.map(p => {
                const myVote = p.votes.includes(user.uid);
                return (
                  <div key={p.id} className="card bg-surface-light p-3 flex flex-col gap-1 border border-border-color" style={{ padding: '1rem', borderRadius: '12px' }}>
                    <div className="flex justify-between items-center w-full">
                      <span className="flex-1 font-medium">{p.text}</span>
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
                   <li key={p.id} className="text-lg font-medium text-main">{p.text}</li>
                ))}
              </ul>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-4 text-main flex items-center gap-2">
            <ListTodo size={20} className="text-pink" /> Análisis y Preparativos
          </h2>
          <p className="text-sm text-muted mb-4">¿Qué necesitamos para que esto sea perfecto? (Entradas, reservas, maleta...)</p>

          <form onSubmit={handleAddRequirement} className="mb-6 flex gap-2">
            <input 
              type="text" 
              className="input-field flex-1" 
              placeholder="Ej: Comprar entradas, Reservar mesa..."
              value={newReq}
              onChange={e => setNewReq(e.target.value)}
            />
            <button type="submit" className="btn btn-green px-4">Añadir</button>
          </form>

          <div className="flex flex-col gap-2">
            {analysis.map(req => (
              <div key={req.id} className={`flex items-center gap-3 p-3 rounded-lg border ${req.completed ? 'bg-surface-light border-border-color opacity-60' : 'bg-surface-color border-green'}`}>
                <input 
                  type="checkbox" 
                  checked={req.completed} 
                  onChange={() => toggleRequirement(req.id)}
                  className="w-5 h-5 accent-green"
                  style={{ accentColor: 'var(--accent-green)', width: '20px', height: '20px' }}
                />
                <span className={`flex-1 ${req.completed ? 'line-through text-muted' : 'text-main'}`}>
                  {req.text}
                </span>
                <button onClick={() => deleteRequirement(req.id)} className="text-muted hover:text-pink">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
