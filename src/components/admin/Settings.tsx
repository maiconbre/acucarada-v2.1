import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/contexts/user-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/hooks/useAppSettings";
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Database,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Phone,
  BarChart
} from "lucide-react";

interface AppSettings {
  maintenance_mode: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { profile, updateProfile, loading: userLoading, refreshUserData } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    maintenance_mode: false
  });

  const { 
    settings: systemSettings, 
    loading: settingsLoading, 
    updateSetting, 
    getWhatsAppLink 
  } = useAppSettings();
  
  const [whatsappForm, setWhatsappForm] = useState({
    number: '',
    message: ''
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
      loadAppSettings();
    }
  }, [user]);

  useEffect(() => {
    if (!settingsLoading) {
      setWhatsappForm({
        number: systemSettings.whatsapp_number || '',
        message: systemSettings.whatsapp_message || ''
      });
    }
  }, [systemSettings, settingsLoading]);

  // Update profile form when profile data changes
  useEffect(() => {
    if (profile) {
      setProfileForm({
        username: profile.username || '',
        fullName: profile.full_name || '',
        email: profile.email || ''
      });
    }
  }, [profile]);



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

  const handleSaveWhatsAppSettings = async () => {
    if (!whatsappForm.number.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O número do WhatsApp é obrigatório.'
      });
      return;
    }
    
    setWhatsappLoading(true);
    
    try {
      const success1 = await updateSetting('whatsapp_number', whatsappForm.number);
      const success2 = await updateSetting('whatsapp_message', whatsappForm.message);
      
      if (success1 && success2) {
        toast({
          title: 'Configurações do WhatsApp salvas',
          description: 'As configurações do WhatsApp foram atualizadas com sucesso.'
        });
      }
    } finally {
      setWhatsappLoading(false);
    }
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao alterar senha";
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage
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

    const result = await updateProfile({
      username: profileForm.username.trim(),
      full_name: profileForm.fullName.trim()
    });

    if (!result.success) {
      // Error handling is done in the context
      return;
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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1 p-1 h-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2 h-12 lg:h-10 text-xs lg:text-sm px-2 lg:px-4">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 h-12 lg:h-10 text-xs lg:text-sm px-2 lg:px-4">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2 h-12 lg:h-10 text-xs lg:text-sm px-2 lg:px-4">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>

          <TabsTrigger value="system" className="flex items-center gap-2 h-12 lg:h-10 text-xs lg:text-sm px-2 lg:px-4">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
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
                  <Label htmlFor="fullName">Nome</Label>
                  <Input
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Digite seu nome"
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
              <Button 
                onClick={handleProfileUpdate} 
                disabled={userLoading}
                size="lg"
                className="w-full sm:w-auto"
              >
                {userLoading ? (
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
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="newPassword">Nova Senha *</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={passwordForm.showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Digite sua nova senha"
                      className="text-lg py-3 pr-12"
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
                
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={passwordForm.showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirme sua nova senha"
                      className="text-lg py-3 pr-12"
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
              
              <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                <Button 
                  onClick={handlePasswordChange} 
                  disabled={loading}
                  size="lg"
                  className="w-full h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Lock className="h-5 w-5 mr-2" />
                  )}
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Configurações do WhatsApp
              </CardTitle>
              <CardDescription>
                Configure o número e mensagem padrão para contato via WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <Card className="p-4 border-2 hover:border-green-200 transition-all duration-200">
                  <div className="space-y-3">
                    <Label htmlFor="whatsapp-number" className="text-base font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      Número do WhatsApp *
                    </Label>
                    <Input
                      id="whatsapp-number"
                      value={whatsappForm.number}
                      onChange={(e) => setWhatsappForm(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="Ex: 5511999999999"
                      className="text-lg py-4 h-12 border-2 focus:border-green-400 transition-all duration-200"
                    />
                    <p className="text-sm text-muted-foreground">
                      Digite o número com código do país e DDD (sem espaços ou símbolos)
                    </p>
                  </div>
                </Card>
                
                <Card className="p-4 border-2 hover:border-green-200 transition-all duration-200">
                  <div className="space-y-3">
                    <Label htmlFor="whatsapp-message" className="text-base font-semibold flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      Mensagem Padrão
                    </Label>
                    <Textarea
                      id="whatsapp-message"
                      value={whatsappForm.message}
                      onChange={(e) => setWhatsappForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Olá! Vi seus produtos no catálogo e gostaria de mais informações."
                      rows={4}
                      className="text-base border-2 focus:border-green-400 transition-all duration-200 min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      Esta mensagem será enviada automaticamente quando alguém clicar no botão WhatsApp
                    </p>
                  </div>
                </Card>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100" onClick={handleSaveWhatsAppSettings}>
                  <Button 
                    onClick={handleSaveWhatsAppSettings} 
                    disabled={whatsappLoading || settingsLoading}
                    size="lg"
                    className="w-full h-14 text-base font-semibold bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {whatsappLoading ? (
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5 mr-2" />
                    )}
                    {whatsappLoading ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </Card>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border-2 hover:border-orange-200 hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100" onClick={handleClearCache}>
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold flex items-center gap-3">
                      <RefreshCw className="h-6 w-6 text-orange-600" />
                      Limpar Cache
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Remove dados temporários armazenados localmente
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleClearCache} 
                      className="w-full h-12 text-base font-semibold border-2 border-orange-300 text-orange-700 hover:bg-orange-100 hover:border-orange-400 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                      size="lg"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Limpar Cache
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-6 border-2 hover:border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100" onClick={handleExportData}>
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold flex items-center gap-3">
                      <Database className="h-6 w-6 text-blue-600" />
                      Exportar Dados
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Baixe um backup dos seus dados
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleExportData} 
                      className="w-full h-12 text-base font-semibold border-2 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                      size="lg"
                    >
                      <Database className="h-5 w-5 mr-2" />
                      Exportar Dados
                    </Button>
                  </div>
                </Card>
              </div>
              
              <Separator />
              
              <Card className="p-6 border-2 hover:border-red-200 hover:shadow-md transition-all duration-200 cursor-pointer bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100" onClick={() => saveAppSettings({ ...appSettings, maintenance_mode: !appSettings.maintenance_mode })}>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      Modo Manutenção
                    </Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ativar modo de manutenção para o catálogo público
                    </p>
                  </div>
                  <Switch
                    checked={appSettings.maintenance_mode}
                    onCheckedChange={(checked) => 
                      saveAppSettings({ ...appSettings, maintenance_mode: checked })
                    }
                    className="scale-125"
                  />
                </div>
              </Card>
              
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
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'N/A'}
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