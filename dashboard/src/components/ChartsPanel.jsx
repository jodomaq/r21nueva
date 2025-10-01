import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

const COLORS = ['#8b1e3f', '#b4375d', '#d65a7d', '#f08aa6', '#f6b4c7', '#fadbe2']

const formatTooltip = (value) => `${value.toLocaleString('es-MX')} comités`

const truncateLabel = (label, max = 18) => (label.length > max ? `${label.slice(0, max)}…` : label)

export default function ChartsPanel({ stats }) {
  const byUser = (stats?.by_user ?? []).slice(0, 8)
  const byType = stats?.by_type ?? []
  const byMunicipality = (stats?.by_municipality ?? []).slice(0, 10)
  const bySection = (stats?.by_section ?? []).slice(0, 10)

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>Comités por responsable</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byUser} margin={{ top: 12, right: 12, left: -16, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0d6dd" />
            <XAxis dataKey={(item) => truncateLabel(item.owner_name || item.owner_email)} angle={-20} dy={16} height={50} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip formatter={formatTooltip} cursor={{ fill: 'rgba(139,30,63,0.08)' }} />
            <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#8b1e3f">
              {byUser.map((entry, index) => (
                <Cell key={`user-${entry.owner_email}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Distribución por tipo de comité</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie dataKey="total" data={byType} innerRadius={60} outerRadius={95} paddingAngle={4}>
              {byType.map((entry, index) => (
                <Cell key={`type-${entry.type}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltip} />
            <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Impulso territorial por municipio</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byMunicipality} margin={{ top: 12, right: 16, left: -10, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0d6dd" />
            <XAxis dataKey={(item) => truncateLabel(item.label || 'Sin municipio', 16)} angle={-20} dy={16} height={50} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip formatter={formatTooltip} cursor={{ fill: 'rgba(139,30,63,0.08)' }} />
            <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#b4375d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Comités por sección</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={bySection} margin={{ top: 12, right: 16, left: -10, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0d6dd" />
            <XAxis dataKey={(item) => truncateLabel(item.code || item.label || 'Sin sección', 12)} angle={-20} dy={16} height={50} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip formatter={formatTooltip} cursor={{ fill: 'rgba(139,30,63,0.08)' }} />
            <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#d65a7d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
