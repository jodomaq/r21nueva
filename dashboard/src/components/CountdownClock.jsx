import { useEffect, useMemo, useState } from 'react'

const pad = (value) => String(value).padStart(2, '0')

const calculateDiff = (targetDate) => {
  const now = new Date()
  const diff = Math.max(targetDate.getTime() - now.getTime(), 0)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}

export default function CountdownClock({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateDiff(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateDiff(targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  const message = useMemo(() => {
    if (timeLeft.days <= 0 && timeLeft.hours <= 0 && timeLeft.minutes <= 0) {
      return '¡Es tiempo de decidir Michoacán!'
    }
    return `${timeLeft.days} días ${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`
  }, [timeLeft])

  return (
    <div className="countdown-badge" title="Cuenta regresiva hacia el 4 de julio de 2027">
      <span>Camino al voto consciente:</span>
      <strong>{message}</strong>
    </div>
  )
}
