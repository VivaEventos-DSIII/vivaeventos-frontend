import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCatalog, filterEvents } from '../../api/eventService';
import { createOrder } from '../../api/orderService';
import { useAuth } from '../../context/AuthContext';

const CatalogPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', dateFrom: '', dateTo: '' });
  const [message, setMessage] = useState('');
  const [orderModal, setOrderModal] = useState(null);
  const [orderForm, setOrderForm] = useState({ ticketType: 'GENERAL', quantity: 1 });
  const [orderMsg, setOrderMsg] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadCatalog(); }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const res = await getCatalog();
      setEvents(Array.isArray(res.data) ? res.data : []);
      setMessage('');
    } catch { setMessage('Error al cargar eventos.'); }
    finally { setLoading(false); }
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      const res = await filterEvents(params);
      if (Array.isArray(res.data)) { setEvents(res.data); setMessage(''); }
      else { setEvents([]); setMessage(res.data?.message || 'No se encontraron eventos.'); }
    } catch { setMessage('Error al filtrar.'); }
    finally { setLoading(false); }
  };

  const handleOrder = async () => {
    if (!orderModal) return;
    setOrderMsg('');
    try {
      await createOrder({
        eventId: orderModal.id,
        customerId: user?.id || '00000000-0000-0000-0000-000000000001',
        ticketType: orderForm.ticketType,
        quantity: orderForm.quantity,
        idempotencyKey: `${orderModal.id}-${Date.now()}`,
      });
      setOrderMsg('✅ Orden creada exitosamente. Recibirás confirmación por email.');
      setTimeout(() => { setOrderModal(null); setOrderMsg(''); }, 3000);
    } catch (err) {
      setOrderMsg(err.response?.data?.message || '❌ Error al crear la orden.');
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8'}}>
      {/* Navbar */}
      <nav style={{background:'#6c3ec5',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1 style={{color:'white',margin:0,fontSize:'1.5rem'}}>🎫 VivaEventos</h1>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <span style={{color:'white'}}>{user?.email}</span>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{background:'rgba(255,255,255,0.2)',color:'white',border:'none',padding:'0.4rem 1rem',borderRadius:'6px',cursor:'pointer'}}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div style={{padding:'2rem',maxWidth:'1200px',margin:'0 auto'}}>
        {/* Filtros */}
        <div style={{background:'white',padding:'1.5rem',borderRadius:'12px',marginBottom:'2rem',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
          <h2 style={{marginTop:0,color:'#333'}}>Buscar eventos</h2>
          <form onSubmit={handleFilter} style={{display:'flex',gap:'1rem',flexWrap:'wrap',alignItems:'flex-end'}}>
            <div>
              <label style={{display:'block',marginBottom:'0.3rem',fontWeight:'500'}}>Categoría</label>
              <input style={{padding:'0.6rem',borderRadius:'8px',border:'1px solid #ddd',minWidth:'150px'}}
                placeholder="Ej: Música" value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})} />
            </div>
            <div>
              <label style={{display:'block',marginBottom:'0.3rem',fontWeight:'500'}}>Desde</label>
              <input style={{padding:'0.6rem',borderRadius:'8px',border:'1px solid #ddd'}}
                type="datetime-local" value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})} />
            </div>
            <div>
              <label style={{display:'block',marginBottom:'0.3rem',fontWeight:'500'}}>Hasta</label>
              <input style={{padding:'0.6rem',borderRadius:'8px',border:'1px solid #ddd'}}
                type="datetime-local" value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})} />
            </div>
            <button style={{padding:'0.6rem 1.5rem',background:'#6c3ec5',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}
              type="submit">Filtrar</button>
            <button type="button" onClick={loadCatalog}
              style={{padding:'0.6rem 1.5rem',background:'#eee',border:'none',borderRadius:'8px',cursor:'pointer'}}>
              Ver todos
            </button>
          </form>
        </div>

        {/* Lista de eventos */}
        {loading ? <p style={{textAlign:'center'}}>Cargando eventos...</p> :
          message ? <div style={{textAlign:'center',color:'#555',padding:'2rem'}}>{message}</div> :
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.5rem'}}>
            {events.map((event) => (
              <div key={event.id} style={{background:'white',borderRadius:'12px',padding:'1.5rem',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                <div style={{background:'#6c3ec5',color:'white',padding:'0.3rem 0.7rem',borderRadius:'20px',display:'inline-block',fontSize:'0.8rem',marginBottom:'0.8rem'}}>
                  {event.category || 'General'}
                </div>
                <h3 style={{margin:'0 0 0.5rem',color:'#333'}}>{event.name}</h3>
                <p style={{color:'#666',margin:'0.3rem 0'}}>📍 {event.venue}</p>
                <p style={{color:'#666',margin:'0.3rem 0'}}>📅 {new Date(event.eventDate).toLocaleDateString('es-CO', {dateStyle:'long'})}</p>
                <p style={{color:'#6c3ec5',fontWeight:'bold',fontSize:'1.1rem',margin:'0.5rem 0'}}>
                  ${event.price?.toLocaleString('es-CO')}
                </p>
                <button onClick={() => setOrderModal(event)}
                  style={{width:'100%',padding:'0.7rem',background:'#6c3ec5',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',marginTop:'0.5rem'}}>
                  Comprar boleta
                </button>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Modal de compra */}
      {orderModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'white',padding:'2rem',borderRadius:'12px',width:'100%',maxWidth:'400px'}}>
            <h2 style={{marginTop:0}}>Comprar boleta</h2>
            <p><strong>{orderModal.name}</strong></p>
            <p>📍 {orderModal.venue}</p>
            {orderMsg && <div style={{padding:'0.7rem',borderRadius:'8px',marginBottom:'1rem',background: orderMsg.includes('✅') ? '#efe' : '#fee',color: orderMsg.includes('✅') ? '#060' : '#c00'}}>{orderMsg}</div>}
            <div style={{marginBottom:'1rem'}}>
              <label style={{display:'block',marginBottom:'0.3rem',fontWeight:'500'}}>Tipo de boleta</label>
              <select style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #ddd'}}
                value={orderForm.ticketType} onChange={(e) => setOrderForm({...orderForm, ticketType: e.target.value})}>
                <option value="GENERAL">General</option>
                <option value="VIP">VIP</option>
                <option value="STUDENT">Estudiante</option>
              </select>
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label style={{display:'block',marginBottom:'0.3rem',fontWeight:'500'}}>Cantidad</label>
              <input style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #ddd',boxSizing:'border-box'}}
                type="number" min="1" max="10" value={orderForm.quantity}
                onChange={(e) => setOrderForm({...orderForm, quantity: parseInt(e.target.value)})} />
            </div>
            <div style={{display:'flex',gap:'1rem'}}>
              <button onClick={handleOrder}
                style={{flex:1,padding:'0.8rem',background:'#6c3ec5',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>
                Confirmar compra
              </button>
              <button onClick={() => { setOrderModal(null); setOrderMsg(''); }}
                style={{flex:1,padding:'0.8rem',background:'#eee',border:'none',borderRadius:'8px',cursor:'pointer'}}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
