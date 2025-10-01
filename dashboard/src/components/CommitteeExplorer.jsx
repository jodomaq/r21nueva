import { useEffect, useMemo, useState } from 'react'
import { FaFilePdf, FaWhatsapp } from 'react-icons/fa'

const normalizePhone = (rawPhone) => {
  if (!rawPhone) return null
  const digits = rawPhone.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('52')) return digits
  return `52${digits}`
}

const whatsappMessage = (committee) =>
  encodeURIComponent(
    `Hola ${committee.presidente}, te saluda la coordinación del Segundo Piso R21 MORENA en Michoacán para reforzar nuestro comité ${committee.name}.`
  )

export default function CommitteeExplorer({ committees, onDownloadActa }) {
  const [selectedId, setSelectedId] = useState(() => committees[0]?.id ?? null)

  useEffect(() => {
    if (!committees.length) {
      setSelectedId(null)
      return
    }
    if (!committees.some((committee) => committee.id === selectedId)) {
      setSelectedId(committees[0].id)
    }
  }, [committees, selectedId])

  const selectedCommittee = useMemo(
    () => committees.find((committee) => committee.id === selectedId) ?? committees[0] ?? null,
    [committees, selectedId],
  )

  if (!committees.length || !selectedCommittee) {
    return <div className="loading-state">Aún no se registran comités. El Segundo Piso nos necesita en territorio.</div>
  }

  const handleActaDownload = () => onDownloadActa(selectedCommittee.id)

  const whatsappNumber = normalizePhone(selectedCommittee.telefono)
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage(selectedCommittee)}`
    : null

  return (
    <div className="committee-layout">
      <div className="committee-list">
        {committees.map((committee) => (
          <button
            key={committee.id}
            type="button"
            className={`committee-card${committee.id === selectedCommittee.id ? ' committee-card--active' : ''}`}
            onClick={() => setSelectedId(committee.id)}
          >
            <strong>{committee.name}</strong>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              {committee.type} · {committee.section_number || 'Sin sección'}
            </div>
            <div className="tag" style={{ marginTop: '0.4rem', width: 'fit-content' }}>
              {committee.total_members} integrantes
            </div>
          </button>
        ))}
      </div>

      <div className="committee-detail">
        <div className="committee-detail__header">
          <div>
            <h3>{selectedCommittee.name}</h3>
            <div style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              Presidencia: <strong>{selectedCommittee.presidente || 'Sin registro'}</strong>
            </div>
            <div style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              Contacto: {selectedCommittee.email || 'Sin correo'} · {selectedCommittee.telefono || 'Sin teléfono'}
            </div>
          </div>
          <div className="button-row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="primary-button" onClick={handleActaDownload}>
              <FaFilePdf /> Imprimir acta
            </button>
            {whatsappUrl ? (
              <button
                type="button"
                className="whatsapp-button"
                onClick={() => window.open(whatsappUrl, '_blank', 'noopener')}
              >
                <FaWhatsapp /> WhatsApp
              </button>
            ) : null}
          </div>
        </div>

        <div className="committee-detail__meta">
          <span>Tipo: <strong>{selectedCommittee.type}</strong></span>
          <span>Sección: <strong>{selectedCommittee.section_number || 'N/D'}</strong></span>
          <span>Municipio: <strong>{selectedCommittee.section?.nombre_municipio || 'N/D'}</strong></span>
          <span>Total integrantes: <strong>{selectedCommittee.total_members}</strong></span>
        </div>

        <div>
          <h4 style={{ marginBottom: '0.6rem' }}>Integrantes</h4>
          <div className="members-list">
            {selectedCommittee.members.length ? (
              selectedCommittee.members.map((member) => (
                <div key={member.id} className="member-card">
                  <strong>{member.full_name}</strong>
                  <span>Teléfono: {member.phone || 'Sin dato'}</span>
                  <span>Correo: {member.email || 'Sin dato'}</span>
                  <span>Sección: {member.section_number || 'N/D'}</span>
                </div>
              ))
            ) : (
              <div className="status-banner">Sin integrantes capturados en la plataforma.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
