import { useState } from 'react';
import { Trash2, Sparkles, Plus, X } from 'lucide-react';
import { updatePlan } from '../lib/store';
import { suggest } from '../lib/ai';

// Lista con checks guardada en plan[field], con sugerencias de la IA.
// kind: 'preparativos' | 'imprevistos'
export default function ChecklistSection({ plan, field, kind, title, hint, placeholder, icon: Icon, accent }) {
  const items = plan[field] || [];
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = (list) => updatePlan(plan.id, { [field]: list });
  const newItem = (t) => ({ id: `${Date.now()}${Math.random().toString(36).slice(2, 6)}`, text: t, completed: false });

  const add = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await save([...items, newItem(text.trim())]);
    setText('');
  };

  const ask = async () => {
    setBusy(true); setError('');
    try {
      const list = await suggest(kind, plan);
      setSuggestions(list);
      if (!list.length) setError('No se me ocurre nada nuevo. Prueba de nuevo.');
    } catch (err) {
      console.error(err);
      setError('No se pudo contactar con la IA. Inténtalo de nuevo en un momento.');
    } finally {
      setBusy(false);
    }
  };

  const accept = async (s) => {
    setSuggestions(suggestions.filter(x => x !== s));
    await save([...items, newItem(s)]);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2 text-main flex items-center gap-2">
        <Icon size={20} style={{ color: accent }} /> {title}
      </h2>
      <p className="text-sm text-muted mb-4">{hint}</p>

      <form onSubmit={add} className="mb-4 flex gap-2">
        <input type="text" className="input-field flex-1" placeholder={placeholder} value={text} onChange={e => setText(e.target.value)} />
        <button type="submit" className="btn btn-green px-4">Añadir</button>
      </form>

      <button onClick={ask} disabled={busy} className="btn btn-outline mb-4 w-full" style={{ opacity: busy ? 0.6 : 1 }}>
        <Sparkles size={16} className="text-pink" /> {busy ? 'Pensando...' : 'Sugerir con IA'}
      </button>
      {error && <p className="text-xs text-pink mb-4">{error}</p>}

      {suggestions.length > 0 && (
        <div className="card glass mb-4 flex flex-col gap-2" style={{ padding: '1rem' }}>
          <div className="text-xs text-muted uppercase">Sugerencias de la IA</div>
          {suggestions.map(s => (
            <div key={s} className="flex items-center gap-2">
              <span className="flex-1 text-sm">{s}</span>
              <button onClick={() => accept(s)} className="icon-btn green" title="Añadir"><Plus size={18} /></button>
              <button onClick={() => setSuggestions(suggestions.filter(x => x !== s))} className="icon-btn" title="Descartar"><X size={18} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map(it => (
          <div key={it.id} className={`flex items-center gap-3 p-3 rounded-lg border ${it.completed ? 'bg-surface-light border-border-color opacity-60' : 'border-green'}`} style={{ borderRadius: '10px' }}>
            <input
              type="checkbox" checked={it.completed}
              onChange={() => save(items.map(a => a.id === it.id ? { ...a, completed: !a.completed } : a))}
              style={{ accentColor: 'var(--accent-green)', width: '20px', height: '20px' }}
            />
            <span className={`flex-1 ${it.completed ? 'line-through text-muted' : 'text-main'}`}>{it.text}</span>
            <button onClick={() => save(items.filter(a => a.id !== it.id))} className="icon-btn" title="Borrar"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
