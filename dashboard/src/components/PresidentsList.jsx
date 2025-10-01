import { FaWhatsapp } from 'react-icons/fa'

const buildWhatsappUrl = (president) => {
  const digits = president.phone?.replace(/\D/g, '') || ''
  if (!digits) return null
  const normalized = digits.startsWith('52') ? digits : `52${digits}`
  const text = encodeURIComponent(
    `Compañera/compañero ${president.name}, seguimos construyendo el Segundo Piso R21 MORENA en ${president.committeeName}.`
  )
  return `https://wa.me/${normalized}?text=${text}`
}

export default function PresidentsList({ presidents }) {
  if (!presidents.length) {
    return <div className="loading-state">Sin presidentes registrados todavía.</div>
  }

  return (
    <div className="president-list">
      {presidents.map((president) => {
        const whatsappUrl = buildWhatsappUrl(president)
        return (
          <div key={president.id} className="president-card">
            <strong>{president.name}</strong>
            <span>Comité: {president.committeeName}</span>
            <span>Teléfono: {president.phone}</span>
            <span>Correo: {president.email || 'Sin correo'}</span>
            {whatsappUrl ? (
              <button
                type="button"
                className="whatsapp-button"
                onClick={() => window.open(whatsappUrl, '_blank', 'noopener')}
              >
                <FaWhatsapp /> Enviar mensaje
              </button>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
