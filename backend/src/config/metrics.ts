import { metrics } from '@opentelemetry/api'

const meter = metrics.getMeter('florhema-api', '1.0.0')

/**
 * Histogram for HTTP request duration.
 *
 * Unit is embedded in the name (`_seconds`) rather than set via the `unit`
 * option to prevent the OTel Collector Prometheus exporter from appending a
 * unit suffix. This keeps Prometheus metric names clean:
 *   `http_server_request_duration_seconds_bucket`
 *   `http_server_request_duration_seconds_sum`
 *   `http_server_request_duration_seconds_count`
 *
 * Record values in **seconds** (float, e.g. 0.123 for 123ms).
 */
export const httpRequestDuration = meter.createHistogram(
  'http_server_request_duration_seconds',
  {
    description: 'Duration of HTTP requests in seconds',
    boundaries: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  }
)

/**
 * Counter for total HTTP requests.
 *
 * Prometheus output via Collector: `http_requests_total`
 */
export const httpRequestsTotal = meter.createCounter('http_requests', {
  description: 'Total number of HTTP requests',
})

/**
 * UpDownCounter for active HTTP requests.
 *
 * Prometheus output via Collector: `http_requests_active` (no `_total` suffix
 * for UpDownCounter).
 */
export const httpRequestsActive = meter.createUpDownCounter(
  'http_requests_active',
  {
    description: 'Number of active HTTP requests',
  }
)
