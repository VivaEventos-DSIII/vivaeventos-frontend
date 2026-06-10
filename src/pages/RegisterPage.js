import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/authService';

const RegisterPage = () => {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({ email: form.email, password: form.password });
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const backendMsg = err.response?.data?.message || err.response?.data?.password;
      setError(backendMsg || 'Error al registrarse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8'}}>
      <div style={{background:'white',padding:'2rem',borderRadius:'12px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',width:'100%',maxWidth:'400px'}}>
        <h1 style={{textAlign:'center',color:'#6c3ec5'}}>🎫 VivaEventos</h1>
        <h2 style={{textAlign:'center',color:'#555',fontWeight:'normal',marginBottom:'1.5rem'}}>Crear cuenta</h2>

        {error && (
          <div style={{background:'#fee',color:'#c00',padding:'0.7rem',borderRadius:'8px',marginBottom:'1rem',textAlign:'center'}}>
            {error}
          </div>
        )}
        {success && (
          <div style={{background:'#efe',color:'#060',padding:'0.7rem',borderRadius:'8px',marginBottom:'1rem',textAlign:'center'}}>
            {success}
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
            <label style={{display:'block',marginBottom:'0.3rem',fontWeight:'500'}}>
              Contraseña <span style={{color:'#888',fontSize:'0.8rem'}}>(mínimo 8 caracteres)</span>
            </label>
            <input
              style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border: form.password.length > 0 && form.password.length < 8 ? '1px solid #c00' : '1px solid #ddd',fontSize:'1rem',boxSizing:'border-box'}}
              type="password" value={form.password} required
              onChange={(e) => setForm({...form, password: e.target.value})} />
            {form.password.length > 0 && form.password.length < 8 && (
              <p style={{color:'#c00',fontSize:'0.8rem',margin:'0.3rem 0 0'}}>
                Faltan {8 - form.password.length} caracteres
              </p>
            )}
          </div>

          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',marginBottom:'0.3rem',fontWeight:'500'}}>Confirmar contraseña</label>
            <input
              style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border: form.confirmPassword.length > 0 && form.password !== form.confirmPassword ? '1px solid #c00' : '1px solid #ddd',fontSize:'1rem',boxSizing:'border-box'}}
              type="password" value={form.confirmPassword} required
              onChange={(e) => setForm({...form, confirmPassword: e.target.value})} />
            {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
              <p style={{color:'#c00',fontSize:'0.8rem',margin:'0.3rem 0 0'}}>
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          <button
            style={{width:'100%',padding:'0.8rem',background: loading ? '#999' : '#6c3ec5',color:'white',border:'none',borderRadius:'8px',fontSize:'1rem',cursor: loading ? 'not-allowed' : 'pointer'}}
            type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p style={{textAlign:'center',marginTop:'1rem',color:'#555'}}>
          ¿Ya tienes cuenta? <Link to="/login" style={{color:'#6c3ec5'}}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
