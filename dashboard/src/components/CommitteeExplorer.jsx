import { useEffect, useMemo, useState } from 'react'
import { FaFilePdf, FaWhatsapp, FaTimes } from 'react-icons/fa'
import { fetchCommitteeDocuments, getUploadUrl } from '../api/client'

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
  const [docsModalOpen, setDocsModalOpen] = useState(false)
  const [availableDocs, setAvailableDocs] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)

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

  const handleActaDownload = async () => {
    try {
      setLoadingDocs(true)
      const docs = await fetchCommitteeDocuments(selectedCommittee.id)
      if (!docs || docs.length === 0) {
        alert('Este comité no cuenta con actas o documentos digitales adjuntos.')
        return
      }
      if (docs.length === 1) {
        window.open(getUploadUrl(docs[0].filename), '_blank', 'noopener')
        return
      }
      setAvailableDocs(docs)
      setDocsModalOpen(true)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      alert('Error al consultar documentos.')
    } finally {
      setLoadingDocs(false)
    }
  }

  const whatsappNumber = normalizePhone(selectedCommittee.telefono)
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage(selectedCommittee)}`
    : null

  return (
    <>
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
              <button type="button" className="primary-button" onClick={handleActaDownload} disabled={loadingDocs} style={{ opacity: loadingDocs ? 0.7 : 1 }}>
                <FaFilePdf /> {loadingDocs ? 'Cargando...' : 'Imprimir acta'}
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
      {docsModalOpen && (
        <div className="modal-overlay" onClick={() => setDocsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Seleccionar documento</h3>
              <button className="close-button" onClick={() => setDocsModalOpen(false)}>
                <FaTimes size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Este comité tiene múltiples documentos. Seleccione el que desea visualizar:</p>
              <div className="document-list">
                {availableDocs.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    className="document-item-button"
                    onClick={() => {
                      window.open(getUploadUrl(doc.filename), '_blank', 'noopener')
                      setDocsModalOpen(false)
                    }}
                  >
                    <FaFilePdf size={20} />
                    <span>{doc.original_name}</span>
                    <small>{(doc.size / 1024).toFixed(1)} KB</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
