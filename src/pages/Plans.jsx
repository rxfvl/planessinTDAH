import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { subscribeToPlans, deletePlan } from '../lib/store';
import NewPlanModal from '../components/NewPlanModal';

const fmt = (d) => format(parseISO(d), "d 'de' MMMM", { locale: es });

export default function Plans({ user }) {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => subscribeToPlans(setPlans), []);

  const handleDelete = async (e, plan) => {
    e.preventDefault();
    if (!window.confirm(`¿Seguro que quieres borrar el plan "${plan.name}" por completo?`)) return;
    try { await deletePlan(plan.id); } catch (err) { alert("Error al borrar: " + err.message); }
  };

  const shown = [...plans]
    .filter(p => `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="page animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Planes</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-pink"><Plus size={18} /> Nuevo Plan</button>
      </div>
      <input className="input-field w-full mb-6" placeholder="Buscar plan..." value={search} onChange={e => setSearch(e.target.value)} />

      <div className="flex flex-col gap-4">
        {shown.length === 0 ? (
          <div className="card glass empty-state">Aún no hay planes. ¡Anímate a crear uno!</div>
        ) : shown.map(plan => (
          <Link to={`/plan/${plan.id}`} key={plan.id} className="link-card">
            <div className="card glass card-edge flex justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-bold" style={{ transition: 'color .2s' }}>{plan.name}</h3>
                <p className="text-muted text-sm">{plan.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="badge badge-green">{(plan.proposals || []).filter(p => p.status === 'accepted').length} aprobadas</span>
                  <span className="badge">{(plan.analysis || []).filter(a => !a.completed).length} pendientes</span>
                </div>
              </div>
              <div className="flex items-center gap-4" style={{ textAlign: 'right' }}>
                <div>
                  <div className="text-green font-semibold">{fmt(plan.startDate)}</div>
                  {plan.endDate && <div className="text-xs text-muted">al {fmt(plan.endDate)}</div>}
                </div>
                <button onClick={(e) => handleDelete(e, plan)} className="icon-btn" title="Borrar plan"><Trash2 size={20} /></button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showModal && <NewPlanModal user={user} onClose={() => setShowModal(false)} />}
    </div>
  );
}
