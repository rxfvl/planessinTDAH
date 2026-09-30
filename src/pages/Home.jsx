import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { subscribeToPlans, subscribeToPersonalPlans } from '../lib/store';
import Calendar from '../components/Calendar';
import Modal from '../components/Modal';
import NewPlanModal from '../components/NewPlanModal';

export default function Home({ user }) {
  const [plans, setPlans] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [day, setDay] = useState(null); // { date, list }
  const [newPlanDate, setNewPlanDate] = useState(null);

  useEffect(() => {
    const a = subscribeToPlans(setPlans);
    const b = subscribeToPersonalPlans(setPersonal);
    return () => { a(); b(); };
  }, []);

  const items = [
    ...plans.map(p => ({ id: p.id, name: p.name, start: p.startDate, end: p.endDate || p.startDate, kind: 'joint', plan: p })),
    ...personal.map(p => ({ id: p.id, name: `${p.owner}: ${p.name}`, start: p.startDate, end: p.endDate || p.startDate, kind: p.owner === user.uid ? 'mine' : 'other', plan: p })),
  ];

  return (
    <div className="page animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title text-gradient" style={{ marginBottom: 0 }}>Hola, {user.displayName}</h1>
        <button onClick={() => setNewPlanDate('')} className="btn btn-pink"><Plus size={18} /> Nuevo Plan</button>
      </div>

      <Calendar items={items} onDayClick={(date, list) => setDay({ date, list })} />

      {day && (
        <Modal onClose={() => setDay(null)}>
          <h2 className="text-2xl font-bold mb-4 text-pink" style={{ textTransform: 'capitalize' }}>
            {format(day.date, "EEEE d 'de' MMMM", { locale: es })}
          </h2>
          {day.list.length === 0 && <p className="text-muted mb-4">Día libre. ¿Planeamos algo?</p>}
          <div className="flex flex-col gap-4">
            {day.list.map(i => {
              const accepted = (i.plan.proposals || []).filter(p => p.status === 'accepted');
              return (
                <div key={i.id} className="card bg-surface-light" style={{ padding: '1.25rem' }}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">{i.kind === 'joint' ? i.name : i.plan.name}</h3>
                    <span className={`badge ${i.kind === 'joint' ? '' : i.kind === 'mine' ? 'badge-violet' : 'badge-teal'}`}>
                      {i.kind === 'joint' ? 'Conjunto' : `Personal · ${i.plan.owner}`}
                    </span>
                  </div>
                  <p className="text-muted text-sm">{i.plan.description}</p>
                  <div className="text-xs text-muted mt-2">
                    {format(parseISO(i.start), 'd MMM', { locale: es })}
                    {i.end !== i.start && ` → ${format(parseISO(i.end), 'd MMM', { locale: es })}`}
                  </div>
                  {accepted.length > 0 && (
                    <ul className="mt-3 text-sm" style={{ paddingLeft: '1.2rem' }}>
                      {accepted.map(p => <li key={p.id}>{p.text}</li>)}
                    </ul>
                  )}
                  {i.kind === 'joint' && <Link to={`/plan/${i.id}`} className="btn btn-outline mt-3 w-full">Ir al plan</Link>}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={() => { setNewPlanDate(format(day.date, 'yyyy-MM-dd')); setDay(null); }} className="btn btn-green">
              <Plus size={16} /> Plan este día
            </button>
            <button onClick={() => setDay(null)} className="btn btn-outline">Cerrar</button>
          </div>
        </Modal>
      )}

      {newPlanDate !== null && <NewPlanModal user={user} startDate={newPlanDate} onClose={() => setNewPlanDate(null)} />}
    </div>
  );
}
