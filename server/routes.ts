import type { Express } from "express";
import { storage } from "./storage";
import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import {
  insertArticleSchema,
  insertNewsSchema,
  insertInnovationSchema,
  insertCommentSchema,
  insertUserSchema,
} from "@shared/schema";
import { sendVerificationEmail } from "./email";
import { log } from "./logger";

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

      const user = await storage.createUser({ ...userData, email: normalizedEmail, role, emailVerified: false });
      
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

      // Save verification token
      await storage.createVerificationToken(user.id, verificationToken, expiresAt);

      // Send verification email
      try {
        await sendVerificationEmail({
          email: normalizedEmail,
          fullName: user.fullName,
          verificationToken,
        });
        log(`Verification email sent to ${normalizedEmail}`);
      } catch (emailError: any) {
        log(`Email yuborishda xatolik: ${emailError?.message || "Unknown error"}`, "error");
        // Continue even if email fails - user can request resend later
        // But log the error for debugging
      }

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ 
        user: userWithoutPassword,
        message: "Ro'yxatdan o'tdingiz! Gmail manzilingizni tasdiqlash uchun emailingizni tekshiring." 
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Update user profile route
  app.patch("/api/auth/profile", async (req, res) => {
    try {
      const { userId, fullName, email, avatar } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID talab qilinadi" });
      }

      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;
      if (email) {
        const normalizedEmail = email.toLowerCase();
        // Check if email is already taken by another user
        const existingUser = await storage.getUserByEmail(normalizedEmail);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: "Bu Gmail manzili allaqachon mavjud" });
        }
        updateData.email = normalizedEmail;
        updateData.emailVerified = false; // Reset verification when email changes
      }
      if (avatar !== undefined) updateData.avatar = avatar;

      // If no updates, return current user
      if (Object.keys(updateData).length === 0) {
        const currentUser = await storage.getUser(userId);
        if (!currentUser) {
          return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
        }
        const { password: _, ...userWithoutPassword } = currentUser;
        return res.json({ user: userWithoutPassword });
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error";
      const errorCode = error?.code || "N/A";
      const errorDetail = error?.detail || error?.hint || "N/A";
      log(`Profile update error: ${errorMessage}`, "error");
      log(`Error code: ${errorCode}`, "error");
      log(`Error detail: ${errorDetail}`, "error");
      if (error?.stack) {
        log(`Error stack: ${error.stack.substring(0, 500)}`, "error");
      }
      res.status(500).json({ 
        error: errorMessage,
        code: errorCode,
        detail: errorDetail
      });
    }
  });

  // Change password route
  app.patch("/api/auth/change-password", async (req, res) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: "Barcha maydonlar talab qilinadi" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      if (user.password !== currentPassword) {
        return res.status(401).json({ error: "Joriy parol noto'g'ri" });
      }

      const updatedUser = await storage.updateUser(userId, { password: newPassword });
      if (!updatedUser) {
        return res.status(500).json({ error: "Parolni yangilashda xatolik" });
      }

      res.json({ success: true, message: "Parol muvaffaqiyatli yangilandi" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Email verification route
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ error: "Tasdiqlash tokeni talab qilinadi" });
      }

      const verificationToken = await storage.getVerificationToken(token);
      if (!verificationToken) {
        return res.status(400).json({ error: "Noto'g'ri yoki muddati o'tgan tasdiqlash tokeni" });
      }

      // Check if token is expired
      if (new Date() > verificationToken.expiresAt) {
        await storage.deleteVerificationToken(token);
        return res.status(400).json({ error: "Tasdiqlash tokeni muddati o'tgan" });
      }

      // Verify user email
      const user = await storage.verifyUserEmail(verificationToken.userId);
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      // Delete used token
      await storage.deleteVerificationToken(token);

      res.json({ 
        success: true,
        message: "Gmail manzilingiz muvaffaqiyatli tasdiqlandi!",
        user 
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
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
      // If it's a general discussion (no articleId, newsId, innovationId), auto-approve
      // Also auto-approve replies to general discussions
      const isGeneralDiscussion = !commentData.articleId && !commentData.newsId && !commentData.innovationId;
      let shouldAutoApprove = isGeneralDiscussion;
      
      // If it's a reply to a general discussion post, also auto-approve
      if (commentData.parentId && isGeneralDiscussion) {
        shouldAutoApprove = true;
      }
      
      const comment = await storage.createComment(commentData, shouldAutoApprove);
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

  // ===== Assistant Management (Admin) =====
  app.post("/api/admin/assistants", async (req, res) => {
    try {
      const { fullName, email, password, services = [], notes } = req.body ?? {};

      if (!fullName || !email || !password) {
        return res.status(400).json({ error: "To'liq ism, email va parol talab qilinadi" });
      }

      const normalizedEmail = String(email).toLowerCase();
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ error: "Bu email allaqachon mavjud" });
      }

      const assistantData = insertUserSchema.parse({
        fullName,
        email: normalizedEmail,
        password,
        role: "assistant",
        metadata: {
          services: Array.isArray(services) ? services : [],
          notes: notes ? String(notes) : "",
        },
      });

      const user = await storage.createUser(assistantData);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        loginLink: "/admin/login",
      });
    } catch (error) {
      res.status(400).json({ error: "Assistent yaratib bo'lmadi" });
    }
  });

  // ===== Users Routes (Admin) =====
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      const sanitized = users.map((user) => {
        const mutableUser = { ...user } as typeof user & { username?: string };
        const legacyUsername = mutableUser.username;
        if (!mutableUser.email && legacyUsername) {
          mutableUser.email = `${legacyUsername}@gmail.com`;
        }
        delete mutableUser.password;
        delete mutableUser.username;
        return mutableUser;
      });
      res.json(sanitized);
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

  // Avatar upload route
  app.post("/api/upload/avatar", upload.single("avatar"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Rasm yuklanmadi" });
      }

      // Validate image type
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ error: "Faqat rasm fayllari qabul qilinadi" });
      }

      const avatarUrl = `/uploads/${req.file.filename}`;
      res.status(201).json({ avatar: avatarUrl });
    } catch (error) {
      res.status(500).json({ error: "Rasm yuklashda xatolik" });
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
