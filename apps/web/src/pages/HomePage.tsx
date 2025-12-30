import { useEffect, useState } from 'react'

interface HealthResponse {
  status: string
  timestamp: string
  uptime?: number
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }
        return res.json()
      })
      .then((data: HealthResponse) => setHealth(data))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>🦷 Dental SaaS</h1>
      <p>Sistema de gestión para clínicas dentales</p>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>API Health Check</h3>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {health && (
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px' }}>
            {JSON.stringify(health, null, 2)}
          </pre>
        )}
        {!health && !error && <p>Loading...</p>}
      </div>
    </div>
  )
}
