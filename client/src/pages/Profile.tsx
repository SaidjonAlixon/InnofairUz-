import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, Lock, Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Profile() {
  const { user, updateUser, changePassword } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Force re-render when avatar changes
  const [avatarKey, setAvatarKey] = useState(0);
  useEffect(() => {
    if (user?.avatar) {
      setAvatarKey(prev => prev + 1);
    }
  }, [user?.avatar]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Profilni ko'rish uchun tizimga kiring.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Xatolik",
        description: "Faqat rasm fayllari qabul qilinadi",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Xatolik",
        description: "Rasm hajmi 5MB dan kichik bo'lishi kerak",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Rasm yuklashda xatolik");
      }

      const data = await response.json();
      const avatarUrl = data.avatar;
      
      if (!avatarUrl) {
        throw new Error("Avatar URL olinmadi");
      }
      
      console.log("Avatar URL received:", avatarUrl);
      
      // Update user with new avatar
      await updateUser(user.id, { avatar: avatarUrl });
      
      // Force avatar key update to trigger re-render
      setAvatarKey(prev => prev + 1);
      
      toast({
        title: "Muvaffaqiyatli",
        description: "Profil rasmi yangilandi",
      });
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error?.message || "Rasm yuklashda xatolik",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updates: { fullName?: string; email?: string } = {};
      if (profileForm.fullName !== user.fullName) {
        updates.fullName = profileForm.fullName;
      }
      if (profileForm.email !== user.email) {
        if (!profileForm.email.endsWith("@gmail.com")) {
          throw new Error("Faqat @gmail.com manzillari qabul qilinadi");
        }
        updates.email = profileForm.email;
      }

      if (Object.keys(updates).length === 0) {
        toast({
          title: "O'zgarishlar yo'q",
          description: "Hech qanday o'zgarish kiritilmadi",
        });
        return;
      }

      await updateUser(user.id, updates);
      
      toast({
        title: "Muvaffaqiyatli",
        description: "Profil yangilandi",
      });
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error?.message || "Profilni yangilashda xatolik",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Xatolik",
        description: "Yangi parollar mos kelmaydi",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Xatolik",
        description: "Parol kamida 6 belgidan iborat bo'lishi kerak",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(user.id, passwordForm.currentPassword, passwordForm.newPassword);
      
      toast({
        title: "Muvaffaqiyatli",
        description: "Parol yangilandi",
      });
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error?.message || "Parolni o'zgartirishda xatolik",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-16">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-xl border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background">
                  {user.avatar ? (
                    <AvatarImage 
                      src={`${user.avatar}?t=${avatarKey}`}
                      key={`${user.id}-${user.avatar}-${avatarKey}`}
                      alt={`${user.fullName} avatar`}
                      onError={(e) => {
                        console.error("Avatar image failed to load:", user.avatar);
                        e.currentTarget.style.display = "none";
                      }}
                      onLoad={() => {
                        console.log("Avatar image loaded successfully:", user.avatar);
                      }}
                    />
                  ) : null}
                  <AvatarFallback className="text-4xl">{user.fullName?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-10 w-10"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                >
                  <Camera className="h-5 w-5" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl">{user.fullName}</CardTitle>
              <CardDescription className="text-base">{user.email}</CardDescription>
              {user.role && (
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                    {user.role === "investor" ? "Investor" : user.role === "mijoz" ? "Mijoz" : user.role}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profil ma'lumotlari</TabsTrigger>
                <TabsTrigger value="password">Parolni o'zgartirish</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      To'liq ism
                    </Label>
                    <Input
                      id="fullName"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Gmail manzili
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value.toLowerCase() })}
                      required
                      placeholder="misol: foydalanuvchi@gmail.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Gmail manzilini o'zgartirsangiz, yangi tasdiqlash emaili yuboriladi
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="password" className="space-y-4">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Joriy parol
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword">Yangi parol</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Parol kamida 6 belgidan iborat bo'lishi kerak
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Yangi parolni tasdiqlash</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isChangingPassword}>
                    <Lock className="h-4 w-4 mr-2" />
                    {isChangingPassword ? "O'zgartirilmoqda..." : "Parolni o'zgartirish"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

