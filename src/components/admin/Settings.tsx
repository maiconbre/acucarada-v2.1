import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Shield, 
  Database,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  email_notifications: boolean;
  analytics_enabled: boolean;
  auto_backup: boolean;
  maintenance_mode: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: 'light',
    notifications_enabled: true,
    email_notifications: true,
    analytics_enabled: true,
    auto_backup: false,
    maintenance_mode: false
  });

  // Estados para formulários
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  const [profileForm, setProfileForm] = useState({
    username: '',
    fullName: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      loadAppSettings();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const profile = data || {
        id: user?.id || '',
        user_id: user?.id || '',
        email: user?.email || '',
        username: '',
        full_name: '',
        avatar_url: '',
        created_at: new Date().toISOString()
      };

      setUserProfile(profile);
      setProfileForm({
        username: 'username' in profile ? profile.username : '',
        fullName: 'full_name' in profile ? profile.full_name : '',
        email: profile.email || ''
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados do perfil"
      });
    }
  };

  const loadAppSettings = () => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      setAppSettings(JSON.parse(savedSettings));
    }
  };

  const saveAppSettings = (newSettings: AppSettings) => {
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
    setAppSettings(newSettings);
    toast({
      title: "Sucesso",
      description: "Configurações salvas com sucesso"
    });
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem"
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false
      });

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao alterar senha"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profileForm.username.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome de usuário é obrigatório"
      });
      return;
    }

    setLoading(true);
    try {
      // Verificar se o perfil já existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user?.id)
        .single();

      const profileData = {
        user_id: user?.id,
        username: profileForm.username.trim(),
        full_name: profileForm.fullName.trim(),
        email: user?.email,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingProfile) {
        // Atualizar perfil existente
        result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user?.id);
      } else {
        // Criar novo perfil
        result = await supabase
          .from('profiles')
          .insert([{ ...profileData, created_at: new Date().toISOString() }]);
      }

      if (result.error) throw result.error;

      await fetchUserProfile();
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao atualizar perfil"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: "Sucesso",
      description: "Cache limpo com sucesso"
    });
  };

  const handleExportData = async () => {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('*');
      
      const { data: categories } = await supabase
        .from('categories')
        .select('*');

      const exportData = {
        products: products || [],
        categories: categories || [],
        exported_at: new Date().toISOString(),
        user_id: user?.id
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doce-conecta-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao exportar dados"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie suas configurações de conta e preferências do sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Preferências
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Aba Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e dados de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário *</Label>
                  <Input
                    id="username"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Digite seu nome de usuário"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Digite seu nome completo"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileForm.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  O email não pode ser alterado por questões de segurança
                </p>
              </div>
              <Button onClick={handleProfileUpdate} disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Segurança */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Mantenha sua conta segura com uma senha forte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Use uma senha com pelo menos 6 caracteres, incluindo letras, números e símbolos.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={passwordForm.showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Digite sua nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setPasswordForm(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                    >
                      {passwordForm.showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={passwordForm.showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirme sua nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setPasswordForm(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                    >
                      {passwordForm.showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button onClick={handlePasswordChange} disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Preferências */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Preferências do Sistema
              </CardTitle>
              <CardDescription>
                Personalize sua experiência no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações do sistema
                  </p>
                </div>
                <Switch
                  checked={appSettings.notifications_enabled}
                  onCheckedChange={(checked) => 
                    saveAppSettings({ ...appSettings, notifications_enabled: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações importantes por email
                  </p>
                </div>
                <Switch
                  checked={appSettings.email_notifications}
                  onCheckedChange={(checked) => 
                    saveAppSettings({ ...appSettings, email_notifications: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Coletar dados de analytics para melhorar o sistema
                  </p>
                </div>
                <Switch
                  checked={appSettings.analytics_enabled}
                  onCheckedChange={(checked) => 
                    saveAppSettings({ ...appSettings, analytics_enabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Sistema */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Gerencie dados e configurações avançadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Limpar Cache
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Remove dados temporários armazenados localmente
                    </p>
                    <Button variant="outline" onClick={handleClearCache} className="w-full">
                      Limpar Cache
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Exportar Dados
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Baixe um backup dos seus dados
                    </p>
                    <Button variant="outline" onClick={handleExportData} className="w-full">
                      Exportar Dados
                    </Button>
                  </div>
                </Card>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Modo Manutenção
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar modo de manutenção para o catálogo público
                  </p>
                </div>
                <Switch
                  checked={appSettings.maintenance_mode}
                  onCheckedChange={(checked) => 
                    saveAppSettings({ ...appSettings, maintenance_mode: checked })
                  }
                />
              </div>
              
              {appSettings.maintenance_mode && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    O modo de manutenção está ativo. O catálogo público não estará acessível para visitantes.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-semibold">Usuário:</Label>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <div>
                  <Label className="font-semibold">Conta criada em:</Label>
                  <p className="text-muted-foreground">
                    {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Versão:</Label>
                  <p className="text-muted-foreground">Doce Conecta v1.0.0</p>
                </div>
                <div>
                  <Label className="font-semibold">Última atualização:</Label>
                  <p className="text-muted-foreground">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;