import { useEffect, useState, useRef } from 'react'
import './App.css'

const BACKEND_BASE = import.meta.env.VITE_API_BASE || 'https://plataformar21.mx'
//const BACKEND_BASE = 'http://localhost:8000/r21app'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

async function sha256(text) {
  const enc = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('')
}

async function deviceFingerprint() {
  const ua = navigator.userAgent
  const lang = navigator.language
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const hw = `${screen.width}x${screen.height}:${screen.colorDepth}`
  const nav = `${ua}|${lang}|${tz}|${hw}`
  return sha256(nav)
}

function App() {
  const [error, setError] = useState('')
  const [location, setLocation] = useState(null)
  const [ready, setReady] = useState(false)
  const buttonDivRef = useRef(null)

  useEffect(() => {
    // Geolocation prompt early to allow user grant
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy || 0)
          })
        },
        (err) => {
          setError(`Ubicación denegada: ${err.message}`)
        },
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 }
      )
    } else {
      setError('Geolocalización no soportada por tu navegador')
    }
    console.log(location)
  }, [])

  useEffect(() => {
    if (!window.google || !GOOGLE_CLIENT_ID) return
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (resp) => {
          try {
            const credential = resp.credential
            const device_id = await deviceFingerprint()
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

            const res = await fetch(`${BACKEND_BASE}/oauth/attendance/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                provider: 'google',
                credential,
                device_id,
                location,
                timezone
              })
            })

            const data = await res.json()
            if (!res.ok || !data.ok) {
              throw new Error(data.error || 'No se pudo registrar asistencia')
            }
            alert('Asistencia registrada ✔')
          } catch (e) {
            setError(e.message)
          }
        }
      })
      if (buttonDivRef.current) {
        window.google.accounts.id.renderButton(buttonDivRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill'
        })
      }
      setReady(true)
    } catch (e) {
      setError('No se pudo inicializar Google Sign-In')
    }
  }, [location])

  return (
    <div className="card" style={{ color: 'white', maxWidth: 420, margin: '48px auto', border: '4px solid #dddddd86', padding: 24, borderRadius: 8, backgroundColor: '#2c0101ff' }}>
      <hr />
      <div style={{ fontFamily: 'monospace', fontSize: 30, padding: 0 }}>Segundo piso de la cuarta transformación</div>
      <hr />
      <h2>Registro de asistencia</h2>
      <p>Inicia sesión con Google para registrar tu asistencia con ubicación.</p>
      <div ref={buttonDivRef} />
      {location && (
        <p style={{ fontSize: 12, color: '#555' }}>
          Ubicación: {location.lat?.toFixed(6)}, {location.lng?.toFixed(6)} (±{location.accuracy}m)
        </p>
      )}
      {!GOOGLE_CLIENT_ID && (
        <p style={{ color: 'red' }}>
          Falta configurar VITE_GOOGLE_CLIENT_ID en el frontend.
        </p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <a href="https://plataformar21.mx/condiciones.html" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#555' }}>Condiciones de uso</a>
        <span> | </span>
        <a href="https://plataformar21.mx/politicas.html" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#555' }}>Políticas de privacidad</a>
        <span> | </span>
        <a href='https://plataformar21.mx/eliminacion.html' target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#555' }}>Eliminación de datos</a>
      </div>
    </div>
  )
}

export default App
