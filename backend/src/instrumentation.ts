// This file MUST be imported as a side-effect before any other module
// It sets up OpenTelemetry SDK with auto-instrumentations

const otelEnabled = process.env.OTEL_ENABLED === 'true'

// OTEL_SDK is initialised only when OTEL_ENABLED=true.
// In dev/test without a collector, importing @opentelemetry/sdk-node
// hangs the process even without calling start() — the import itself
// triggers resource detectors. Use a lazy dynamic import to avoid it.
let sdk: Awaited<ReturnType<typeof initSdk>> | null = null

if (otelEnabled) {
  sdk = await initSdk()
}

async function initSdk() {
  // Dynamic imports — these packages are never loaded unless OTEL_ENABLED=true.
  const { NodeSDK } = await import(
    '@opentelemetry/sdk-node'
  )
  const { getNodeAutoInstrumentations } = await import(
    '@opentelemetry/auto-instrumentations-node'
  )
  const { resourceFromAttributes } = await import('@opentelemetry/resources')
  const {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
    ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  } = await import('@opentelemetry/semantic-conventions')
  const { OTLPTraceExporter } = await import(
    '@opentelemetry/exporter-trace-otlp-proto'
  )
  const { OTLPMetricExporter } = await import(
    '@opentelemetry/exporter-metrics-otlp-proto'
  )
  const { PeriodicExportingMetricReader } = await import(
    '@opentelemetry/sdk-metrics'
  )

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'florhema-api',
    [ATTR_SERVICE_VERSION]: '1.0.0',
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]:
      process.env.NODE_ENV || 'development',
  })

  const sdk = new NodeSDK({
    resource,
    traceExporter: new OTLPTraceExporter({
      url: `http://${process.env.OTEL_COLLECTOR_HOST || 'localhost'}:4318/v1/traces`,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `http://${process.env.OTEL_COLLECTOR_HOST || 'localhost'}:4318/v1/metrics`,
      }),
      exportIntervalMillis: 5000,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  })

  sdk.start()
  return sdk
}

export async function shutdownSdk(): Promise<void> {
  if (sdk) {
    await sdk.shutdown()
  }
}

export default sdk
