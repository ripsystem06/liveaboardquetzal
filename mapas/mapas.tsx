import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';

// --- COMPONENTE PRELOADER ---
const Preloader = ({ onComplete }) => {
  const loaderRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    // Línea de tiempo de la animación
    const tl = anime.timeline({
      easing: 'easeInOutQuad',
      complete: () => onComplete() // Notifica que terminó
    });

    tl.add({
      targets: textRef.current,
      opacity: [0, 1],
      letterSpacing: ['10px', '2px'],
      duration: 1500,
      delay: 500
    })
    .add({
      targets: loaderRef.current,
      opacity: 0,
      duration: 1000,
      easing: 'linear',
      delay: 500
    });
  }, [onComplete]);

  return (
    <div ref={loaderRef} style={loaderOverlayStyle}>
      <h1 ref={textRef} style={loaderTextStyle}>EXPEDICIONES PACÍFICO</h1>
      <div className="loading-bar"></div>
      <style>{`
        .loading-bar {
          width: 100px; height: 2px; background: #00d4ff;
          margin-top: 20px; animation: expand 2s infinite;
        }
        @keyframes expand {
          0% { width: 0; opacity: 0; }
          50% { width: 150px; opacity: 1; }
          100% { width: 300px; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ACTUALIZADO ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  // ... resto de tus estados ...

  return (
    <div style={{ background: '#0a0f12', height: '100vh', position: 'relative' }}>
      
      {/* Se muestra solo si loading es true */}
      {loading && <Preloader onComplete={() => setLoading(false)} />}

      {/* Contenido principal (Mapa y UI) */}
      <div style={{ opacity: loading ? 0 : 1, transition: 'opacity 1s ease-in' }}>
        <header style={headerStyle}>
            <h1>OCEANIC</h1>
            <p>Explora las islas remotas</p>
        </header>

        {/* Aquí va tu MapContainer que hicimos antes */}
        <MapContainer ... />
        
        {/* Aquí va tu Panel de Información */}
        <aside ... />
      </div>
    </div>
  );
}

// --- ESTILOS ---
const loaderOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  background: '#0a0f12', zIndex: 9999, display: 'flex',
  flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
};

const loaderTextStyle = {
  color: 'white', fontSize: '1.5rem', fontWeight: 'lighter', letterSpacing: '4px'
};