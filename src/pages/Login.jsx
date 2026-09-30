import { useState } from 'react';
import { setIdentity } from '../lib/store';
import { Heart, Lock } from 'lucide-react';
import { APP_CONFIG } from '../config';

export default function Login() {
  const [pin, setPin] = useState('');
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [error, setError] = useState('');

  const handlePinSubmit = (e) => {
    e.preventDefault();
    setPinUnlocked(true);
    setError('');
  };

  const handleSelectUser = async (userName) => {
    try {
      await setIdentity(userName, pin);
    } catch (err) {
      console.error(err);
      setError(err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'PIN incorrecto. Intenta de nuevo.'
        : `Error de acceso (${err.code}). Revisa la configuración de Firebase.`);
      setPin('');
      setPinUnlocked(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full" style={{ padding: '20px' }}>
      <div className="card glass animate-fade-in w-full" style={{ maxWidth: '400px' }}>
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Heart size={40} className="text-pink animate-float" fill="var(--accent-pink)" style={{ filter: 'drop-shadow(0 0 15px rgba(255, 42, 122, 0.6))' }} />
            <h1 className="text-3xl font-extrabold text-gradient">{APP_CONFIG.appName}</h1>
          </div>
          <p className="text-muted text-center text-sm">Espacio exclusivo para planificar juntos</p>
        </div>

        {!pinUnlocked ? (
          <form onSubmit={handlePinSubmit} className="flex flex-col mt-4">
            <div className="input-group">
              <label className="flex items-center gap-2">
                <Lock size={16} /> Código Secreto
              </label>
              <input 
                type="password" 
                className="input-field text-center tracking-widest text-xl" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                required 
                autoFocus
              />
            </div>
            
            {error && <p className="text-pink text-sm text-center mb-4">{error}</p>}
            
            <button type="submit" className="btn btn-pink mt-4">
              Desbloquear
            </button>
          </form>
        ) : (
          <div className="flex flex-col mt-4 animate-fade-in w-full">
            <p className="text-center text-xl font-medium" style={{ marginBottom: '2rem' }}>¿Quién eres?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
              <button 
                onClick={() => handleSelectUser(APP_CONFIG.user1)} 
                className="btn btn-outline transition-all w-full flex justify-center items-center"
                style={{ aspectRatio: '1 / 1', fontSize: '1.5rem', borderRadius: '16px', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-green)'; e.currentTarget.style.color = 'var(--accent-green)'; e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'; e.currentTarget.style.color = ''; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {APP_CONFIG.user1}
              </button>
              <button 
                onClick={() => handleSelectUser(APP_CONFIG.user2)} 
                className="btn btn-outline transition-all w-full flex justify-center items-center"
                style={{ aspectRatio: '1 / 1', fontSize: '1.5rem', borderRadius: '16px', borderColor: 'rgba(255, 71, 133, 0.3)' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-pink)'; e.currentTarget.style.color = 'var(--accent-pink)'; e.currentTarget.style.backgroundColor = 'rgba(255, 71, 133, 0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 71, 133, 0.3)'; e.currentTarget.style.color = ''; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {APP_CONFIG.user2}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
