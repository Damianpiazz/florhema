// This file MUST be imported as a side-effect before any other module
// It sets up OpenTelemetry SDK with auto-instrumentations

import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { Resource } from '@opentelemetry/resources'
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions'

const resource = new Resource({
  [SEMRESATTRS_SERVICE_NAME]: 'florhema-api',
  [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
  [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
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

export async function shutdownSdk(): Promise<void> {
  await sdk.shutdown()
}

export default sdk
