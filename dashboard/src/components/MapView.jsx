import { useEffect, useRef } from 'react'
import L from 'leaflet'

const defaultCenter = [19.5665, -101.7068]

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const formatDate = (value) => new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })

export default function MapView({ points }) {
  const mapNodeRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersLayerRef = useRef(null)

  const validPoints = points.filter((point) => point.latitude && point.longitude)

  useEffect(() => {
    if (!mapNodeRef.current || !validPoints.length) {
      return
    }

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapNodeRef.current, {
        center: defaultCenter,
        zoom: 7,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstanceRef.current)
    }

    if (!markersLayerRef.current) {
      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current)
    } else {
      markersLayerRef.current.clearLayers()
    }

    validPoints.forEach((point) => {
      const marker = L.marker([Number(point.latitude), Number(point.longitude)], { icon: markerIcon })
      marker.bindPopup(
        `<strong>${point.name || 'Evento'}</strong><br/>${point.email || ''}<br/>${formatDate(point.created_at)}`,
      )
      marker.addTo(markersLayerRef.current)
    })

    if (validPoints.length > 1) {
      const bounds = L.latLngBounds(
        validPoints.map((point) => [Number(point.latitude), Number(point.longitude)]),
      )
      mapInstanceRef.current.fitBounds(bounds.pad(0.15))
    } else if (validPoints.length === 1) {
      mapInstanceRef.current.setView(
        [Number(validPoints[0].latitude), Number(validPoints[0].longitude)],
        11,
      )
    }
  }, [validPoints])

  useEffect(() => () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      markersLayerRef.current = null
    }
  }, [])

  if (!validPoints.length) {
    return <div className="loading-state">Aún sin ubicaciones georreferenciadas.</div>
  }

  return <div className="map-container" ref={mapNodeRef} />
}
