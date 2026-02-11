import { MetricCard } from './MetricCard'

interface MetricSectionProps {
  title: string
  metrics: Array<{
    label: string
    value: number | string
    description?: string
  }>
}

export function MetricSection({ title, metrics }: MetricSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            label={metric.label}
            value={metric.value}
            description={metric.description}
          />
        ))}
      </div>
    </div>
  )
}
