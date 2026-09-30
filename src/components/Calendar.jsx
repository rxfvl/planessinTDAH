import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// item: { id, name, start, end, kind: 'joint' | 'mine' | 'other', plan? } (fechas 'yyyy-MM-dd')
export const itemsOnDay = (items, day) => {
  const d = format(day, 'yyyy-MM-dd');
  return items.filter(i => d >= i.start && d <= (i.end || i.start));
};

const chipClass = (item, idx) =>
  item.kind === 'mine' ? 'chip-violet' : item.kind === 'other' ? 'chip-teal' : idx % 2 ? 'chip-green' : 'chip-pink';

const MAX_CHIPS = 3;

export default function Calendar({ items, onDayClick }) {
  const [current, setCurrent] = useState(new Date());
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(current), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(current), { weekStartsOn: 1 }),
  });
  const order = new Map(items.filter(i => i.kind === 'joint').map((i, n) => [i.id, n]));

  return (
    <div className="card glass" style={{ padding: '1.25rem' }}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrent(subMonths(current, 1))} className="icon-btn" title="Mes anterior"><ChevronLeft size={22} /></button>
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-xl" style={{ textTransform: 'capitalize' }}>{format(current, 'MMMM yyyy', { locale: es })}</h2>
          <button onClick={() => setCurrent(new Date())} className="badge badge-green">Hoy</button>
        </div>
        <button onClick={() => setCurrent(addMonths(current, 1))} className="icon-btn" title="Mes siguiente"><ChevronRight size={22} /></button>
      </div>

      <div className="cal-grid mb-2">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="cal-head">{d}</div>)}
      </div>

      <div className="cal-grid">
        {days.map(day => {
          const list = itemsOnDay(items, day);
          return (
            <div
              key={day.toISOString()}
              role="button" tabIndex={0}
              onClick={() => onDayClick(day, list)}
              onKeyDown={e => e.key === 'Enter' && onDayClick(day, list)}
              className={`cal-cell${isToday(day) ? ' today' : ''}${isSameMonth(day, current) ? '' : ' out'}`}
            >
              <span className="cal-num">{format(day, 'd')}</span>
              {list.slice(0, MAX_CHIPS).map(i => {
                const cls = `cal-chip ${chipClass(i, order.get(i.id))}`;
                return i.kind === 'joint'
                  ? <Link key={i.id} to={`/plan/${i.id}`} onClick={e => e.stopPropagation()} className={cls} title={i.name}>{i.name}</Link>
                  : <span key={i.id} className={cls} title={i.name}>{i.name}</span>;
              })}
              {list.length > MAX_CHIPS && <span className="cal-more">+{list.length - MAX_CHIPS} más</span>}
            </div>
          );
        })}
      </div>

      <div className="legend mt-4">
        <span className="badge">Plan conjunto</span>
        <span className="badge badge-green">Plan conjunto</span>
        <span className="badge badge-violet">Personal mío</span>
        <span className="badge badge-teal">Personal del otro</span>
      </div>
    </div>
  );
}
