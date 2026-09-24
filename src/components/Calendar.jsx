import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ plans, onDateClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState([]);

  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    setDays(eachDayOfInterval({ start, end }));
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="card glass">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-bold text-lg capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <button onClick={nextMonth} className="btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
          <div key={day} className="text-muted text-sm font-semibold">{day}</div>
        ))}
      </div>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {/* Empty slots for start of month padding */}
        {Array.from({ length: (startOfMonth(currentDate).getDay() + 6) % 7 }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        
        {days.map(day => {
          const hasPlan = plans.some(p => {
            const planDate = new Date(p.startDate);
            return isSameDay(planDate, day);
          });

          return (
            <button
              key={day.toString()}
              onClick={() => onDateClick && onDateClick(day)}
              className={`btn-outline ${hasPlan ? 'text-pink border-pink' : ''}`}
              style={{
                padding: '0.5rem 0',
                borderRadius: '8px',
                borderColor: hasPlan ? 'var(--accent-pink)' : 'var(--border-color)',
                backgroundColor: hasPlan ? 'rgba(255, 71, 133, 0.1)' : 'transparent',
                fontWeight: hasPlan ? 'bold' : 'normal'
              }}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
