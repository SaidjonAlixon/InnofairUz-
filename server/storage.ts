import { 
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Article, type InsertArticle,
  type News, type InsertNews,
  type Innovation, type InsertInnovation,
  type Comment, type InsertComment,
  type File, type InsertFile,
  type Statistics
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Articles
  getAllArticles(published?: boolean): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  getArticlesByAuthor(authorId: string): Promise<Article[]>;
  getArticlesByCategory(categoryId: string): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<boolean>;
  incrementArticleViews(id: string): Promise<void>;

  // News
  getAllNews(published?: boolean): Promise<News[]>;
  getNews(id: string): Promise<News | undefined>;
  getNewsBySlug(slug: string): Promise<News | undefined>;
  getNewsByAuthor(authorId: string): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;
  updateNews(id: string, news: Partial<InsertNews>): Promise<News | undefined>;
  deleteNews(id: string): Promise<boolean>;

  // Innovations
  getAllInnovations(published?: boolean): Promise<Innovation[]>;
  getInnovation(id: string): Promise<Innovation | undefined>;
  getInnovationBySlug(slug: string): Promise<Innovation | undefined>;
  getInnovationsByAuthor(authorId: string): Promise<Innovation[]>;
  createInnovation(innovation: InsertInnovation): Promise<Innovation>;
  updateInnovation(id: string, innovation: Partial<InsertInnovation>): Promise<Innovation | undefined>;
  deleteInnovation(id: string): Promise<boolean>;
  likeInnovation(id: string): Promise<void>;

  // Comments
  getCommentsByArticle(articleId: string, approved?: boolean): Promise<Comment[]>;
  getCommentsByNews(newsId: string, approved?: boolean): Promise<Comment[]>;
  getCommentsByInnovation(innovationId: string, approved?: boolean): Promise<Comment[]>;
  getAllComments(approved?: boolean): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  approveComment(id: string): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;
  likeComment(id: string): Promise<void>;

  // Files
  getAllFiles(): Promise<File[]>;
  getFile(id: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: string): Promise<boolean>;

  // Statistics
  getStatistics(): Promise<Statistics>;
  updateStatistics(): Promise<Statistics>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private articles: Map<string, Article>;
  private newsList: Map<string, News>;
  private innovations: Map<string, Innovation>;
  private comments: Map<string, Comment>;
  private files: Map<string, File>;
  private stats: Statistics;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.articles = new Map();
    this.newsList = new Map();
    this.innovations = new Map();
    this.comments = new Map();
    this.files = new Map();
    this.stats = {
      id: randomUUID(),
      totalArticles: 0,
      totalNews: 0,
      totalInnovations: 0,
      totalUsers: 0,
      totalViews: 0,
      updatedAt: new Date(),
    };

    // Initialize with default categories
    this.initializeCategories();
    // Initialize with a default admin user
    this.initializeAdmin();
    // Initialize with demo data
    this.initializeDemoData();
  }

  private async initializeCategories() {
    const defaultCategories = [
      { name: "Texnologiya", slug: "texnologiya" },
      { name: "Tibbiyot", slug: "tibbiyot" },
      { name: "Ta'lim", slug: "talim" },
      { name: "Energetika", slug: "energetika" },
      { name: "Startap", slug: "startap" },
      { name: "Qishloq xo'jaligi", slug: "qishloq-xojaligi" },
    ];

    for (const cat of defaultCategories) {
      await this.createCategory(cat);
    }
  }

  private async initializeAdmin() {
    // Create default admin user (password: admin123)
    await this.createUser({
      username: "admin",
      password: "admin123", // In production, this should be hashed
      fullName: "Super Admin",
      role: "super_admin",
    });

    // Create demo editor
    await this.createUser({
      username: "editor",
      password: "editor123",
      fullName: "Aziz Normatov",
      role: "editor_admin",
    });

    // Create demo users
    await this.createUser({
      username: "malika",
      password: "user123",
      fullName: "Malika Yusupova",
      role: "user",
    });

    await this.createUser({
      username: "javohir",
      password: "user123",
      fullName: "Javohir Karimov",
      role: "user",
    });
  }

  private async initializeDemoData() {
    // Wait for categories and users to be initialized
    setTimeout(async () => {
      const categories = await this.getAllCategories();
      const users = await this.getAllUsers();
      
      if (categories.length === 0 || users.length === 0) return;

      const techCat = categories.find(c => c.slug === "texnologiya");
      const medCat = categories.find(c => c.slug === "tibbiyot");
      const eduCat = categories.find(c => c.slug === "talim");
      const energyCat = categories.find(c => c.slug === "energetika");
      const startupCat = categories.find(c => c.slug === "startap");
      const agriCat = categories.find(c => c.slug === "qishloq-xojaligi");
      
      const editor = users.find(u => u.role === "editor_admin");
      if (!editor) return;

      // Create demo articles
      if (techCat) {
        await this.createArticle({
          title: "Kvant kompyuterlari: Kelajak texnologiyasi bugun",
          slug: "kvant-kompyuterlari-kelajak-texnologiyasi",
          excerpt: "Kvant kompyuterlari hozirgi paytda eng istiqbolli texnologiyalardan biri hisoblanadi va kelajakda bir qancha muammolarni hal qilishda yordam beradi.",
          content: `<p>Kvant kompyuterlari zamonaviy texnologiyaning eng muhim yutuqlaridan biri hisoblanadi. Ular klassik kompyuterlardan tubdan farq qiladi va ko'plab murakkab muammolarni hal qilishda katta imkoniyatlarga ega.</p>
            <h2>Kvant kompyuterlari qanday ishlaydi?</h2>
            <p>Kvant kompyuterlari kvant mexanikasi qonunlaridan foydalanadi. Klassik kompyuterlar ma'lumotni bitlar (0 va 1) ko'rinishida saqlasa, kvant kompyuterlari kubitlardan foydalanadi. Kubitlar bir vaqtning o'zida bir nechta holatda bo'lishi mumkin.</p>
            <h2>Qo'llanilish sohalari</h2>
            <ul>
              <li>Tibbiyot va dori-darmonlarni kashf etish</li>
              <li>Kriptografiya va xavfsizlik</li>
              <li>Moliyaviy modellashtirish</li>
              <li>Sun'iy intellekt va mashinali o'rganish</li>
            </ul>`,
          image: null,
          categoryId: techCat.id,
          authorId: editor.id,
          readTime: "8 daqiqa",
          published: true,
        });
      }

      if (medCat) {
        await this.createArticle({
          title: "Sun'iy intellekt tibbiyotda: Yangi imkoniyatlar",
          slug: "suniy-intellekt-tibbiyotda",
          excerpt: "AI texnologiyalari tibbiyotda diagnostika va davolashni yangi bosqichga olib chiqmoqda. Kasalliklarni erta aniqlash imkoniyatlari kengaymoqda.",
          content: `<p>Sun'iy intellekt tibbiyot sohasida inqilob yaratmoqda. AI tizimlar shifokorlarga aniqroq tashxis qo'yishda yordam bermoqda.</p>`,
          image: null,
          categoryId: medCat.id,
          authorId: editor.id,
          readTime: "6 daqiqa",
          published: true,
        });
      }

      if (eduCat) {
        await this.createArticle({
          title: "Virtual haqiqat ta'limda: Interaktiv ta'lim usullari",
          slug: "virtual-haqiqat-talimda",
          excerpt: "VR texnologiyalari talabalar uchun yangicha ta'lim tajribasini taqdim etmoqda. O'quv jarayoni yanada qiziqarli va samarali bo'lmoqda.",
          content: `<p>Virtual haqiqat ta'lim sohasida katta o'zgarishlar yaratmoqda.</p>`,
          image: null,
          categoryId: eduCat.id,
          authorId: editor.id,
          readTime: "5 daqiqa",
          published: true,
        });
      }

      // Create demo news
      if (energyCat) {
        await this.createNews({
          title: "O'zbekistonda yangi quyosh elektr stansiyasi ishga tushirildi",
          slug: "yangi-quyosh-elektr-stansiyasi",
          content: "Toshkent viloyatida 100 MVt quvvatli quyosh elektr stansiyasi rasman ishga tushirildi.",
          image: null,
          categoryId: energyCat.id,
          authorId: editor.id,
          published: true,
        });
      }

      if (startupCat) {
        await this.createNews({
          title: "Mahalliy startaplar xalqaro investitsiya oldi",
          slug: "startaplar-investitsiya-oldi",
          content: "O'zbekiston startaplari 5 million dollar investitsiya jalb qildi.",
          image: null,
          categoryId: startupCat.id,
          authorId: editor.id,
          published: true,
        });
      }

      // Create demo innovations
      if (energyCat) {
        await this.createInnovation({
          title: "Quyosh energiyasini saqlash uchun yangi batareya tizimi",
          slug: "yangi-batareya-tizimi",
          description: "Ushbu loyiha quyosh energiyasini samaraliroq saqlash va foydalanish imkonini beradi, bu esa energiya tejashga yordam beradi.",
          content: "Batareya tizimi quyosh panellaridan olingan energiyani saqlaydi va kerak bo'lganda tarmoqqa uzatadi.",
          image: null,
          categoryId: energyCat.id,
          authorId: editor.id,
          published: true,
        });
      }

      if (agriCat) {
        await this.createInnovation({
          title: "Aqlli issiqxona tizimi - kelajak qishloq xo'jaligi",
          slug: "aqlli-issiqxona-tizimi",
          description: "IoT texnologiyalari yordamida ishlaydigan avtomatlashtirilgan issiqxona tizimi hosildorlikni 40% oshiradi.",
          content: "Tizim harorat, namlik va yorug'likni avtomatik nazorat qiladi.",
          image: null,
          categoryId: agriCat.id,
          authorId: editor.id,
          published: true,
        });
      }

      if (techCat) {
        await this.createInnovation({
          title: "Mobil ilova orqali tibbiy xizmatlar",
          slug: "tibbiy-xizmatlar-ilovasi",
          description: "Bemorlarga shifokorlar bilan onlayn maslahatlashish va tibbiy yordamni tezkor olish imkonini beruvchi platforma.",
          content: "Ilova orqali bemor shifokor bilan bog'lanib, maslahat olishi mumkin.",
          image: null,
          categoryId: techCat.id,
          authorId: editor.id,
          published: true,
        });
      }

      await this.updateStatistics();
    }, 100);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      role: insertUser.role || "user",
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    await this.updateStatistics();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated = { ...user, ...userData };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = this.users.delete(id);
    if (deleted) await this.updateStatistics();
    return deleted;
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find((cat) => cat.slug === slug);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Articles
  async getAllArticles(published?: boolean): Promise<Article[]> {
    const articles = Array.from(this.articles.values());
    if (published !== undefined) {
      return articles.filter((a) => a.published === published);
    }
    return articles;
  }

  async getArticle(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find((a) => a.slug === slug);
  }

  async getArticlesByAuthor(authorId: string): Promise<Article[]> {
    return Array.from(this.articles.values()).filter((a) => a.authorId === authorId);
  }

  async getArticlesByCategory(categoryId: string): Promise<Article[]> {
    return Array.from(this.articles.values()).filter((a) => a.categoryId === categoryId);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const now = new Date();
    const newArticle: Article = {
      ...article,
      image: article.image || null,
      categoryId: article.categoryId || null,
      published: article.published || false,
      readTime: article.readTime || "5 daqiqa",
      id,
      views: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.articles.set(id, newArticle);
    await this.updateStatistics();
    return newArticle;
  }

  async updateArticle(id: string, articleData: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;

    const updated = { ...article, ...articleData, updatedAt: new Date() };
    this.articles.set(id, updated);
    return updated;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const deleted = this.articles.delete(id);
    if (deleted) await this.updateStatistics();
    return deleted;
  }

  async incrementArticleViews(id: string): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.views += 1;
      this.articles.set(id, article);
      await this.updateStatistics();
    }
  }

  // News
  async getAllNews(published?: boolean): Promise<News[]> {
    const news = Array.from(this.newsList.values());
    if (published !== undefined) {
      return news.filter((n) => n.published === published);
    }
    return news;
  }

  async getNews(id: string): Promise<News | undefined> {
    return this.newsList.get(id);
  }

  async getNewsBySlug(slug: string): Promise<News | undefined> {
    return Array.from(this.newsList.values()).find((n) => n.slug === slug);
  }

  async getNewsByAuthor(authorId: string): Promise<News[]> {
    return Array.from(this.newsList.values()).filter((n) => n.authorId === authorId);
  }

  async createNews(news: InsertNews): Promise<News> {
    const id = randomUUID();
    const now = new Date();
    const newNews: News = {
      ...news,
      content: news.content || null,
      image: news.image || null,
      categoryId: news.categoryId || null,
      published: news.published || false,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.newsList.set(id, newNews);
    await this.updateStatistics();
    return newNews;
  }

  async updateNews(id: string, newsData: Partial<InsertNews>): Promise<News | undefined> {
    const news = this.newsList.get(id);
    if (!news) return undefined;

    const updated = { ...news, ...newsData, updatedAt: new Date() };
    this.newsList.set(id, updated);
    return updated;
  }

  async deleteNews(id: string): Promise<boolean> {
    const deleted = this.newsList.delete(id);
    if (deleted) await this.updateStatistics();
    return deleted;
  }

  // Innovations
  async getAllInnovations(published?: boolean): Promise<Innovation[]> {
    const innovations = Array.from(this.innovations.values());
    if (published !== undefined) {
      return innovations.filter((i) => i.published === published);
    }
    return innovations;
  }

  async getInnovation(id: string): Promise<Innovation | undefined> {
    return this.innovations.get(id);
  }

  async getInnovationBySlug(slug: string): Promise<Innovation | undefined> {
    return Array.from(this.innovations.values()).find((i) => i.slug === slug);
  }

  async getInnovationsByAuthor(authorId: string): Promise<Innovation[]> {
    return Array.from(this.innovations.values()).filter((i) => i.authorId === authorId);
  }

  async createInnovation(innovation: InsertInnovation): Promise<Innovation> {
    const id = randomUUID();
    const now = new Date();
    const newInnovation: Innovation = {
      ...innovation,
      content: innovation.content || null,
      image: innovation.image || null,
      categoryId: innovation.categoryId || null,
      published: innovation.published || false,
      id,
      likes: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.innovations.set(id, newInnovation);
    await this.updateStatistics();
    return newInnovation;
  }

  async updateInnovation(id: string, innovationData: Partial<InsertInnovation>): Promise<Innovation | undefined> {
    const innovation = this.innovations.get(id);
    if (!innovation) return undefined;

    const updated = { ...innovation, ...innovationData, updatedAt: new Date() };
    this.innovations.set(id, updated);
    return updated;
  }

  async deleteInnovation(id: string): Promise<boolean> {
    const deleted = this.innovations.delete(id);
    if (deleted) await this.updateStatistics();
    return deleted;
  }

  async likeInnovation(id: string): Promise<void> {
    const innovation = this.innovations.get(id);
    if (innovation) {
      innovation.likes += 1;
      this.innovations.set(id, innovation);
    }
  }

  // Comments
  async getCommentsByArticle(articleId: string, approved?: boolean): Promise<Comment[]> {
    const comments = Array.from(this.comments.values()).filter((c) => c.articleId === articleId);
    if (approved !== undefined) {
      return comments.filter((c) => c.approved === approved);
    }
    return comments;
  }

  async getCommentsByNews(newsId: string, approved?: boolean): Promise<Comment[]> {
    const comments = Array.from(this.comments.values()).filter((c) => c.newsId === newsId);
    if (approved !== undefined) {
      return comments.filter((c) => c.approved === approved);
    }
    return comments;
  }

  async getCommentsByInnovation(innovationId: string, approved?: boolean): Promise<Comment[]> {
    const comments = Array.from(this.comments.values()).filter((c) => c.innovationId === innovationId);
    if (approved !== undefined) {
      return comments.filter((c) => c.approved === approved);
    }
    return comments;
  }

  async getAllComments(approved?: boolean): Promise<Comment[]> {
    const comments = Array.from(this.comments.values());
    if (approved !== undefined) {
      return comments.filter((c) => c.approved === approved);
    }
    return comments;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const newComment: Comment = {
      ...comment,
      articleId: comment.articleId || null,
      newsId: comment.newsId || null,
      innovationId: comment.innovationId || null,
      parentId: comment.parentId || null,
      id,
      likes: 0,
      approved: false,
      createdAt: new Date(),
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  async approveComment(id: string): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;

    comment.approved = true;
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  async likeComment(id: string): Promise<void> {
    const comment = this.comments.get(id);
    if (comment) {
      comment.likes += 1;
      this.comments.set(id, comment);
    }
  }

  // Files
  async getAllFiles(): Promise<File[]> {
    return Array.from(this.files.values());
  }

  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async createFile(file: InsertFile): Promise<File> {
    const id = randomUUID();
    const newFile: File = {
      ...file,
      description: file.description || null,
      articleId: file.articleId || null,
      newsId: file.newsId || null,
      innovationId: file.innovationId || null,
      id,
      createdAt: new Date(),
    };
    this.files.set(id, newFile);
    return newFile;
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }

  // Statistics
  async getStatistics(): Promise<Statistics> {
    return this.stats;
  }

  async updateStatistics(): Promise<Statistics> {
    this.stats = {
      ...this.stats,
      totalArticles: this.articles.size,
      totalNews: this.newsList.size,
      totalInnovations: this.innovations.size,
      totalUsers: this.users.size,
      totalViews: Array.from(this.articles.values()).reduce((sum, a) => sum + a.views, 0),
      updatedAt: new Date(),
    };
    return this.stats;
  }
}

export const storage = new MemStorage();
