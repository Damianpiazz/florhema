import type { Request, Response, NextFunction } from 'express'
import {
  httpRequestDuration,
  httpRequestsTotal,
  httpRequestsActive,
} from '@/config/metrics.js'

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = performance.now()

  // Increment active requests
  httpRequestsActive.add(1, {
    'http.method': req.method,
  })

  // Decrement active requests when response finishes
  res.on('finish', () => {
    const durationSeconds = (performance.now() - start) / 1000

    const route = req.route?.path ?? req.path

    const labels = {
      'http.method': req.method,
      'http.route': route,
      'http.status_code': res.statusCode,
    }

    httpRequestDuration.record(durationSeconds, labels)
    httpRequestsTotal.add(1, labels)
    httpRequestsActive.add(-1, {
      'http.method': req.method,
    })
  })

  next()
}
