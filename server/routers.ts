import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createTask,
  getUserTasks,
  updateTask,
  deleteTask,
  createDocument,
  getUserDocuments,
  deleteDocument,
  getUserNotifications,
  markNotificationAsRead,
  getUserMetrics,
} from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tasks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserTasks(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        category: z.string().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        let aiSummary: string | null = null;
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are a helpful task assistant. Provide a brief, actionable summary of the task." },
              { role: "user", content: `Task: ${input.title}\nDescription: ${input.description || 'No description'}` },
            ],
          });
          const content = response.choices[0]?.message.content;
          aiSummary = typeof content === 'string' ? content : null;
        } catch (error) {
          console.error("AI summary generation failed:", error);
        }
        
        return createTask(ctx.user.id, {
          title: input.title,
          description: input.description,
          priority: input.priority || "medium",
          category: input.category,
          dueDate: input.dueDate,
          aiSummary,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["todo", "in_progress", "completed", "archived"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        category: z.string().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        return updateTask(id, ctx.user.id, updates);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return deleteTask(input.id, ctx.user.id);
      }),
  }),
  documents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserDocuments(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().optional(),
        fileUrl: z.string().optional(),
        fileKey: z.string().optional(),
        mimeType: z.string().optional(),
        tags: z.string().optional(),
        category: z.string().optional(),
        isPublic: z.enum(["private", "team", "public"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createDocument(ctx.user.id, {
          title: input.title,
          content: input.content,
          fileUrl: input.fileUrl,
          fileKey: input.fileKey,
          mimeType: input.mimeType,
          tags: input.tags,
          category: input.category,
          isPublic: input.isPublic || "private",
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return deleteDocument(input.id, ctx.user.id);
      }),
  }),
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserNotifications(ctx.user.id);
    }),
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return markNotificationAsRead(input.id);
      }),
  }),
  analytics: router({
    getMetrics: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ ctx, input }) => {
        return getUserMetrics(ctx.user.id, input.startDate, input.endDate);
      }),
  }),
});

export type AppRouter = typeof appRouter;
