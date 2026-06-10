import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../../api/eventService';

const CreateEventPage = () => {
  const [form, setForm] = useState({ name:'', description:'', category:'', venue:'', eventDate:'', capacity:'', price:'', organizerId:'00000000-0000-0000-0000-000000000001' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await createEvent({ ...form, capacity: parseInt(form.capacity), price: parseFloat(form.price) });
      setSuccess('¡Evento creado exitosamente!');
      setTimeout(() => navigate('/organizer'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el evento.');
    } finally { setLoading(false); }
  };

  const fields = [
    { key:'name', label:'Nombre del evento', type:'text', required:true },
    { key:'description', label:'Descripción', type:'text', required:false },
    { key:'category', label:'Categoría', type:'text', required:false },
    { key:'venue', label:'Lugar', type:'text', required:true },
    { key:'eventDate', label:'Fecha y hora', type:'datetime-local', required:true },
    { key:'capacity', label:'Capacidad', type:'number', required:true },
    { key:'price', label:'Precio (COP)', type:'number', required:true },
  ];

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',padding:'2rem'}}>
      <div style={{maxWidth:'600px',margin:'0 auto',background:'white',padding:'2rem',borderRadius:'12px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem'}}>
          <button onClick={() => navigate('/organizer')}
            style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer'}}>←</button>
          <h2 style={{margin:0}}>Crear nuevo evento</h2>
        </div>
        {error && <div style={{background:'#fee',color:'#c00',padding:'0.7rem',borderRadius:'8px',marginBottom:'1rem'}}>{error}</div>}
        {success && <div style={{background:'#efe',color:'#060',padding:'0.7rem',borderRadius:'8px',marginBottom:'1rem'}}>{success}</div>}
        <form onSubmit={handleSubmit}>
          {fields.map(({ key, label, type, required }) => (
            <div key={key} style={{marginBottom:'1rem'}}>
              <label style={{display:'block',marginBottom:'0.3rem',fontWeight:'500'}}>{label}</label>
              <input style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #ddd',boxSizing:'border-box'}}
                type={type} value={form[key]} required={required}
                onChange={(e) => setForm({...form, [key]: e.target.value})} />
            </div>
          ))}
          <button style={{width:'100%',padding:'0.8rem',background:'#6c3ec5',color:'white',border:'none',borderRadius:'8px',fontSize:'1rem',cursor:'pointer'}}
            type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear evento'}</button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
