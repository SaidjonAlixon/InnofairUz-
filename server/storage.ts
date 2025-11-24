import { 
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Article, type InsertArticle,
  type News, type InsertNews,
  type Innovation, type InsertInnovation,
  type Comment, type InsertComment,
  type File, type InsertFile,
  type Statistics,
  type EmailVerificationToken
} from "@shared/schema";
import { db } from "./db";
import { 
  users, categories, articles, news, innovations, 
  comments, files, statistics, emailVerificationTokens
} from "@shared/schema";
import { eq, and, or, isNull, sql, desc } from "drizzle-orm";
import { log } from "./logger";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  createComment(comment: InsertComment, autoApprove?: boolean): Promise<Comment>;
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

export class PostgresStorage implements IStorage {
  constructor() {
    // Initialize default data on first run
    this.initialize();
  }

  private async initialize() {
    try {
      log("Initializing database...");
      
      // Test database connection first
      try {
        log("Testing database connection...");
        await db.select().from(categories).limit(1);
        log("Database connection successful");
      } catch (connError: any) {
        const errorMessage = connError?.message || "Unknown connection error";
        const errorName = connError?.name || "N/A";
        const errorCode = connError?.code || "N/A";
        const errorCause = connError?.cause ? JSON.stringify(connError.cause) : "N/A";
        
        log(`Database connection failed: ${errorMessage}`, "error");
        log(`Error name: ${errorName}`, "error");
        log(`Error code: ${errorCode}`, "error");
        log(`Error cause: ${errorCause}`, "error");
        
        if (connError?.stack) {
          const stackLines = connError.stack.split('\n').slice(0, 5).join('\n');
          log(`Error stack (first 5 lines):\n${stackLines}`, "error");
        }
        
        // Check if DATABASE_URL is set
        if (!process.env.DATABASE_URL) {
          log("DATABASE_URL environment variable is not set!", "error");
        } else {
          const dbUrl = process.env.DATABASE_URL;
          const maskedUrl = dbUrl.substring(0, 20) + "..." + dbUrl.substring(dbUrl.length - 10);
          log(`DATABASE_URL is set: ${maskedUrl}`, "error");
        }
        
        return; // Exit early if connection fails
      }
      
      // Check if categories exist
      const existingCategories = await db.select().from(categories).limit(1);
      if (existingCategories.length === 0) {
        log("Initializing categories...");
        await this.initializeCategories();
        log("Categories initialized");
      }

      // Check if admin user exists
      const adminUser = await db.select().from(users).where(eq(users.email, "admin@gmail.com")).limit(1);
      if (adminUser.length === 0) {
        log("Initializing admin users...");
        await this.initializeAdmin();
        log("Admin users initialized");
      }

      // Check if statistics exist
      const existingStats = await db.select().from(statistics).limit(1);
      if (existingStats.length === 0) {
        log("Initializing statistics...");
        await this.updateStatistics();
        log("Statistics initialized");
      }
      log("Database initialization completed successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error";
      const errorCode = error?.code || "N/A";
      const errorName = error?.name || "N/A";
      log(`Error initializing database: ${errorMessage}`, "error");
      log(`Error name: ${errorName}`, "error");
      log(`Error code: ${errorCode}`, "error");
      if (error?.cause) {
        log(`Error cause: ${JSON.stringify(error.cause)}`, "error");
      }
      if (error?.stack) {
        const stackLines = error.stack.split('\n').slice(0, 10).join('\n');
        log(`Error stack (first 10 lines):\n${stackLines}`, "error");
      }
      // Don't throw - allow server to start even if initialization fails
    }
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
      await db.insert(categories).values(cat).onConflictDoNothing();
    }
  }

