import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/user-context';

interface ProductAnalytics {
  total_likes: number;
  total_views: number;
  total_clicks: number;
  unique_viewers: number;
  is_liked: boolean;
}

interface UseProductAnalyticsReturn {
  analytics: ProductAnalytics;
  loading: boolean;
  toggleLike: () => Promise<void>;
  trackView: () => Promise<void>;
  trackClick: (clickType: string, pageSource?: string) => Promise<void>;
}

export const useProductAnalytics = (productId: string): UseProductAnalyticsReturn => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<ProductAnalytics>({
    total_likes: 0,
    total_views: 0,
    total_clicks: 0,
    unique_viewers: 0,
    is_liked: false,
  });
  const [lastViewTrack, setLastViewTrack] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => {
    // Generate or get session ID for anonymous users
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  });

  // Use centralized user context
  const { getCurrentUser, getUserIP, getUserAgent } = useUser();

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    const timeoutId = setTimeout(() => {
      console.warn('Analytics fetch timeout');
      setLoading(false);
    }, 10000); // 10 second timeout

    try {
      setLoading(true);
      
      // Get analytics summary
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('product_analytics')
        .select('total_likes, total_views, total_clicks, unique_viewers')
        .eq('product_id', productId)
        .limit(1);

      if (analyticsError) {
        console.warn('Error fetching analytics:', analyticsError);
        // Continue with default values instead of throwing
      }
      
      const analytics = analyticsData && analyticsData.length > 0 ? analyticsData[0] : null;

      // Check if user has liked this product
      const currentUser = await getCurrentUser();
      let isLiked = false;

      if (currentUser) {
        const { data: likeData, error: likeError } = await supabase
          .from('product_likes')
          .select('id')
          .eq('product_id', productId)
          .eq('user_id', currentUser.id)
          .limit(1);
        
        if (likeError) {
          console.warn('Error checking user like:', likeError);
        }
        isLiked = !!(likeData && likeData.length > 0);
      } else {
        const { data: likeData, error: likeError } = await supabase
          .from('product_likes')
          .select('id')
          .eq('product_id', productId)
          .eq('session_id', sessionId)
          .limit(1);
        
        if (likeError) {
          console.warn('Error checking session like:', likeError);
        }
        isLiked = !!(likeData && likeData.length > 0);
      }

      setAnalytics({
        total_likes: analytics?.total_likes || 0,
        total_views: analytics?.total_views || 0,
        total_clicks: analytics?.total_clicks || 0,
        unique_viewers: analytics?.unique_viewers || 0,
        is_liked: isLiked,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [productId, sessionId]);

  // Toggle like
  const toggleLike = async () => {
    try {
      const currentUser = await getCurrentUser();
      const ip = await getUserIP();

      const { data, error } = await supabase.rpc('toggle_product_like', {
        p_product_id: productId,
        p_user_id: currentUser?.id || null,
        p_session_id: currentUser ? null : sessionId,
        p_ip_address: ip,
      });

      if (error) throw error;

      // Update local state
      setAnalytics(prev => ({
        ...prev,
        is_liked: data,
        total_likes: data ? prev.total_likes + 1 : prev.total_likes - 1,
      }));

      toast({
        title: data ? 'Produto curtido!' : 'Curtida removida',
        description: data ? 'Você curtiu este produto.' : 'Você removeu a curtida deste produto.',
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua curtida. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Track view with debounce
  const trackView = async () => {
    const now = Date.now();
    const DEBOUNCE_TIME = 5000; // 5 seconds debounce
    
    // Prevent multiple calls within debounce time
    if (now - lastViewTrack < DEBOUNCE_TIME) {
      return;
    }
    
    setLastViewTrack(now);
    
    try {
      const currentUser = await getCurrentUser();
      const ip = await getUserIP();
      const userAgent = getUserAgent();
      const referrer = document.referrer;

      const { error } = await supabase.rpc('track_product_view', {
        p_product_id: productId,
        p_user_id: currentUser?.id || null,
        p_session_id: currentUser ? null : sessionId,
        p_ip_address: ip,
        p_user_agent: userAgent,
        p_referrer: referrer || null,
      });

      if (error) throw error;

      // Update local state
      setAnalytics(prev => ({
        ...prev,
        total_views: prev.total_views + 1,
      }));
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Track click
  const trackClick = async (clickType: string, pageSource?: string) => {
    try {
      const currentUser = await getCurrentUser();
      const ip = await getUserIP();
      const userAgent = getUserAgent();

      const { error } = await supabase.rpc('track_product_click', {
        p_product_id: productId,
        p_click_type: clickType,
        p_page_source: pageSource || window.location.pathname,
        p_user_id: currentUser?.id || null,
        p_session_id: currentUser ? null : sessionId,
        p_ip_address: ip,
        p_user_agent: userAgent,
      });

      if (error) throw error;

      // Update local state
      setAnalytics(prev => ({
        ...prev,
        total_clicks: prev.total_clicks + 1,
      }));
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchAnalytics();

      // Set up real-time subscription for analytics updates
      const analyticsSubscription = supabase
        .channel(`product_analytics_${productId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'product_analytics',
            filter: `product_id=eq.${productId}`,
          },
          (payload) => {
            console.log('Analytics updated:', payload);
            // Refetch analytics when there's a change
            fetchAnalytics();
          }
        )
        .subscribe();

      // Set up subscription for likes
      const likesSubscription = supabase
        .channel(`product_likes_${productId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'product_likes',
            filter: `product_id=eq.${productId}`,
          },
          (payload) => {
            console.log('Likes updated:', payload);
            fetchAnalytics();
          }
        )
        .subscribe();

      // Set up subscription for views
      const viewsSubscription = supabase
        .channel(`product_views_${productId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'product_views',
            filter: `product_id=eq.${productId}`,
          },
          (payload) => {
            console.log('Views updated:', payload);
            fetchAnalytics();
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        analyticsSubscription.unsubscribe();
        likesSubscription.unsubscribe();
        viewsSubscription.unsubscribe();
      };
    }
  }, [productId, fetchAnalytics]);

  return {
    analytics,
    loading,
    toggleLike,
    trackView,
    trackClick,
  };
};