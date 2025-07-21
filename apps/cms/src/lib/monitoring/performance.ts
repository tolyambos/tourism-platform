import * as Sentry from '@sentry/nextjs';

// Custom performance monitoring
export class PerformanceMonitor {
  private static transactions = new Map<string, any>();
  
  // Start a performance transaction
  static startTransaction(name: string, op: string = 'http.server') {
    const transaction = Sentry.startTransaction({
      name,
      op,
      tags: {
        source: 'custom',
      },
    });
    
    Sentry.getCurrentHub().getScope()?.setSpan(transaction);
    this.transactions.set(name, transaction);
    
    return transaction;
  }
  
  // End a transaction
  static endTransaction(name: string, status: 'ok' | 'error' = 'ok') {
    const transaction = this.transactions.get(name);
    if (transaction) {
      transaction.setStatus(status);
      transaction.finish();
      this.transactions.delete(name);
    }
  }
  
  // Measure async function performance
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    op: string = 'function'
  ): Promise<T> {
    const transaction = this.startTransaction(name, op);
    
    try {
      const result = await fn();
      transaction.setStatus('ok');
      return result;
    } catch (error) {
      transaction.setStatus('error');
      throw error;
    } finally {
      transaction.finish();
    }
  }
  
  // Measure sync function performance
  static measure<T>(
    name: string,
    fn: () => T,
    op: string = 'function'
  ): T {
    const transaction = this.startTransaction(name, op);
    
    try {
      const result = fn();
      transaction.setStatus('ok');
      return result;
    } catch (error) {
      transaction.setStatus('error');
      throw error;
    } finally {
      transaction.finish();
    }
  }
  
  // Track custom metrics
  static trackMetric(
    name: string,
    value: number,
    unit: string = 'none',
    tags?: Record<string, string>
  ) {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
    
    if (transaction) {
      transaction.setMeasurement(name, value, unit);
      
      if (tags) {
        Object.entries(tags).forEach(([key, val]) => {
          transaction.setTag(key, val);
        });
      }
    }
  }
  
  // Track API response times
  static trackApiCall(
    endpoint: string,
    method: string,
    duration: number,
    status: number
  ) {
    this.trackMetric('api.response_time', duration, 'millisecond', {
      endpoint,
      method,
      status: status.toString(),
    });
  }
  
  // Track database query times
  static trackDatabaseQuery(
    operation: string,
    table: string,
    duration: number
  ) {
    this.trackMetric('db.query_time', duration, 'millisecond', {
      operation,
      table,
    });
  }
}