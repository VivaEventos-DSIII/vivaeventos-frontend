import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCatalog, updatePrice, cancelEvent } from '../../api/eventService';
import { getEventSales, getEventStatistics } from '../../api/orderService';
import { useAuth } from '../../context/AuthContext';

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sales, setSales] = useState(null);
  const [stats, setStats] = useState(null);
  const [priceModal, setPriceModal] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [message, setMessage] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await getCatalog();
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch { setMessage('Error al cargar eventos.'); }
    finally { setLoading(false); }
  };

  const loadSalesAndStats = async (eventId) => {
    try {
      const [salesRes, statsRes] = await Promise.all([
        getEventSales(eventId),
        getEventStatistics(eventId),
      ]);
      setSales(salesRes.data);
      setStats(statsRes.data);
    } catch { setSales(null); setStats(null); }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    loadSalesAndStats(event.id);
  };

  const handleUpdatePrice = async () => {
    try {
      await updatePrice(priceModal.id, { newPrice: parseFloat(newPrice) });
      setMessage('✅ Precio actualizado correctamente');
      setPriceModal(null); setNewPrice('');
      loadEvents();
    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Error al actualizar precio');
    }
  };

  const handleCancelEvent = async () => {
    try {
      await cancelEvent(cancelModal.id, { reason: cancelReason });
      setMessage('✅ Evento cancelado correctamente');
      setCancelModal(null); setCancelReason('');
      setSelectedEvent(null);
      loadEvents();
    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Error al cancelar evento');
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8'}}>
      <nav style={{background:'#6c3ec5',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1 style={{color:'white',margin:0,fontSize:'1.5rem'}}>🎫 VivaEventos — Panel Organizador</h1>
        <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
          <span style={{color:'white'}}>{user?.email}</span>
          <button onClick={() => navigate('/organizer/create')}
            style={{background:'white',color:'#6c3ec5',border:'none',padding:'0.4rem 1rem',borderRadius:'6px',cursor:'pointer',fontWeight:'bold'}}>
            + Nuevo evento
          </button>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{background:'rgba(255,255,255,0.2)',color:'white',border:'none',padding:'0.4rem 1rem',borderRadius:'6px',cursor:'pointer'}}>
            Salir
          </button>
        </div>
      </nav>

      {message && (
        <div style={{margin:'1rem 2rem',padding:'0.8rem',borderRadius:'8px',background: message.includes('✅') ? '#efe' : '#fee',color: message.includes('✅') ? '#060' : '#c00'}}>
          {message} <button onClick={() => setMessage('')} style={{float:'right',background:'none',border:'none',cursor:'pointer'}}>✕</button>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'2rem',padding:'2rem',maxWidth:'1400px',margin:'0 auto'}}>
        {/* Lista de eventos */}
        <div>
          <h2 style={{marginTop:0}}>Mis eventos</h2>
          {loading ? <p>Cargando...</p> :
            events.length === 0 ? <p style={{color:'#555'}}>No hay eventos. Crea uno nuevo.</p> :
            events.map((event) => (
              <div key={event.id} onClick={() => handleSelectEvent(event)}
                style={{background: selectedEvent?.id === event.id ? '#6c3ec5' : 'white',
                  color: selectedEvent?.id === event.id ? 'white' : '#333',
                  padding:'1rem',borderRadius:'10px',marginBottom:'0.8rem',cursor:'pointer',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.05)',transition:'all 0.2s'}}>
                <strong>{event.name}</strong>
                <p style={{margin:'0.3rem 0',fontSize:'0.85rem',opacity:0.8}}>📍 {event.venue}</p>
                <p style={{margin:'0.3rem 0',fontSize:'0.85rem',opacity:0.8}}>
                  ${event.price?.toLocaleString('es-CO')}
                </p>
                <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
                  <button onClick={(e) => { e.stopPropagation(); setPriceModal(event); }}
                    style={{padding:'0.3rem 0.7rem',background: selectedEvent?.id === event.id ? 'rgba(255,255,255,0.3)' : '#eee',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'0.8rem'}}>
                    💰 Precio
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCancelModal(event); }}
                    style={{padding:'0.3rem 0.7rem',background:'#fee',color:'#c00',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'0.8rem'}}>
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            ))
          }
        </div>

        {/* Panel de ventas y estadísticas */}
        <div>
          {!selectedEvent ? (
            <div style={{background:'white',padding:'2rem',borderRadius:'12px',textAlign:'center',color:'#555',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <p style={{fontSize:'3rem'}}>📊</p>
              <p>Selecciona un evento para ver sus ventas y estadísticas</p>
            </div>
          ) : (
            <>
              <h2 style={{marginTop:0}}>{selectedEvent.name}</h2>

              {/* Resumen de ventas */}
              {sales && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
                  {[
                    { label:'Boletas vendidas', value: sales.ticketsSold || 0, icon:'🎫' },
                    { label:'Órdenes', value: sales.totalOrders || 0, icon:'📋' },
                    { label:'Ingresos', value: `$${(sales.totalRevenue || 0).toLocaleString('es-CO')}`, icon:'💰' },
                  ].map(({ label, value, icon }) => (
                    <div key={label} style={{background:'white',padding:'1.2rem',borderRadius:'10px',textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                      <div style={{fontSize:'2rem'}}>{icon}</div>
                      <div style={{fontSize:'1.5rem',fontWeight:'bold',color:'#6c3ec5'}}>{value}</div>
                      <div style={{fontSize:'0.8rem',color:'#555'}}>{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Estadísticas por tipo */}
              {stats?.salesByTicketType && Object.keys(stats.salesByTicketType).length > 0 && (
                <div style={{background:'white',padding:'1.5rem',borderRadius:'12px',marginBottom:'1.5rem',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                  <h3 style={{marginTop:0}}>Ventas por tipo de boleta</h3>
                  {Object.entries(stats.salesByTicketType).map(([type, data]) => (
                    <div key={type} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.7rem',background:'#f8f4ff',borderRadius:'8px',marginBottom:'0.5rem'}}>
                      <span style={{fontWeight:'500'}}>{type}</span>
                      <span>{data.tickets} boletas</span>
                      <span style={{color:'#6c3ec5',fontWeight:'bold'}}>${data.revenue?.toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Hora pico */}
              {stats?.peakHour !== null && stats?.peakHour !== undefined && (
                <div style={{background:'white',padding:'1.5rem',borderRadius:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                  <h3 style={{marginTop:0}}>Tendencias</h3>
                  <p>⏰ Hora pico de ventas: <strong>{stats.peakHour}:00 - {stats.peakHour + 1}:00</strong></p>
                  {stats.averageOrderValue > 0 && (
                    <p>💳 Ticket promedio: <strong>${stats.averageOrderValue?.toLocaleString('es-CO')}</strong></p>
                  )}
                </div>
              )}

              {(!sales || sales.ticketsSold === 0) && (
                <div style={{background:'white',padding:'2rem',borderRadius:'12px',textAlign:'center',color:'#555',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                  No hay ventas registradas para este evento aún.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal actualizar precio */}
      {priceModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'white',padding:'2rem',borderRadius:'12px',width:'100%',maxWidth:'400px'}}>
            <h3 style={{marginTop:0}}>Actualizar precio — {priceModal.name}</h3>
            <p style={{color:'#555'}}>Precio actual: <strong>${priceModal.price?.toLocaleString('es-CO')}</strong></p>
            <input style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #ddd',boxSizing:'border-box',marginBottom:'1rem'}}
              type="number" placeholder="Nuevo precio (COP)" value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)} />
            <div style={{display:'flex',gap:'1rem'}}>
              <button onClick={handleUpdatePrice}
                style={{flex:1,padding:'0.8rem',background:'#6c3ec5',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>
                Actualizar
              </button>
              <button onClick={() => { setPriceModal(null); setNewPrice(''); }}
                style={{flex:1,padding:'0.8rem',background:'#eee',border:'none',borderRadius:'8px',cursor:'pointer'}}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cancelar evento */}
      {cancelModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'white',padding:'2rem',borderRadius:'12px',width:'100%',maxWidth:'400px'}}>
            <h3 style={{marginTop:0}}>Cancelar evento — {cancelModal.name}</h3>
            <p style={{color:'#c00'}}>⚠️ Esta acción notificará a todos los compradores.</p>
            <textarea style={{width:'100%',padding:'0.7rem',borderRadius:'8px',border:'1px solid #ddd',boxSizing:'border-box',marginBottom:'1rem',minHeight:'80px'}}
              placeholder="Motivo de cancelación (opcional)" value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)} />
            <div style={{display:'flex',gap:'1rem'}}>
              <button onClick={handleCancelEvent}
                style={{flex:1,padding:'0.8rem',background:'#c00',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>
                Confirmar cancelación
              </button>
              <button onClick={() => { setCancelModal(null); setCancelReason(''); }}
                style={{flex:1,padding:'0.8rem',background:'#eee',border:'none',borderRadius:'8px',cursor:'pointer'}}>
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
