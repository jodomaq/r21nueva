export default function DocumentsGallery({ documents }) {
  if (!documents.length) {
    return <div className="loading-state">Cuando se carguen evidencias aparecerán aquí.</div>
  }

  return (
    <div className="gallery-grid">
      {documents.slice(0, 12).map((doc) => (
        <a key={doc.id} className="gallery-card" href={doc.url} target="_blank" rel="noreferrer">
          <img src={`${import.meta.env.VITE_API_BASE+'/api' || 'http://localhost:8000'}${doc.url}`} alt={doc.original_name} loading="lazy" />
          <div className="gallery-card__caption">
            <strong>{doc.committee_name}</strong>
            <div>{doc.original_name}</div>
          </div>
        </a>
      ))}
    </div>
  )
}
