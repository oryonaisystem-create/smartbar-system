import { supabase } from './supabase';

export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';
export type LogType =
    | 'auth_success' | 'auth_error' | 'session_expired'
    | 'cashier_open' | 'cashier_close' | 'cashier_error'
    | 'realtime_connected' | 'realtime_disconnected' | 'realtime_error'
    | 'system_error' | 'network_error' | 'telemetry_init';

export interface TelemetryEvent {
    type: LogType;
    severity: LogSeverity;
    message?: string;
    context?: Record<string, any>;
    user_id?: string;
}

const LOG_Queue: TelemetryEvent[] = [];
const FLUSH_INTERVAL = 5000;
let flushTimer: any = null;

// Fire and forget mechanism
const processQueue = async () => {
    if (LOG_Queue.length === 0) return;

    const batch = [...LOG_Queue];
    LOG_Queue.length = 0; // Clear queue

    try {
        await supabase.from('telemetry_events').insert(
            batch.map(event => ({
                event_type: event.type,
                severity: event.severity,
                context: { ...event.context, message: event.message, url: window.location.pathname },
                user_id: event.user_id,
                created_at: new Date().toISOString()
            }))
        );
    } catch (e) {
        console.error('Failed to flush telemetry:', e);
    }
};

export const logEvent = (event: TelemetryEvent) => {
    // 1. Console Log (Dev Mode strength)
    const style = event.severity === 'error' || event.severity === 'critical'
        ? 'background: #ef4444; color: white; padding: 2px 5px; border-radius: 3px;'
        : event.severity === 'warning'
            ? 'background: #f59e0b; color: black; padding: 2px 5px; border-radius: 3px;'
            : 'background: #3b82f6; color: white; padding: 2px 5px; border-radius: 3px;';

    console.log(`%c[${event.type}]`, style, event.message || '', event.context || '');

    // 2. Queue for Database
    // We only log to DB if we have a supabase instance and it's not a local dev repetitive meaningless error
    // For now, log everything except extreme noise if any.

    // Get user ID if not provided
    if (!event.user_id) {
        // optimistically try to get from localStorage or memory if possible, 
        // but Supabase client might have it. 
        // Let's rely on caller to pass it or let backend handle it? 
        // Client side insert: we must pass user_id if we want it recorded against a user.
        // We can check supabase.auth.session() but that's async.
        // Let's settle for "Provided or Anonymous" for now, or sync check if cached.
        const session = localStorage.getItem('sb-kv-session'); // Implementation detail, might change
        // better:
    }

    LOG_Queue.push(event);

    if (!flushTimer) {
        flushTimer = setInterval(processQueue, FLUSH_INTERVAL);
    }

    // If critical, flush immediately
    if (event.severity === 'critical') {
        processQueue();
    }
};

// Hook for components
export const useLogger = () => {
    return { logEvent };
};
