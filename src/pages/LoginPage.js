import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/authService';
import { useAuth } from '../context/AuthContext';

// Decodifica el payload del JWT sin librerías externas
const decodeJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(form);
      console.log('Respuesta completa:', res);
      console.log('Data:', res.data);

      const { token } = res.data;
      console.log('Token:', token);

      const payload = decodeJwt(token);
      console.log('Payload JWT:', payload);

      const email = payload?.sub;
      const role = payload?.role;
      console.log('Email:', email, 'Role:', role);

      loginUser({ email, role }, token);
      navigate(role === 'ROLE_ADMIN' ? '/organizer' : '/catalog');
    } catch (err) {
      console.log('Error:', err);
      setError('Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8'}}>
      <div style={{background:'white',padding:'2rem',borderRadius:'12px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',width:'100%',maxWidth:'400px'}}>
        <h1 style={{textAlign:'center',color:'#6c3ec5'}}>🎫 VivaEventos</h1>
        <h2 style={{textAlign:'center',color:'#555',fontWeight:'normal',marginBottom:'1.5rem'}}>Iniciar sesión</h2>
        {error && (
          <div style={{background:'#fee',color:'#c00',padding:'0.7rem',borderRadius:'8px',marginBottom:'1rem',textAlign:'center'}}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',marginBottom:'0.3rem',fontWeight:'500'}}>Email</label>
            <input
              style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #ddd',fontSize:'1rem',boxSizing:'border-box'}}
              type="email" value={form.email} required placeholder="tu@email.com"
              onChange={(e) => setForm({...form, email: e.target.value})} />
          </div>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',marginBottom:'0.3rem',fontWeight:'500'}}>Contraseña</label>
            <input
              style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #ddd',fontSize:'1rem',boxSizing:'border-box'}}
              type="password" value={form.password} required placeholder="••••••••"
              onChange={(e) => setForm({...form, password: e.target.value})} />
          </div>
          <button
            style={{width:'100%',padding:'0.8rem',background: loading ? '#999' : '#6c3ec5',color:'white',border:'none',borderRadius:'8px',fontSize:'1rem',cursor: loading ? 'not-allowed' : 'pointer'}}
            type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'1rem',color:'#555'}}>
          ¿No tienes cuenta? <Link to="/register" style={{color:'#6c3ec5'}}>Regístrate</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
