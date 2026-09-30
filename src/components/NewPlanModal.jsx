import { useState } from 'react';
import Modal from './Modal';
import { createPlan } from '../lib/store';

export default function NewPlanModal({ user, startDate = '', onClose }) {
  const [plan, setPlan] = useState({ name: '', description: '', startDate, endDate: '' });
  const set = (k) => (e) => setPlan({ ...plan, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await createPlan({ ...plan, createdBy: user.uid, createdAt: new Date().toISOString(), proposals: [], analysis: [] });
      onClose();
    } catch (error) {
      console.error("Firebase Error: ", error);
      alert("No se ha podido guardar: " + error.message);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4">Crear Nuevo Plan</h2>
      <form onSubmit={submit}>
        <div className="input-group">
          <label>Nombre del plan</label>
          <input required className="input-field" value={plan.name} onChange={set('name')} placeholder="Ej: Viaje a París" />
        </div>
        <div className="input-group">
          <label>Descripción / Resumen</label>
          <textarea required className="input-field" rows={3} value={plan.description} onChange={set('description')} placeholder="Un finde romántico..." />
        </div>
        <div className="flex gap-4">
          <div className="input-group w-full">
            <label>Fecha inicio</label>
            <input required type="date" className="input-field" value={plan.startDate} onChange={set('startDate')} />
          </div>
          <div className="input-group w-full">
            <label>Fecha fin (opcional)</label>
            <input type="date" className="input-field" value={plan.endDate} min={plan.startDate} onChange={set('endDate')} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
          <button type="submit" className="btn btn-green">Crear</button>
        </div>
      </form>
    </Modal>
  );
}
