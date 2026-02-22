// Performance monitoring utilities for tracking Success Criteria metrics

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
}

const metrics: PerformanceMetric[] = []

/**
 * Start tracking a performance metric
 */
export const startMetric = (name: string): string => {
  const id = `${name}_${Date.now()}`
  metrics.push({
    name,
    startTime: performance.now(),
  })
  return id
}

/**
 * End tracking a performance metric
 */
export const endMetric = (name: string): number | null => {
  const metric = metrics.find((m) => m.name === name && !m.endTime)
  if (!metric) {
    console.warn(`Metric ${name} not found`)
    return null
  }

  metric.endTime = performance.now()
  metric.duration = metric.endTime - metric.startTime

  // Log if exceeds threshold
  const thresholds: Record<string, number> = {
    'project-list-load': 3000, // SC-001: < 3 сек
    'kaiten-sync': 5000, // SC-003: < 5 сек
    'timeline-render': 1000, // SC-006: should be fast
  }

  const threshold = thresholds[name]
  if (threshold && metric.duration > threshold) {
    console.warn(`Performance warning: ${name} took ${metric.duration.toFixed(0)}ms (threshold: ${threshold}ms)`)
  }

  return metric.duration
}

/**
 * Get all metrics
 */
export const getMetrics = (): PerformanceMetric[] => {
  return metrics.filter((m) => m.duration !== undefined)
}

/**
 * Clear all metrics
 */
export const clearMetrics = (): void => {
  metrics.length = 0
}
