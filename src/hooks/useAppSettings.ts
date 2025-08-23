import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppSetting {
  key: string;
  value: string;
  description: string;
  category: string;
}

interface AppSettings {
  whatsapp_number: string;
  whatsapp_message: string;
  site_name: string;
  site_description: string;
  maintenance_mode: string;
  analytics_enabled: string;
}

interface UseAppSettingsReturn {
  settings: AppSettings;
  publicSettings: AppSetting[];
  loading: boolean;
  error: string | null;
  updateSetting: (key: string, value: string) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  getWhatsAppLink: (customMessage?: string) => string;
}

const defaultSettings: AppSettings = {
  whatsapp_number: '5511999999999',
  whatsapp_message: 'Olá! Gostaria de fazer um pedido dos seus doces artesanais.',
  site_name: 'Açucarada Doces',
  site_description: 'Doces artesanais feitos com amor e carinho',
  maintenance_mode: 'false',
  analytics_enabled: 'true'
};

export const useAppSettings = (): UseAppSettingsReturn => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [publicSettings, setPublicSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load public settings (accessible to all users)
  const loadPublicSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_public_settings');
      
      if (error) {
        console.error('Error loading public settings:', error);
        // Fallback to default settings if database is not available
        return;
      }

      if (data) {
        setPublicSettings(data);
        
        // Convert array to object for easier access
        const settingsObj = data.reduce((acc: Record<string, string>, setting: AppSetting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, string>);
        
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (err: unknown) {
      console.error('Error loading public settings:', err);
      setError('Erro ao carregar configurações públicas');
    }
  }, []);

  // Load all settings (admin only)
  const loadAllSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value, description, category')
        .order('category', { ascending: true })
        .order('key', { ascending: true });
      
      if (error) {
        console.error('Error loading all settings:', error);
        // Fallback to public settings
        await loadPublicSettings();
        return;
      }

      if (data) {
        setPublicSettings(data);
        
        // Convert array to object for easier access
        const settingsObj = data.reduce((acc: Record<string, string>, setting: AppSetting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, string>);
        
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (err: unknown) {
      console.error('Error loading all settings:', err);
      // Fallback to public settings
      await loadPublicSettings();
    }
  }, [loadPublicSettings]);

  // Check if user is admin and load appropriate settings
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated and admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.role === 'admin') {
          await loadAllSettings();
        } else {
          await loadPublicSettings();
        }
      } else {
        await loadPublicSettings();
      }
    } catch (err: unknown) {
      console.error('Error checking user role:', err);
      await loadPublicSettings();
    } finally {
      setLoading(false);
    }
  }, [loadAllSettings, loadPublicSettings]);

  // Update a setting (admin only)
  const updateSetting = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('update_app_setting', {
        setting_key: key,
        setting_value: value
      });
      
      if (error) {
        console.error('Error updating setting:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao atualizar configuração: ' + error.message
        });
        return false;
      }
      
      if (data) {
        // Update local state
        setSettings(prev => ({ ...prev, [key]: value }));
        setPublicSettings(prev => 
          prev.map(setting => 
            setting.key === key ? { ...setting, value } : setting
          )
        );
        
        toast({
          title: 'Sucesso',
          description: 'Configuração atualizada com sucesso'
        });
        return true;
      }
      
      return false;
    } catch (err: unknown) {
      console.error('Error updating setting:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao atualizar configuração'
      });
      return false;
    }
  }, [toast]);

  // Refresh settings
  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  // Generate WhatsApp link with current settings
  const getWhatsAppLink = useCallback((customMessage?: string) => {
    const number = settings.whatsapp_number;
    const message = customMessage || settings.whatsapp_message;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${number}?text=${encodedMessage}`;
  }, [settings.whatsapp_number, settings.whatsapp_message]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Set up real-time subscription for settings changes
  useEffect(() => {
    const subscription = supabase
      .channel('app_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_settings'
        },
        (payload) => {
          console.log('App settings changed:', payload);
          // Refresh settings when they change
          refreshSettings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSettings]);

  return {
    settings,
    publicSettings,
    loading,
    error,
    updateSetting,
    refreshSettings,
    getWhatsAppLink
  };
};

export default useAppSettings;