import type { Express } from "express";
import { storage } from "./storage";
import express from "express";
import multer from "multer";
import path from "path";
import {
  insertArticleSchema,
  insertNewsSchema,
  insertInnovationSchema,
  insertCommentSchema,
  insertUserSchema,
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export function setupRoutes(app: Express) {
  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  // ===== Authentication Routes =====
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        return res.status(400).json({ error: "Email va parol talab qilinadi" });
      }
      const normalizedEmail = email.toLowerCase();
      const user = await storage.getUserByEmail(normalizedEmail);

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  const SELF_REGISTER_ROLES = ["investor", "mijoz"] as const;

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const normalizedEmail = userData.email.toLowerCase();
      const existingUser = await storage.getUserByEmail(normalizedEmail);

      if (existingUser) {
        return res.status(400).json({ error: "Ushbu Gmail manzili allaqachon mavjud" });
      }

      type SelfRole = (typeof SELF_REGISTER_ROLES)[number];
      const requestedRole = userData.role?.toLowerCase() as SelfRole | undefined;
      const role: SelfRole = requestedRole && SELF_REGISTER_ROLES.includes(requestedRole) ? requestedRole : "mijoz";

      const user = await storage.createUser({ ...userData, email: normalizedEmail, role });
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // ===== Categories Routes =====
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // ===== Articles Routes =====
  app.get("/api/articles", async (req, res) => {
    try {
      const published = req.query.published === "true" ? true : req.query.published === "false" ? false : undefined;
      const articles = await storage.getAllArticles(published);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      await storage.incrementArticleViews(req.params.id);
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/articles/slug/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      await storage.incrementArticleViews(article.id);
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/articles", async (req, res) => {
    try {
      const articleData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      res.status(400).json({ error: "Invalid article data" });
    }
  });

  app.patch("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.updateArticle(req.params.id, req.body);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(400).json({ error: "Invalid article data" });
    }
  });

  app.delete("/api/articles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteArticle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // ===== News Routes =====
  app.get("/api/news", async (req, res) => {
    try {
      const published = req.query.published === "true" ? true : req.query.published === "false" ? false : undefined;
      const news = await storage.getAllNews(published);
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const news = await storage.getNews(req.params.id);
      if (!news) {
        return res.status(404).json({ error: "News not found" });
      }
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const newsData = insertNewsSchema.parse(req.body);
      const news = await storage.createNews(newsData);
      res.status(201).json(news);
    } catch (error) {
      res.status(400).json({ error: "Invalid news data" });
    }
  });

  app.patch("/api/news/:id", async (req, res) => {
    try {
      const news = await storage.updateNews(req.params.id, req.body);
      if (!news) {
        return res.status(404).json({ error: "News not found" });
      }
      res.json(news);
    } catch (error) {
      res.status(400).json({ error: "Invalid news data" });
    }
  });

  app.delete("/api/news/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteNews(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "News not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // ===== Innovations Routes =====
  app.get("/api/innovations", async (req, res) => {
    try {
      const published = req.query.published === "true" ? true : req.query.published === "false" ? false : undefined;
      const innovations = await storage.getAllInnovations(published);
      res.json(innovations);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/innovations/:id", async (req, res) => {
    try {
      const innovation = await storage.getInnovation(req.params.id);
      if (!innovation) {
        return res.status(404).json({ error: "Innovation not found" });
      }
      res.json(innovation);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/innovations", async (req, res) => {
    try {
      const innovationData = insertInnovationSchema.parse(req.body);
      const innovation = await storage.createInnovation(innovationData);
      res.status(201).json(innovation);
    } catch (error) {
      res.status(400).json({ error: "Invalid innovation data" });
    }
  });

  app.patch("/api/innovations/:id", async (req, res) => {
    try {
      const innovation = await storage.updateInnovation(req.params.id, req.body);
      if (!innovation) {
        return res.status(404).json({ error: "Innovation not found" });
      }
      res.json(innovation);
    } catch (error) {
      res.status(400).json({ error: "Invalid innovation data" });
    }
  });

  app.delete("/api/innovations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInnovation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Innovation not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/innovations/:id/like", async (req, res) => {
    try {
      await storage.likeInnovation(req.params.id);
      const innovation = await storage.getInnovation(req.params.id);
      res.json(innovation);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // ===== Comments Routes =====
  app.get("/api/comments/article/:articleId", async (req, res) => {
    try {
      const approved = req.query.approved === "true" ? true : undefined;
      const comments = await storage.getCommentsByArticle(req.params.articleId, approved);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/comments/news/:newsId", async (req, res) => {
    try {
      const approved = req.query.approved === "true" ? true : undefined;
      const comments = await storage.getCommentsByNews(req.params.newsId, approved);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/comments/innovation/:innovationId", async (req, res) => {
    try {
      const approved = req.query.approved === "true" ? true : undefined;
      const comments = await storage.getCommentsByInnovation(req.params.innovationId, approved);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/comments", async (req, res) => {
    try {
      const approved = req.query.approved === "false" ? false : undefined;
      const comments = await storage.getAllComments(approved);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  app.patch("/api/comments/:id/approve", async (req, res) => {
    try {
      const comment = await storage.approveComment(req.params.id);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteComment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/comments/:id/like", async (req, res) => {
    try {
      await storage.likeComment(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // ===== Users Routes (Admin) =====
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // ===== Statistics Route =====
  app.get("/api/statistics", async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // ===== File Upload Route =====
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileData = {
        name: req.file.filename,
        originalName: req.file.originalname,
        description: req.body.description || null,
        path: `/uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.body.uploadedBy,
        articleId: req.body.articleId || null,
        newsId: req.body.newsId || null,
        innovationId: req.body.innovationId || null,
      };

      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      res.status(500).json({ error: "File upload failed" });
    }
  });

  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });
}
