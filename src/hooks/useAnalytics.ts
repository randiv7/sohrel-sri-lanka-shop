import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  session_id?: string;
}

export const useAnalytics = () => {
  const trackEvent = async (event: AnalyticsEvent) => {
    try {
      // Generate session ID for tracking
      let sessionId = localStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('analytics_session_id', sessionId);
      }

      await supabase.functions.invoke('analytics-collector', {
        body: {
          event_type: event.event_type,
          event_data: event.event_data || {},
          session_id: event.session_id || sessionId
        }
      });
    } catch (error) {
      // Silently fail analytics - don't disrupt user experience
      console.warn('Analytics tracking failed:', error);
    }
  };

  return { trackEvent };
};