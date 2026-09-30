import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { subscribeToPersonalPlans, createPersonalPlan, deletePersonalPlan } from '../lib/store';

const empty = { name: '', description: '', startDate: '', endDate: '' };
const fmt = (d) => format(parseISO(d), 'd MMM', { locale: es });

export default function Personal({ user }) {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => subscribeToPersonalPlans(setPlans), []);

  const submit = async (e) => {
    e.preventDefault();
    await createPersonalPlan({ ...form, owner: user.uid, createdAt: new Date().toISOString() });
    setForm(empty);
  };

  const sorted = [...plans].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const mine = sorted.filter(p => p.owner === user.uid);
  const others = sorted.filter(p => p.owner !== user.uid);

  const List = ({ list, editable }) => list.length === 0
    ? <div className="card glass empty-state">Nada por aquí.</div>
    : list.map(p => (
      <div key={p.id} className="card glass flex justify-between items-center gap-4" style={{ padding: '1rem 1.25rem' }}>
        <div>
          <div className="font-semibold">{p.name}</div>
          {p.description && <div className="text-sm text-muted">{p.description}</div>}
          <span className={`badge mt-2 ${editable ? 'badge-violet' : 'badge-teal'}`}>
            {fmt(p.startDate)}{p.endDate && p.endDate !== p.startDate ? ` → ${fmt(p.endDate)}` : ''}
          </span>
        </div>
        {editable && <button onClick={() => window.confirm('¿Borrar?') && deletePersonalPlan(p.id)} className="icon-btn"><Trash2 size={18} /></button>}
      </div>
    ));

  return (
    <div className="page animate-fade-in">
      <h1 className="page-title">Planes personales</h1>
      <p className="text-muted mb-6">Lo que cada uno hace por su cuenta. Aparece en el calendario para tenerlo en cuenta al planear juntos.</p>

      <form onSubmit={submit} className="card glass mb-8">
        <div className="input-group">
          <label>Nombre</label>
          <input required className="input-field" value={form.name} onChange={set('name')} placeholder="Ej: Cena con mis padres" />
        </div>
        <div className="flex gap-4">
          <div className="input-group w-full"><label>Inicio</label><input required type="date" className="input-field" value={form.startDate} onChange={set('startDate')} /></div>
          <div className="input-group w-full"><label>Fin (opcional)</label><input type="date" className="input-field" min={form.startDate} value={form.endDate} onChange={set('endDate')} /></div>
        </div>
        <div className="input-group"><label>Notas (opcional)</label><input className="input-field" value={form.description} onChange={set('description')} /></div>
        <button type="submit" className="btn btn-green"><Plus size={18} /> Añadir</button>
      </form>

      <h2 className="text-xl font-semibold mb-3 text-pink">Míos</h2>
      <div className="flex flex-col gap-3 mb-8"><List list={mine} editable /></div>
      <h2 className="text-xl font-semibold mb-3 text-green">De la otra persona</h2>
      <div className="flex flex-col gap-3"><List list={others} /></div>
    </div>
  );
}
