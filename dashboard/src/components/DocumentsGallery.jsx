export default function DocumentsGallery({ documents }) {
  if (!documents.length) {
    return <div className="loading-state">Cuando se carguen evidencias aparecerán aquí.</div>
  }

  return (
    <div className="gallery-grid">
      {documents.slice(0, 12).map((doc) => {
        const isPdf = doc.url.toLowerCase().endsWith('.pdf')
        const imageUrl = isPdf
          ? 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg'
          : `${import.meta.env.VITE_API_BASE + '/api' || 'http://localhost:8000'}${doc.url}`

        return (
          <a
            key={doc.id}
            className="gallery-card"
            href={`${import.meta.env.VITE_API_BASE + '/api' + doc.url}`}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={imageUrl}
              alt={doc.original_name}
              loading="lazy"
              style={isPdf ? { objectFit: 'contain', padding: '50px' } : undefined}
            />
            <div className="gallery-card__caption">
              <strong>{doc.committee_name}</strong>
              <div>{doc.original_name}</div>
            </div>
          </a>
        )
      })}
    </div>
  )
}
