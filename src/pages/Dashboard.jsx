import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LogOut, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { subscribeToPlans, createPlan, logoutIdentity, deletePlan } from '../lib/store';
import { APP_CONFIG } from '../config';
import Calendar from '../components/Calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard({ user }) {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', description: '', startDate: '', endDate: '' });
  
  const [dayPlans, setDayPlans] = useState([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToPlans(setPlans);
    return () => unsubscribe();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await createPlan({
        ...newPlan,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        proposals: [],
        analysis: []
      });
      setShowModal(false);
      setNewPlan({ name: '', description: '', startDate: '', endDate: '' });
    } catch (error) {
      console.error("Firebase Error: ", error);
      alert("No se ha podido guardar. Si acabas de crear el Firebase, ve a Firestore Database -> Reglas (Rules) y pon 'allow read, write: if true;' - Error: " + error.message);
    }
  };

  const handleLogout = () => {
    logoutIdentity();
  };

  const handleDeletePlan = async (e, planId, planName) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`¿Seguro que quieres borrar el plan "${planName}" por completo?`)) {
      try {
        await deletePlan(planId);
      } catch (err) {
        alert("Error al borrar: " + err.message);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-green-500" style={{ backgroundImage: 'linear-gradient(90deg, var(--accent-pink), var(--accent-green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Hola, {user.displayName}
        </h1>
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
          <LogOut size={18} /> Salir
        </button>
      </div>

      <div className="grid gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column - Plans */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CalendarIcon className="text-pink" /> Próximos Planes
            </h2>
            <button onClick={() => setShowModal(true)} className="btn btn-pink">
              <Plus size={18} /> Nuevo Plan
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {plans.length === 0 ? (
              <div className="card glass text-center p-8 text-muted">
                Aún no hay planes. ¡Anímate a crear uno!
              </div>
            ) : (
              plans.sort((a,b) => new Date(a.startDate) - new Date(b.startDate)).map(plan => (
                <Link to={`/plan/${plan.id}`} key={plan.id}>
                  <div className="card glass flex justify-between items-center group cursor-pointer hover:border-pink transition-colors">
                    <div>
                      <h3 className="text-lg font-bold text-main group-hover:text-pink transition-colors">{plan.name}</h3>
                      <p className="text-muted text-sm">{plan.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-green font-semibold">
                          {format(new Date(plan.startDate), "d 'de' MMMM", { locale: es })}
                        </div>
                        {plan.endDate && (
                          <div className="text-xs text-muted">
                            al {format(new Date(plan.endDate), "d 'de' MMMM", { locale: es })}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={(e) => handleDeletePlan(e, plan.id, plan.name)} 
                        className="text-muted hover:text-pink p-2 transition-colors"
                        title="Borrar plan"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2 className="text-xl font-semibold mb-4 text-green">Calendario</h2>
          <Calendar plans={plans} onDateClick={(plansOnDay, day) => {
            setDayPlans(plansOnDay);
            setSelectedDay(day);
            setShowDayModal(true);
          }} />
        </div>
      </div>

      {/* Modal Create Plan */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card glass w-full m-4 animate-fade-in" style={{ backgroundColor: 'var(--surface-color)', maxWidth: '500px', width: '100%' }}>
            <h2 className="text-2xl font-bold mb-4">Crear Nuevo Plan</h2>
            <form onSubmit={handleCreatePlan}>
              <div className="input-group">
                <label>Nombre del plan</label>
                <input required type="text" className="input-field" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} placeholder="Ej: Viaje a París" />
              </div>
              <div className="input-group">
                <label>Descripción / Resumen</label>
                <textarea required className="input-field" value={newPlan.description} onChange={e => setNewPlan({...newPlan, description: e.target.value})} placeholder="Un finde romántico..." rows={3} />
              </div>
              <div className="flex gap-4">
                <div className="input-group w-full">
                  <label>Fecha inicio</label>
                  <input required type="date" className="input-field" value={newPlan.startDate} onChange={e => setNewPlan({...newPlan, startDate: e.target.value})} />
                </div>
                <div className="input-group w-full">
                  <label>Fecha fin (opcional)</label>
                  <input type="date" className="input-field" value={newPlan.endDate} onChange={e => setNewPlan({...newPlan, endDate: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancelar</button>
                <button type="submit" className="btn btn-green">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Day Info */}
      {showDayModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card glass w-full m-4 animate-fade-in flex flex-col gap-4" style={{ backgroundColor: 'var(--surface-color)', maxHeight: '90vh', overflowY: 'auto', maxWidth: '500px', width: '100%' }}>
            <h2 className="text-2xl font-bold border-b border-border-color pb-3 mb-2 text-pink">
              {selectedDay ? format(selectedDay, "d 'de' MMMM", { locale: es }) : ''}
            </h2>
            
            <div className="flex flex-col gap-4">
              {dayPlans.map(plan => {
                const accepted = (plan.proposals || []).filter(p => p.status === 'accepted');
                
                return (
                  <div key={plan.id} className="card bg-surface-light p-4 flex flex-col gap-3 border border-border-color" style={{ padding: '1.25rem' }}>
                    <h3 className="text-xl font-bold text-main">{plan.name}</h3>
                    <p className="text-muted text-sm">{plan.description}</p>
                    
                    {accepted.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-xs font-semibold text-green uppercase tracking-wider mb-2">Aprobadas:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-main">
                          {accepted.map(p => <li key={p.id}>{p.text}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    <Link to={`/plan/${plan.id}`} className="btn btn-outline text-center mt-3 text-sm py-2">
                      Ir al Plan
                    </Link>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end mt-2">
              <button onClick={() => setShowDayModal(false)} className="btn btn-outline">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
