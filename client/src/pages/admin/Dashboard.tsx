import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import type { Article, News, Innovation, Comment, Statistics, User, Category } from "@shared/schema";
import {
  Calendar,
  Files,
  Lightbulb,
  LogOut,
  Newspaper,
  Users,
  CheckCircle,
  AlertCircle,
  Upload,
  ClipboardCheck,
  UserPlus,
  Copy,
  LinkIcon,
  Trash2,
  MessageSquare,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WithCreatedAt {
  createdAt?: Date | string;
}

type PublishableItem = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  description?: string;
  readTime?: string;
  categoryId: string | null;
  authorId: string | null;
  published: boolean;
};

function formatDate(value: Date | string | undefined) {
  if (!value) return "РІР‚вЂќ";
  return new Date(value).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitialPublishState(role: string | undefined) {
  return role === "super_admin";
}

function createArticleInitial(role: string | undefined): PublishableItem {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    readTime: "5 daqiqa",
    categoryId: "",
    authorId: "",
    published: getInitialPublishState(role),
  };
}

function createNewsInitial(role: string | undefined): PublishableItem {
  return {
    title: "",
    slug: "",
    content: "",
    categoryId: "",
    authorId: "",
    published: getInitialPublishState(role),
  };
}

function createInnovationInitial(role: string | undefined): PublishableItem {
  return {
    title: "",
    slug: "",
    description: "",
    content: "",
    categoryId: "",
    authorId: "",
    published: getInitialPublishState(role),
  };
}

function createFileInitial() {
  return {
    file: null as File | null,
    description: "",
    uploadedBy: "",
    relatedType: "none" as "article" | "news" | "innovation" | "none",
    relatedId: "",
  };
}

const assistantServiceOptions = [
  { id: "events", label: "Tadbirlar taqvimi", description: "Rasmiy tadbirlarni joylash va o'zgartirish." },
  { id: "projects", label: "Loyihalar katalogi", description: "Innovatsion loyihalar ro'yxatini yuritish." },
  { id: "media", label: "Media markaz", description: "Yangiliklar va media materiallarini joylash." },
  { id: "investors", label: "Investorlar bilan aloqa", description: "Investor va sheriklar bilan yozishmalar." },
  { id: "support", label: "Fikrlar va murojaatlar", description: "Hamkorlik va fikrlarni tartibga keltirish." },
];

