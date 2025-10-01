export default function StatusBanner({ type = 'info', message }) {
  if (!message) return null

  if (type === 'error') {
    return <div className="error-state">{String(message)}</div>
  }

  return <div className="loading-state">{String(message)}</div>
}