  private async initializeAdmin() {
    const defaultUsers = [
      {
        email: "admin@gmail.com",
        password: "admin123",
        fullName: "Super Admin",
        role: "super_admin",
      },
      {
        email: "editor@gmail.com",
        password: "editor123",
        fullName: "Aziz Normatov",
        role: "editor_admin",
      },
      {
        email: "malika@gmail.com",
        password: "user123",
        fullName: "Malika Yusupova",
        role: "user",
      },
      {
        email: "javohir@gmail.com",
        password: "user123",
        fullName: "Javohir Karimov",
        role: "user",
      },
    ];

    for (const userData of defaultUsers) {
      await db.insert(users).values({
        ...userData,
        email: userData.email.toLowerCase(),
      }).onConflictDoNothing();
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = email.toLowerCase().trim();
    const result = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      email: userData.email.toLowerCase(),
      role: userData.role || "user",
    }).returning();
    await this.updateStatistics();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, userData: Partial<InsertUser & { emailVerified?: boolean }>): Promise<User | undefined> {
    try {
      const updateData: any = { ...userData };
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      // Ensure we only update valid fields
      const validFields: (keyof User)[] = ['fullName', 'email', 'avatar', 'role', 'emailVerified', 'metadata'];
      const filteredData: any = {};
      for (const key of validFields) {
        if (key in updateData) {
          filteredData[key] = updateData[key];
        }
      }
      
      if (Object.keys(filteredData).length === 0) {
        return await this.getUser(id);
      }
      
      const [updated] = await db.update(users)
        .set(filteredData)
        .where(eq(users.id, id))
        .returning();
      
      return updated;
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error";
      const errorCode = error?.code || "N/A";
      const errorDetail = error?.detail || error?.hint || "N/A";
      log(`Error updating user: ${errorMessage}`, "error");
      log(`Error code: ${errorCode}`, "error");
      log(`Error detail: ${errorDetail}`, "error");
      if (error?.stack) {
        log(`Error stack: ${error.stack.substring(0, 500)}`, "error");
      }
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    if (result.length > 0) {
      await this.updateStatistics();
      return true;
    }
    return false;
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  // Articles
  async getAllArticles(published?: boolean): Promise<Article[]> {
    if (published !== undefined) {
      return await db.select().from(articles).where(eq(articles.published, published)).orderBy(desc(articles.createdAt));
    }
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    return result[0];
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    return result[0];
  }

  async getArticlesByAuthor(authorId: string): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.authorId, authorId)).orderBy(desc(articles.createdAt));
  }

  async getArticlesByCategory(categoryId: string): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.categoryId, categoryId)).orderBy(desc(articles.createdAt));
  }

  async createArticle(articleData: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values({
      ...articleData,
      image: articleData.image || null,
      categoryId: articleData.categoryId || null,
      published: articleData.published || false,
      readTime: articleData.readTime || "5 daqiqa",
      views: 0,
    }).returning();
    await this.updateStatistics();
    return article;
  }

  async updateArticle(id: string, articleData: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updated] = await db.update(articles)
      .set({ ...articleData, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return updated;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id)).returning();
    if (result.length > 0) {
      await this.updateStatistics();
      return true;
    }
    return false;
  }

  async incrementArticleViews(id: string): Promise<void> {
    await db.update(articles)
      .set({ views: sql`${articles.views} + 1` })
      .where(eq(articles.id, id));
    await this.updateStatistics();
  }

  // News
  async getAllNews(published?: boolean): Promise<News[]> {
    if (published !== undefined) {
      return await db.select().from(news).where(eq(news.published, published)).orderBy(desc(news.createdAt));
    }
    return await db.select().from(news).orderBy(desc(news.createdAt));
  }

  async getNews(id: string): Promise<News | undefined> {
    const result = await db.select().from(news).where(eq(news.id, id)).limit(1);
    return result[0];
  }

  async getNewsBySlug(slug: string): Promise<News | undefined> {
    const result = await db.select().from(news).where(eq(news.slug, slug)).limit(1);
    return result[0];
  }

  async getNewsByAuthor(authorId: string): Promise<News[]> {
    return await db.select().from(news).where(eq(news.authorId, authorId)).orderBy(desc(news.createdAt));
  }

  async createNews(newsData: InsertNews): Promise<News> {
    const [newsItem] = await db.insert(news).values({
      ...newsData,
      content: newsData.content || null,
      image: newsData.image || null,
      categoryId: newsData.categoryId || null,
      published: newsData.published || false,
    }).returning();
    await this.updateStatistics();
    return newsItem;
  }

  async updateNews(id: string, newsData: Partial<InsertNews>): Promise<News | undefined> {
    const [updated] = await db.update(news)
      .set({ ...newsData, updatedAt: new Date() })
      .where(eq(news.id, id))
      .returning();
    return updated;
  }

  async deleteNews(id: string): Promise<boolean> {
    const result = await db.delete(news).where(eq(news.id, id)).returning();
    if (result.length > 0) {
      await this.updateStatistics();
      return true;
    }
    return false;
  }

  // Innovations
  async getAllInnovations(published?: boolean): Promise<Innovation[]> {
    if (published !== undefined) {
      return await db.select().from(innovations).where(eq(innovations.published, published)).orderBy(desc(innovations.createdAt));
    }
    return await db.select().from(innovations).orderBy(desc(innovations.createdAt));
  }

  async getInnovation(id: string): Promise<Innovation | undefined> {
    const result = await db.select().from(innovations).where(eq(innovations.id, id)).limit(1);
    return result[0];
  }

  async getInnovationBySlug(slug: string): Promise<Innovation | undefined> {
    const result = await db.select().from(innovations).where(eq(innovations.slug, slug)).limit(1);
    return result[0];
  }

  async getInnovationsByAuthor(authorId: string): Promise<Innovation[]> {
    return await db.select().from(innovations).where(eq(innovations.authorId, authorId)).orderBy(desc(innovations.createdAt));
  }

  async createInnovation(innovationData: InsertInnovation): Promise<Innovation> {
    const [innovation] = await db.insert(innovations).values({
      ...innovationData,
      content: innovationData.content || null,
      image: innovationData.image || null,
      categoryId: innovationData.categoryId || null,
      published: innovationData.published || false,
      likes: 0,
    }).returning();
    await this.updateStatistics();
    return innovation;
  }

  async updateInnovation(id: string, innovationData: Partial<InsertInnovation>): Promise<Innovation | undefined> {
    const [updated] = await db.update(innovations)
      .set({ ...innovationData, updatedAt: new Date() })
      .where(eq(innovations.id, id))
      .returning();
    return updated;
  }

  async deleteInnovation(id: string): Promise<boolean> {
    const result = await db.delete(innovations).where(eq(innovations.id, id)).returning();
    if (result.length > 0) {
      await this.updateStatistics();
      return true;
    }
    return false;
  }

  async likeInnovation(id: string): Promise<void> {
    await db.update(innovations)
      .set({ likes: sql`${innovations.likes} + 1` })
      .where(eq(innovations.id, id));
  }

  // Comments
  async getCommentsByArticle(articleId: string, approved?: boolean): Promise<Comment[]> {
    const conditions = [eq(comments.articleId, articleId)];
    if (approved !== undefined) {
      conditions.push(eq(comments.approved, approved));
    }
    return await db.select().from(comments).where(and(...conditions)).orderBy(desc(comments.createdAt));
  }

  async getCommentsByNews(newsId: string, approved?: boolean): Promise<Comment[]> {
    const conditions = [eq(comments.newsId, newsId)];
    if (approved !== undefined) {
      conditions.push(eq(comments.approved, approved));
    }
    return await db.select().from(comments).where(and(...conditions)).orderBy(desc(comments.createdAt));
  }

  async getCommentsByInnovation(innovationId: string, approved?: boolean): Promise<Comment[]> {
    const conditions = [eq(comments.innovationId, innovationId)];
    if (approved !== undefined) {
      conditions.push(eq(comments.approved, approved));
    }
    return await db.select().from(comments).where(and(...conditions)).orderBy(desc(comments.createdAt));
  }

  async getAllComments(approved?: boolean): Promise<Comment[]> {
    if (approved !== undefined) {
      return await db.select().from(comments).where(eq(comments.approved, approved)).orderBy(desc(comments.createdAt));
    }
    return await db.select().from(comments).orderBy(desc(comments.createdAt));
  }

  async createComment(commentData: InsertComment, autoApprove: boolean = false): Promise<Comment> {
    const [comment] = await db.insert(comments).values({
      ...commentData,
      articleId: commentData.articleId || null,
      newsId: commentData.newsId || null,
      innovationId: commentData.innovationId || null,
      parentId: commentData.parentId || null,
      likes: 0,
      approved: autoApprove, // Auto-approve for general discussions (G'oyalar klubi)
    }).returning();
    return comment;
  }

  async approveComment(id: string): Promise<Comment | undefined> {
    const [updated] = await db.update(comments)
      .set({ approved: true })
      .where(eq(comments.id, id))
      .returning();
    return updated;
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  async likeComment(id: string): Promise<void> {
    await db.update(comments)
      .set({ likes: sql`${comments.likes} + 1` })
      .where(eq(comments.id, id));
  }

  // Files
  async getAllFiles(): Promise<File[]> {
    return await db.select().from(files).orderBy(desc(files.createdAt));
  }

  async getFile(id: string): Promise<File | undefined> {
    const result = await db.select().from(files).where(eq(files.id, id)).limit(1);
    return result[0];
  }

  async createFile(fileData: InsertFile): Promise<File> {
    const [file] = await db.insert(files).values({
      ...fileData,
      description: fileData.description || null,
      articleId: fileData.articleId || null,
      newsId: fileData.newsId || null,
      innovationId: fileData.innovationId || null,
    }).returning();
    return file;
  }

  async deleteFile(id: string): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id)).returning();
    return result.length > 0;
  }

  // Statistics
  async getStatistics(): Promise<Statistics> {
    const result = await db.select().from(statistics).limit(1);
    if (result.length > 0) {
      return result[0];
    }
    // If no statistics exist, create one
    return await this.updateStatistics();
  }

  async updateStatistics(): Promise<Statistics> {
    const [articlesCount] = await db.select({ count: sql<number>`count(*)` }).from(articles);
    const [newsCount] = await db.select({ count: sql<number>`count(*)` }).from(news);
    const [innovationsCount] = await db.select({ count: sql<number>`count(*)` }).from(innovations);
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [viewsSum] = await db.select({ sum: sql<number>`coalesce(sum(${articles.views}), 0)` }).from(articles);

    const statsData = {
      totalArticles: Number(articlesCount.count) || 0,
      totalNews: Number(newsCount.count) || 0,
      totalInnovations: Number(innovationsCount.count) || 0,
      totalUsers: Number(usersCount.count) || 0,
      totalViews: Number(viewsSum.sum) || 0,
      updatedAt: new Date(),
    };

    const existing = await db.select().from(statistics).limit(1);
    if (existing.length > 0) {
      const [updated] = await db.update(statistics)
        .set(statsData)
        .where(eq(statistics.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(statistics).values(statsData).returning();
      return created;
    }
  }

  // Email Verification
  async createVerificationToken(userId: string, token: string, expiresAt: Date): Promise<EmailVerificationToken> {
    const [verificationToken] = await db.insert(emailVerificationTokens).values({
      userId,
      token,
      expiresAt,
    }).returning();
    return verificationToken;
  }

  async getVerificationToken(token: string): Promise<EmailVerificationToken | undefined> {
    const result = await db.select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token))
      .limit(1);
    return result[0];
  }

  async deleteVerificationToken(token: string): Promise<boolean> {
    const result = await db.delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token))
      .returning();
    return result.length > 0;
  }

  async verifyUserEmail(userId: string): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }
}

export const storage = new PostgresStorage();