function generateAssistantPassword(length = 10) {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  return password;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [articleForm, setArticleForm] = useState<PublishableItem>(() => createArticleInitial(user?.role));
  const [newsForm, setNewsForm] = useState<PublishableItem>(() => createNewsInitial(user?.role));
  const [innovationForm, setInnovationForm] = useState<PublishableItem>(() => createInnovationInitial(user?.role));
  const [fileForm, setFileForm] = useState(createFileInitial);
  const [activeTab, setActiveTab] = useState<string>(getInitialPublishState(user?.role) ? "overview" : "content");
  const [assistantForm, setAssistantForm] = useState({
    fullName: "",
    email: "",
    password: generateAssistantPassword(),
    services: [] as string[],
    notes: "",
  });
  const [assistantResult, setAssistantResult] = useState<null | {
    email: string;
    password: string;
    link: string;
    services: string[];
  }>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";
  const canPublish = isSuperAdmin;
  const isEditor = user?.role === "editor_admin";

  useEffect(() => {
    if (!user || user.role === "user") {
      navigate("/admin/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    setActiveTab(canPublish ? "overview" : "content");
    setArticleForm((prev) => ({ ...prev, published: getInitialPublishState(user?.role) }));
    setNewsForm((prev) => ({ ...prev, published: getInitialPublishState(user?.role) }));
    setInnovationForm((prev) => ({ ...prev, published: getInitialPublishState(user?.role) }));
  }, [canPublish, user?.role]);

  const handleAssistantServiceToggle = (serviceId: string) => {
    setAssistantForm((prev) => {
      const exists = prev.services.includes(serviceId);
      return {
        ...prev,
        services: exists ? prev.services.filter((id) => id !== serviceId) : [...prev.services, serviceId],
      };
    });
  };

  const regenerateAssistantPassword = () => {
    setAssistantForm((prev) => ({ ...prev, password: generateAssistantPassword() }));
  };

  const handleAssistantCopy = (value: string, label: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        toast({ title: `${label} nusxalandi` });
      })
      .catch(() => {
        toast({ title: "Nusxalash amalga oshmadi", variant: "destructive" });
      });
  };

  const handleAssistantSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAssistantResult(null);

    const fullName = assistantForm.fullName.trim();
    const normalizedEmail = assistantForm.email.trim().toLowerCase();
    const passwordValue = assistantForm.password.trim();

    if (!fullName || !normalizedEmail || !passwordValue) {
      toast({ title: "Barcha maydonlarni to'ldiring", variant: "destructive" });
      return;
    }

    if (!normalizedEmail.endsWith("@gmail.com")) {
      toast({ title: "Gmail manzilini kiriting", description: "Faqat @gmail.com bilan tugaydigan manzillar qabul qilinadi.", variant: "destructive" });
      return;
    }

    setAssistantLoading(true);
    try {
      const response = await fetch("/api/admin/assistants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: normalizedEmail,
          password: passwordValue,
          services: assistantForm.services,
          notes: assistantForm.notes,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Yordamchi yaratib bo'lmadi");
      }
      const absoluteLink =
        typeof window !== "undefined"
          ? new URL(result.loginLink ?? "/admin/login", window.location.origin).toString()
          : result.loginLink ?? "/admin/login";

      const createdPassword = passwordValue;
      const selectedServices = assistantForm.services;

      setAssistantResult({
        email: result.user?.email ?? normalizedEmail,
        password: createdPassword,
        link: absoluteLink,
        services: selectedServices,
      });

      setAssistantForm({
        fullName: "",
        email: "",
        password: generateAssistantPassword(),
        services: [],
        notes: "",
      });

      toast({ title: "Yordamchi tayinlandi", description: "Kirish ma'lumotlari nusxalash uchun tayyor." });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error?.message || "Iltimos, qaytadan urinib ko'ring.",
        variant: "destructive",
      });
    } finally {
      setAssistantLoading(false);
    }
  };

  const { data: stats } = useQuery<Statistics>({ queryKey: ["/api/statistics"] });
  const { data: articles = [] } = useQuery<Article[]>({ queryKey: ["/api/articles"] });
  const { data: news = [] } = useQuery<News[]>({ queryKey: ["/api/news"] });
  const { data: innovations = [] } = useQuery<Innovation[]>({ queryKey: ["/api/innovations"] });
  const { data: pendingComments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/comments", { approved: false }],
    queryFn: async () => {
      const response = await fetch("/api/comments?approved=false");
      if (!response.ok) {
        throw new Error("Sharhlar olinmadi");
      }
      return response.json();
    },
  });
  const { data: allComments = [], refetch: refetchAllComments } = useQuery<Comment[]>({
    queryKey: ["/api/comments"],
    queryFn: async () => {
      const response = await fetch("/api/comments");
      if (!response.ok) {
        throw new Error("Sharhlar olinmadi");
      }
      return response.json();
    },
  });
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });

  const authorOptions = useMemo(() => users.filter((u) => u.role !== "user"), [users]);

  const latestArticles = useMemo(() => [...articles].slice(0, 5), [articles]);
  const latestNews = useMemo(() => [...news].slice(0, 5), [news]);
  const latestInnovations = useMemo(() => [...innovations].slice(0, 5), [innovations]);

  const pendingArticles = useMemo(() => articles.filter((item) => !item.published), [articles]);
  const pendingNews = useMemo(() => news.filter((item) => !item.published), [news]);
  const pendingInnovations = useMemo(() => innovations.filter((item) => !item.published), [innovations]);

  const statCards = useMemo(
    () => [
      {
        title: "Jami loyihalar",
        value: stats?.totalArticles ?? 0,
        icon: Files,
        helper: "Maqola va loyiha pasportlari",
      },
      {
        title: "Yangiliklar",
        value: stats?.totalNews ?? 0,
        icon: Newspaper,
        helper: "inno-fair.uz media markazi",
      },
      {
        title: "Innovatsiyalar",
        value: stats?.totalInnovations ?? 0,
        icon: Lightbulb,
        helper: "Tijoratlashtirishga tayyor loyihalar",
      },
      {
        title: "Foydalanuvchilar",
        value: stats?.totalUsers ?? 0,
        icon: Users,
        helper: "Platforma a'zolari",
      },
      {
        title: "Umumiy ko'rishlar",
        value: stats?.totalViews ?? 0,
        icon: Calendar,
        helper: "Maqola o'qilishlari",
      },
      {
        title: "Tasdiqlanmagan sharhlar",
        value: pendingComments.length,
        icon: AlertCircle,
        helper: "Moderatsiya kutayotgan fikrlar",
      },
    ],
    [stats, pendingComments.length],
  );

  if (!user || user.role === "user") {
    return null;
  }

  const ensureSelection = (form: PublishableItem) => ({
    categoryId: form.categoryId || null,
    authorId: form.authorId || null,
  });

  const handleCreate = async (
    endpoint: string,
    payload: Record<string, any>,
    successMessage: string,
    invalidateKeys: string[],
  ) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error ?? "Saqlashda xatolik yuz berdi");
    }
    invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    toast({ title: successMessage });
  };

  const handleArticleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { categoryId, authorId } = ensureSelection(articleForm);
      await handleCreate(
        "/api/articles",
        {
          title: articleForm.title,
          slug: articleForm.slug,
          excerpt: articleForm.excerpt,
          content: articleForm.content,
          categoryId,
          authorId,
          readTime: articleForm.readTime,
          published: canPublish ? articleForm.published : false,
        },
        "Maqola muvaffaqiyatli qo'shildi",
        ["/api/articles", "/api/statistics"],
      );
      setArticleForm(createArticleInitial(user?.role));
    } catch (error: any) {
      toast({
        title: "Maqolani qo'shishda xatolik",
        description: error?.message ?? "Iltimos, ma'lumotlarni tekshirib qayta urinib ko'ring.",
        variant: "destructive",
      });
    }
  };

  const handleNewsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { categoryId, authorId } = ensureSelection(newsForm);
      await handleCreate(
        "/api/news",
        {
          title: newsForm.title,
          slug: newsForm.slug,
          content: newsForm.content,
          categoryId,
          authorId,
          published: canPublish ? newsForm.published : false,
        },
        "Yangilik muvaffaqiyatli qo'shildi",
        ["/api/news", "/api/statistics"],
      );
      setNewsForm(createNewsInitial(user?.role));
    } catch (error: any) {
      toast({
        title: "Yangilikni saqlashda xatolik",
        description: error?.message ?? "Iltimos, ma'lumotlarni tekshirib qayta urinib ko'ring.",
        variant: "destructive",
      });
    }
  };

  const handleInnovationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { categoryId, authorId } = ensureSelection(innovationForm);
      await handleCreate(
        "/api/innovations",
        {
          title: innovationForm.title,
          slug: innovationForm.slug,
          description: innovationForm.description,
          content: innovationForm.content,
          categoryId,
          authorId,
          published: canPublish ? innovationForm.published : false,
        },
        "Innovatsion loyiha qo'shildi",
        ["/api/innovations", "/api/statistics"],
      );
      setInnovationForm(createInnovationInitial(user?.role));
    } catch (error: any) {
      toast({
        title: "Innovatsiyani saqlashda xatolik",
        description: error?.message ?? "Iltimos, ma'lumotlarni tekshirib qayta urinib ko'ring.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fileForm.file) {
      toast({ title: "Fayl tanlanmadi", variant: "destructive" });
      return;
    }
    if (!fileForm.uploadedBy) {
      toast({
        title: "Yuklovchi foydalanuvchi tanlanmagan",
        description: "Iltimos, faylni kim yuklayotganini ko'rsating.",
        variant: "destructive",
      });
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", fileForm.file);
      if (fileForm.description) formData.append("description", fileForm.description);
      formData.append("uploadedBy", fileForm.uploadedBy);
      if (fileForm.relatedType !== "none" && fileForm.relatedId) {
        formData.append(`${fileForm.relatedType}Id`, fileForm.relatedId);
      }
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? "Fayl yuklashda xatolik");
      }
      toast({
        title: "Fayl yuklandi",
        description: `${fileForm.file.name} muvaffaqiyatli saqlandi.`,
      });
      setFileForm(createFileInitial());
    } catch (error: any) {
      toast({
        title: "Fayl yuklanmadi",
        description: error?.message ?? "Iltimos, keyinroq qayta urinib ko'ring.",
        variant: "destructive",
      });
    }
  };

  const approveContent = async (type: "articles" | "news" | "innovations", id: string) => {
    const endpoint = `/api/${type}/${id}`;
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: true }),
    });
    if (!response.ok) {
      toast({
        title: "Nashr etishda xatolik",
        description: "Iltimos, qaytadan urinib ko'ring.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Kontent nashr etildi" });
    queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    queryClient.invalidateQueries({ queryKey: ["/api/news"] });
    queryClient.invalidateQueries({ queryKey: ["/api/innovations"] });
    queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-500 to-blue-600 text-white shadow-sm">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">inno-fair.uz</p>
              <h1 className="text-lg font-semibold">Administrator paneli</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email} • {user.role}</p>
            </div>
            <Avatar>
              <AvatarFallback>{user.fullName?.[0] ?? "A"}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" onClick={logout} data-testid="button-admin-logout">
              <LogOut className="mr-1 h-4 w-4" /> Chiqish
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start gap-2">
            {canPublish && (
              <TabsTrigger value="overview">Umumiy ko'rinish</TabsTrigger>
            )}
            <TabsTrigger value="content">Kontent yaratish</TabsTrigger>
            {canPublish && (
              <TabsTrigger value="moderation">Moderatsiya</TabsTrigger>
            )}
            {isSuperAdmin && <TabsTrigger value="assistants">Yordamchi tayinlash</TabsTrigger>}
          </TabsList>

          {canPublish && (
            <TabsContent value="overview" className="space-y-6">
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map(({ title, value, icon: Icon, helper }) => (
                  <Card key={title} className="border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                      <Icon className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{value}</div>
                      <p className="text-xs text-muted-foreground mt-1">{helper}</p>
                    </CardContent>
                  </Card>
                ))}
              </section>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle>So'ngi maqolalar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {latestArticles.map((article) => (
                      <div key={article.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium">{article.title}</h3>
                          <Badge variant="outline">{article.readTime}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{formatDate(article.createdAt)}</span>
                          <span>РІР‚Сћ</span>
                          <span>ID: {article.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    ))}
                    {latestArticles.length === 0 && (
                      <p className="text-sm text-muted-foreground">Maqolalar topilmadi.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle>So'nggi yangiliklar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {latestNews.map((item) => (
                      <div key={item.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium">{item.title}</h3>
                          <Badge variant="outline">{item.categoryId ? "Kategoriya" : "Umumiy"}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{formatDate(item.createdAt)}</span>
                          <span>РІР‚Сћ</span>
                          <span>ID: {item.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    ))}
                    {latestNews.length === 0 && (
                      <p className="text-sm text-muted-foreground">Yangiliklar mavjud emas.</p>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle>Innovatsiyalar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {latestInnovations.map((item) => (
                      <div key={item.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium">{item.title}</h3>
                          <Badge variant="secondary">{item.likes} like</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{formatDate(item.createdAt)}</span>
                          <span>РІР‚Сћ</span>
                          <span>ID: {item.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    ))}
                    {latestInnovations.length === 0 && (
                      <p className="text-sm text-muted-foreground">Innovatsiyalar topilmadi.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle>Foydalanuvchilar</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-2 pr-4">Ism</th>
                          <th className="py-2 pr-4">Login</th>
                          <th className="py-2 pr-4">Rol</th>
                          <th className="py-2 pr-4">Ro'yxatdan o'tgan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.slice(0, 10).map((u) => (
                          <tr key={u.id} className="border-t">
                            <td className="py-2 pr-4 font-medium">{u.fullName}</td>
                            <td className="py-2 pr-4">{u.email}</td>
                            <td className="py-2 pr-4">
                              <Badge variant={u.role === "super_admin" ? "destructive" : "outline"}>{u.role}</Badge>
                            </td>
                            <td className="py-2 pr-4">{formatDate(u.createdAt)}</td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-muted-foreground">
                              Foydalanuvchilar ro'yxati bo'sh.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>
          )}

          <TabsContent value="content" className="space-y-8">
            {isEditor && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle>Diqqat</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-amber-900">
                  Siz editor admin sifatida kiritgan kontent avtomatik ravishda "draft" holatda saqlanadi.
                  Super admin tasdiqlagandan so'nggina saytga chiqadi.
                </CardContent>
              </Card>
            )}

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Yangi maqola qo'shish</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleArticleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="article-title">Sarlavha</Label>
                        <Input
                          id="article-title"
                          value={articleForm.title}
                          onChange={(e) => setArticleForm((prev) => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="article-slug">Slug</Label>
                        <Input
                          id="article-slug"
                          value={articleForm.slug}
                          onChange={(e) => setArticleForm((prev) => ({ ...prev, slug: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="article-readtime">O'qish vaqti</Label>
                        <Input
                          id="article-readtime"
                          value={articleForm.readTime}
                          onChange={(e) => setArticleForm((prev) => ({ ...prev, readTime: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Kategoriya</Label>
                        <Select
                          value={articleForm.categoryId || "none"}
                          onValueChange={(value) =>
                            setArticleForm((prev) => ({ ...prev, categoryId: value === "none" ? "" : value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kategoriya tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Kategoriya tanlanmagan</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Muallif</Label>
                        <Select
                          value={articleForm.authorId || "none"}
                          onValueChange={(value) =>
                            setArticleForm((prev) => ({ ...prev, authorId: value === "none" ? "" : value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Muallif tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Muallif tanlanmagan</SelectItem>
                            {authorOptions.map((author) => (
                              <SelectItem key={author.id} value={author.id}>
                                {author.fullName} ({author.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Switch
                          id="article-published"
                          checked={canPublish ? articleForm.published : false}
                          onCheckedChange={(value) =>
                            setArticleForm((prev) => ({ ...prev, published: value }))
                          }
                          disabled={!canPublish}
                        />
                        <Label htmlFor="article-published">Nashr etish</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="article-excerpt">Annotatsiya</Label>
                      <Textarea
                        id="article-excerpt"
                        value={articleForm.excerpt}
                        onChange={(e) => setArticleForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="article-content">To'liq matn</Label>
                      <Textarea
                        id="article-content"
                        value={articleForm.content}
                        onChange={(e) => setArticleForm((prev) => ({ ...prev, content: e.target.value }))}
                        rows={6}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Maqolani saqlash
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Yangilik qo'shish</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNewsSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="news-title">Sarlavha</Label>
                        <Input
                          id="news-title"
                          value={newsForm.title}
                          onChange={(e) => setNewsForm((prev) => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="news-slug">Slug</Label>
                        <Input
                          id="news-slug"
                          value={newsForm.slug}
                          onChange={(e) => setNewsForm((prev) => ({ ...prev, slug: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Kategoriya</Label>
                        <Select
                          value={newsForm.categoryId || "none"}
                          onValueChange={(value) =>
                            setNewsForm((prev) => ({ ...prev, categoryId: value === "none" ? "" : value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kategoriya tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Kategoriya tanlanmagan</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Muallif</Label>
                        <Select
                          value={newsForm.authorId || "none"}
                          onValueChange={(value) =>
                            setNewsForm((prev) => ({ ...prev, authorId: value === "none" ? "" : value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Muallif tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Muallif tanlanmagan</SelectItem>
                            {authorOptions.map((author) => (
                              <SelectItem key={author.id} value={author.id}>
                                {author.fullName} ({author.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Switch
                          id="news-published"
                          checked={canPublish ? newsForm.published : false}
                          onCheckedChange={(value) => setNewsForm((prev) => ({ ...prev, published: value }))}
                          disabled={!canPublish}
                        />
                        <Label htmlFor="news-published">Nashr etish</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="news-content">Yangilik matni</Label>
                      <Textarea
                        id="news-content"
                        value={newsForm.content}
                        onChange={(e) => setNewsForm((prev) => ({ ...prev, content: e.target.value }))}
                        rows={6}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Yangilikni saqlash
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Innovatsion loyiha qo'shish</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInnovationSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="innovation-title">Sarlavha</Label>
                        <Input
                          id="innovation-title"
                          value={innovationForm.title}
                          onChange={(e) => setInnovationForm((prev) => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="innovation-slug">Slug</Label>
                        <Input
                          id="innovation-slug"
                          value={innovationForm.slug}
                          onChange={(e) => setInnovationForm((prev) => ({ ...prev, slug: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Kategoriya</Label>
                        <Select
                          value={innovationForm.categoryId || "none"}
                          onValueChange={(value) =>
                            setInnovationForm((prev) => ({ ...prev, categoryId: value === "none" ? "" : value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kategoriya tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Kategoriya tanlanmagan</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Muallif</Label>
                        <Select
                          value={innovationForm.authorId || "none"}
                          onValueChange={(value) =>
                            setInnovationForm((prev) => ({ ...prev, authorId: value === "none" ? "" : value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Muallif tanlang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Muallif tanlanmagan</SelectItem>
                            {authorOptions.map((author) => (
                              <SelectItem key={author.id} value={author.id}>
                                {author.fullName} ({author.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Switch
                          id="innovation-published"
                          checked={canPublish ? innovationForm.published : false}
                          onCheckedChange={(value) =>
                            setInnovationForm((prev) => ({ ...prev, published: value }))
                          }
                          disabled={!canPublish}
                        />
                        <Label htmlFor="innovation-published">Nashr etish</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="innovation-description">Qisqacha ta'rif</Label>
                      <Textarea
                        id="innovation-description"
                        value={innovationForm.description}
                        onChange={(e) => setInnovationForm((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="innovation-content">Batafsil ma'lumot</Label>
                      <Textarea
                        id="innovation-content"
                        value={innovationForm.content}
                        onChange={(e) => setInnovationForm((prev) => ({ ...prev, content: e.target.value }))}
                        rows={6}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Innovatsiyani saqlash
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-col gap-2">
                  <CardTitle>Fayl / media yuklash</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Prezentatsiya, rasm, video va boshqa fayllarni yuklab, maqola yoki yangiliklarga biriktiring.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">Fayl</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(event) =>
                          setFileForm((prev) => ({
                            ...prev,
                            file: event.target.files?.[0] ?? null,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file-description">Izoh</Label>
                      <Textarea
                        id="file-description"
                        value={fileForm.description}
                        onChange={(event) =>
                          setFileForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Yuklovchi (administrator)</Label>
                      <Select
                        value={fileForm.uploadedBy || "none"}
                        onValueChange={(value) =>
                          setFileForm((prev) => ({ ...prev, uploadedBy: value === "none" ? "" : value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Tanlanmagan</SelectItem>
                          {authorOptions.map((author) => (
                            <SelectItem key={author.id} value={author.id}>
                              {author.fullName} ({author.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Qaysi kontentga bog'lash</Label>
                      <Select
                        value={fileForm.relatedType}
                        onValueChange={(value: "article" | "news" | "innovation" | "none") =>
                          setFileForm((prev) => ({ ...prev, relatedType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tanlash majburiy emas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Bogliq emas</SelectItem>
                          <SelectItem value="article">Maqolaga biriktirish</SelectItem>
                          <SelectItem value="news">Yangilikka biriktirish</SelectItem>
                          <SelectItem value="innovation">Innovatsiyaga biriktirish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {fileForm.relatedType !== "none" && (
                      <div className="space-y-2">
                        <Label htmlFor="related-id">Bog'lanadigan element ID'si</Label>
                        <Input
                          id="related-id"
                          value={fileForm.relatedId}
                          onChange={(event) =>
                            setFileForm((prev) => ({ ...prev, relatedId: event.target.value }))
                          }
                          placeholder="Masalan: maqola ID'si"
                        />
                      </div>
                    )}
                    <Button type="submit" className="w-full">
                      <Upload className="mr-2 h-4 w-4" /> Faylni yuklash
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {canPublish && (
            <TabsContent value="moderation" className="space-y-6">
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle>Tasdiqlanmagan maqolalar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingArticles.map((article) => (
                      <div key={article.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium">{article.title}</h3>
                          <Badge variant="outline">{article.readTime}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{formatDate(article.createdAt)}</span>
                          <span>РІР‚Сћ</span>
                          <span>ID: {article.id.slice(0, 8)}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => approveContent("articles", article.id)}
                            className="flex items-center gap-1"
                          >
                            <ClipboardCheck className="h-4 w-4" /> Tasdiqlash
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingArticles.length === 0 && (
                      <p className="text-sm text-muted-foreground">Tasdiqlash uchun maqola qoldirilmagan.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle>Tasdiqlanmagan yangiliklar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingNews.map((item) => (
                      <div key={item.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium">{item.title}</h3>
                          <Badge variant="outline">{item.categoryId ? "Kategoriya" : "Umumiy"}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{formatDate(item.createdAt)}</span>
                          <span>РІР‚Сћ</span>
                          <span>ID: {item.id.slice(0, 8)}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => approveContent("news", item.id)}
                            className="flex items-center gap-1"
                          >
                            <ClipboardCheck className="h-4 w-4" /> Tasdiqlash
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingNews.length === 0 && (
                      <p className="text-sm text-muted-foreground">Tasdiqlash uchun yangilik qoldirilmagan.</p>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle>Tasdiqlanmagan innovatsiyalar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingInnovations.map((item) => (
                      <div key={item.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium">{item.title}</h3>
                          <Badge variant="secondary">{item.likes} like</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{formatDate(item.createdAt)}</span>
                          <span>РІР‚Сћ</span>
                          <span>ID: {item.id.slice(0, 8)}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => approveContent("innovations", item.id)}
                            className="flex items-center gap-1"
                          >
                            <ClipboardCheck className="h-4 w-4" /> Tasdiqlash
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingInnovations.length === 0 && (
                      <p className="text-sm text-muted-foreground">Tasdiqlash uchun innovatsiya qoldirilmagan.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-primary/10">
                  <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Moderatsiya kutayotgan sharhlar</CardTitle>
                    <Badge variant={pendingComments.length === 0 ? "secondary" : "destructive"}>
                      {pendingComments.length} ta sharh
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingComments.map((comment) => (
                      <div key={comment.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <p className="text-sm">{comment.content}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{comment.authorId.slice(0, 6)}</Badge>
                            <span>{formatDate(comment.createdAt)}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={async () => {
                                const response = await fetch(`/api/comments/${comment.id}/approve`, { method: "PATCH" });
                                if (!response.ok) {
                                  toast({
                                    title: "Sharhni tasdiqlashda xatolik",
                                    description: "Iltimos, qaytadan urinib ko'ring.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                toast({
                                  title: "Sharh tasdiqlandi",
                                  description: "Fikr foydalanuvchilarga ko'rinadi.",
                                });
                                await queryClient.invalidateQueries({
                                  queryKey: ["/api/comments", { approved: false }],
                                });
                              }}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" /> Tasdiqlash
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                if (!confirm("Bu sharhni o'chirishni xohlaysizmi?")) return;
                                const response = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
                                if (!response.ok) {
                                  toast({
                                    title: "Sharhni o'chirishda xatolik",
                                    description: "Iltimos, qaytadan urinib ko'ring.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                toast({
                                  title: "Sharh o'chirildi",
                                  description: "Sharh muvaffaqiyatli o'chirildi.",
                                });
                                await queryClient.invalidateQueries({
                                  queryKey: ["/api/comments"],
                                });
                              }}
                            >
                              <Trash2 className="mr-1 h-4 w-4" /> O'chirish
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingComments.length === 0 && <p className="text-sm text-muted-foreground">Tasdiqlash uchun sharh qoldirilmagan.</p>}
                  </CardContent>
                </Card>

                <Card className="border-primary/10">
                  <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Barcha sharhlar (G'oyalar klubi)
                    </CardTitle>
                    <Badge variant="secondary">
                      {allComments.filter(c => !c.articleId && !c.newsId && !c.innovationId).length} ta post
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {allComments
                      .filter(c => !c.articleId && !c.newsId && !c.innovationId)
                      .slice(0, 20)
                      .map((comment) => (
                        <div key={comment.id} className="border-b pb-3 last:border-0 last:pb-0">
                          <p className="text-sm">{comment.content}</p>
                          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Badge variant={comment.approved ? "default" : "outline"}>
                                {comment.approved ? "Chop etilgan" : "Kutilmoqda"}
                              </Badge>
                              <Badge variant="outline">{comment.authorId.slice(0, 6)}</Badge>
                              <span>{formatDate(comment.createdAt)}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                if (!confirm("Bu sharhni o'chirishni xohlaysizmi?")) return;
                                const response = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
                                if (!response.ok) {
                                  toast({
                                    title: "Sharhni o'chirishda xatolik",
                                    description: "Iltimos, qaytadan urinib ko'ring.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                toast({
                                  title: "Sharh o'chirildi",
                                  description: "Sharh muvaffaqiyatli o'chirildi.",
                                });
                                await queryClient.invalidateQueries({
                                  queryKey: ["/api/comments"],
                                });
                                refetchAllComments();
                              }}
                            >
                              <Trash2 className="mr-1 h-4 w-4" /> O'chirish
                            </Button>
                          </div>
                        </div>
                      ))}
                    {allComments.filter(c => !c.articleId && !c.newsId && !c.innovationId).length === 0 && (
                      <p className="text-sm text-muted-foreground">Hozircha sharhlar mavjud emas.</p>
                    )}
                  </CardContent>
                </Card>
              </section>
            </TabsContent>
          )}
          {isSuperAdmin && (
            <TabsContent value="assistants" className="space-y-6">
              <Card className="border-primary/20">
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Yordamchi tayinlash
                  </CardTitle>
                  <CardDescription>
                    Kerakli xizmatlarni belgilang, kotibga login va parol yarating, so'ngra ulashish uchun nusxalang.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAssistantSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="assistant-fullname">To'liq ism</Label>
                      <Input
                        id="assistant-fullname"
                        value={assistantForm.fullName}
                        onChange={(event) => setAssistantForm((prev) => ({ ...prev, fullName: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="assistant-email">Gmail manzili</Label>
                        <Input
                          id="assistant-email"
                          type="email"
                          value={assistantForm.email}
                          onChange={(event) => setAssistantForm((prev) => ({ ...prev, email: event.target.value }))}
                          placeholder="assistant@gmail.com"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">Faqat @gmail.com qabul qilinadi.</p>
                      </div>
                      <div>
                        <Label htmlFor="assistant-password">Parol</Label>
                        <div className="flex gap-2">
                          <Input
                            id="assistant-password"
                            type="text"
                            value={assistantForm.password}
                            onChange={(event) => setAssistantForm((prev) => ({ ...prev, password: event.target.value }))}
                            required
                          />
                          <Button type="button" variant="outline" onClick={regenerateAssistantPassword}>
                            Yangilash
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Parolni o'zgartiring yoki yangi generatsiya qiling.</p>
                      </div>
                    </div>
                    <div>
                      <Label>Xizmatlar</Label>
                      <p className="text-xs text-muted-foreground mb-3">Kotib mas'ul bo'ladigan bo'limlarni belgilang.</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {assistantServiceOptions.map((service) => (
                          <label
                            key={service.id}
                            className="flex items-start gap-3 rounded-md border border-dashed border-input/50 bg-muted/30 p-3"
                          >
                            <Checkbox
                              id={`service-${service.id}`}
                              checked={assistantForm.services.includes(service.id)}
                              onCheckedChange={() => handleAssistantServiceToggle(service.id)}
                            />
                            <div>
                              <p className="text-sm font-medium">{service.label}</p>
                              <p className="text-xs text-muted-foreground">{service.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="assistant-notes">Qo'shimcha topshiriqlar</Label>
                      <Textarea
                        id="assistant-notes"
                        value={assistantForm.notes}
                        onChange={(event) => setAssistantForm((prev) => ({ ...prev, notes: event.target.value }))}
                        placeholder="Masalan: har dushanba tadbirlarni yangilash."
                        rows={3}
                      />
                    </div>
                    <Button type="submit" disabled={assistantLoading} className="w-full">
                      {assistantLoading ? "Yaratilmoqda..." : "Yordamchini tayinlash"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {assistantResult && (
                <Card className="border-dashed border-primary/30">
                  <CardHeader>
                    <CardTitle>Kirish ma'lumotlari tayyor</CardTitle>
                    <CardDescription>Quyidagi ma'lumotlarni nusxalab, yordamchiga yuboring.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium">Kirish havolasi</p>
                        <p className="text-sm text-muted-foreground break-all">{assistantResult.link}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleAssistantCopy(assistantResult.link, "Havola")}>
                        <LinkIcon className="h-4 w-4 mr-2" /> Nusxalash
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium">Login (Gmail)</p>
                        <p className="text-sm text-muted-foreground break-all">{assistantResult.email}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleAssistantCopy(assistantResult.email, "Login")}>
                        <Copy className="h-4 w-4 mr-2" /> Nusxalash
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium">Parol</p>
                        <p className="text-sm text-muted-foreground">{assistantResult.password}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleAssistantCopy(assistantResult.password, "Parol")}>
                        <Copy className="h-4 w-4 mr-2" /> Nusxalash
                      </Button>
                    </div>
                    {assistantResult.services.length > 0 && (
                      <div className="rounded-lg border p-3">
                        <p className="text-sm font-medium mb-2">Biriktirilgan xizmatlar</p>
                        <div className="flex flex-wrap gap-2">
                          {assistantResult.services.map((serviceId) => {
                            const service = assistantServiceOptions.find((option) => option.id === serviceId);
                            return (
                              <Badge key={serviceId} variant="secondary">
                                {service?.label ?? serviceId}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}



