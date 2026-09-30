import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Plans from './pages/Plans';
import Ideas from './pages/Ideas';
import Personal from './pages/Personal';
import PlanDetail from './pages/PlanDetail';
import Login from './pages/Login';
import { listenToIdentity } from './lib/store';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToIdentity((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full" style={{ height: '100vh' }}>
        <div className="text-pink animate-fade-in text-2xl font-bold">Cargando...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route element={user ? <Layout user={user} /> : <Navigate to="/login" />}>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/planes" element={<Plans user={user} />} />
            <Route path="/ideas" element={<Ideas user={user} />} />
            <Route path="/personales" element={<Personal user={user} />} />
            <Route path="/plan/:id" element={<PlanDetail user={user} />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
