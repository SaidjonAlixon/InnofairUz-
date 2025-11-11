import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  if (!value) return "—";
  return new Date(value).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [articleForm, setArticleForm] = useState<PublishableItem>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    readTime: "5 daqiqa",
    categoryId: "",
    authorId: "",
    published: true,
  });
  const [newsForm, setNewsForm] = useState<PublishableItem>({
    title: "",
    slug: "",
    content: "",
    categoryId: "",
    authorId: "",
    published: true,
  });
  const [innovationForm, setInnovationForm] = useState<PublishableItem>({
    title: "",
    slug: "",
    description: "",
    content: "",
    categoryId: "",
    authorId: "",
    published: true,
  });
  const [fileForm, setFileForm] = useState({
    file: null as File | null,
    description: "",
    uploadedBy: "",
    relatedType: "none" as "article" | "news" | "innovation" | "none",
    relatedId: "",
  });

  useEffect(() => {
    if (!user || user.role !== "super_admin") {
      navigate("/admin/login");
    }
  }, [user, navigate]);

  const { data: stats } = useQuery<Statistics>({ queryKey: ["/api/statistics"] });
  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    select: (data) => data.slice(0, 5),
  });
  const { data: news = [] } = useQuery<News[]>({
    queryKey: ["/api/news"],
    select: (data) => data.slice(0, 5),
  });
  const { data: innovations = [] } = useQuery<Innovation[]>({
    queryKey: ["/api/innovations"],
    select: (data) => data.slice(0, 5),
  });
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
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });

  const authorOptions = useMemo(() => users.filter((u) => u.role !== "user"), [users]);

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
        helper: "InnofairUz media markazi",
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

  if (!user || user.role !== "super_admin") {
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
          published: articleForm.published,
        },
        "Maqola muvaffaqiyatli qo'shildi",
        ["/api/articles", "/api/statistics"],
      );
      setArticleForm({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        readTime: "5 daqiqa",
        categoryId: "",
        authorId: "",
        published: true,
      });
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
          published: newsForm.published,
        },
        "Yangilik muvaffaqiyatli qo'shildi",
        ["/api/news", "/api/statistics"],
      );
      setNewsForm({
        title: "",
        slug: "",
        content: "",
        categoryId: "",
        authorId: "",
        published: true,
      });
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
          published: innovationForm.published,
        },
        "Innovatsion loyiha qo'shildi",
        ["/api/innovations", "/api/statistics"],
      );
      setInnovationForm({
        title: "",
        slug: "",
        description: "",
        content: "",
        categoryId: "",
        authorId: "",
        published: true,
      });
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
      setFileForm({
        file: null,
        description: "",
        uploadedBy: "",
        relatedType: "none",
        relatedId: "",
      });
    } catch (error: any) {
      toast({
        title: "Fayl yuklanmadi",
        description: error?.message ?? "Iltimos, keyinroq qayta urinib ko'ring.",
        variant: "destructive",
      });
    }
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
              <p className="text-xs uppercase tracking-wide text-muted-foreground">InnofairUz</p>
              <h1 className="text-lg font-semibold">Super admin paneli</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.username}</p>
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

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
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
              {articles.map((article) => (
                <div key={article.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium">{article.title}</h3>
                    <Badge variant="outline">{article.readTime}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{formatDate(article.createdAt)}</span>
                    <span>•</span>
                    <span>ID: {article.id.slice(0, 8)}</span>
                  </div>
                </div>
              ))}
              {articles.length === 0 && <p className="text-sm text-muted-foreground">Maqolalar topilmadi.</p>}
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>So'nggi yangiliklar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <Badge variant="outline">{item.categoryId ? "Kategoriya" : "Umumiy"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{formatDate(item.createdAt)}</span>
                    <span>•</span>
                    <span>ID: {item.id.slice(0, 8)}</span>
                  </div>
                </div>
              ))}
              {news.length === 0 && <p className="text-sm text-muted-foreground">Yangiliklar mavjud emas.</p>}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Innovatsiyalar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {innovations.map((item) => (
                <div key={item.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <Badge variant="secondary">{item.likes} like</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{formatDate(item.createdAt)}</span>
                    <span>•</span>
                    <span>ID: {item.id.slice(0, 8)}</span>
                  </div>
                </div>
              ))}
              {innovations.length === 0 && <p className="text-sm text-muted-foreground">Innovatsiyalar topilmadi.</p>}
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
                    </div>
                  </div>
                </div>
              ))}
              {pendingComments.length === 0 && <p className="text-sm text-muted-foreground">Tasdiqlash uchun sharh qoldirilmagan.</p>}
            </CardContent>
          </Card>
        </section>

        <section>
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
                      <td className="py-2 pr-4">{u.username}</td>
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
                      value={articleForm.categoryId ?? ""}
                      onValueChange={(value) => setArticleForm((prev) => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategoriya tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Kategoriya tanlanmagan</SelectItem>
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
                      value={articleForm.authorId ?? ""}
                      onValueChange={(value) => setArticleForm((prev) => ({ ...prev, authorId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Muallif tanlang" />
                      </SelectTrigger>
                      <SelectContent>
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
                      checked={articleForm.published}
                      onCheckedChange={(value) =>
                        setArticleForm((prev) => ({ ...prev, published: value }))
                      }
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
                      value={newsForm.categoryId ?? ""}
                      onValueChange={(value) => setNewsForm((prev) => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategoriya tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Kategoriya tanlanmagan</SelectItem>
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
                      value={newsForm.authorId ?? ""}
                      onValueChange={(value) => setNewsForm((prev) => ({ ...prev, authorId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Muallif tanlang" />
                      </SelectTrigger>
                      <SelectContent>
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
                      checked={newsForm.published}
                      onCheckedChange={(value) => setNewsForm((prev) => ({ ...prev, published: value }))}
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
                      value={innovationForm.categoryId ?? ""}
                      onValueChange={(value) => setInnovationForm((prev) => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategoriya tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Kategoriya tanlanmagan</SelectItem>
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
                      value={innovationForm.authorId ?? ""}
                      onValueChange={(value) => setInnovationForm((prev) => ({ ...prev, authorId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Muallif tanlang" />
                      </SelectTrigger>
                      <SelectContent>
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
                      checked={innovationForm.published}
                      onCheckedChange={(value) =>
                        setInnovationForm((prev) => ({ ...prev, published: value }))
                      }
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
                    value={fileForm.uploadedBy}
                    onValueChange={(value) => setFileForm((prev) => ({ ...prev, uploadedBy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {authorOptions.map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.fullName} ({author.username})
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
      </main>
    </div>
  );
}
