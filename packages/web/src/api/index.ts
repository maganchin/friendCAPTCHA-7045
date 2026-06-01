import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./database";
import * as schema from "./database/schema";
import { eq } from "drizzle-orm";
import { s3 } from "./lib/s3";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

const app = new Hono()
  .basePath("api")
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true }))

  .get("/health", (c) => c.json({ status: "ok" }, 200))

  // Presigned upload URL
  .post("/upload/presign", async (c) => {
    const { filename, contentType } = await c.req.json<{ filename: string; contentType: string }>();
    const key = `captchas/${nanoid()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, ContentType: contentType }),
      { expiresIn: 600 }
    );
    return c.json({ url, key }, 200);
  })

  // Signed read URL
  .post("/upload/signed-url", async (c) => {
    const { key } = await c.req.json<{ key: string }>();
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }),
      { expiresIn: 3600 * 24 }
    );
    return c.json({ url }, 200);
  })

  // Create CAPTCHA
  .post("/captchas", async (c) => {
    const body = await c.req.json<{
      resultMessage: string;
      images: { key: string; imageUrl: string; sortOrder: number }[];
      challenges: { question: string; sortOrder: number; correctImageSortOrders: number[] }[];
    }>();

    if (!body.resultMessage?.trim()) return c.json({ error: "Result message required" }, 400);
    if (!body.images || body.images.length < 4) return c.json({ error: "At least 4 images required" }, 400);
    if (body.images.length > 16) return c.json({ error: "Max 16 images" }, 400);
    if (!body.challenges || body.challenges.length < 1) return c.json({ error: "At least 1 challenge required" }, 400);
    if (body.challenges.length > 5) return c.json({ error: "Max 5 challenges" }, 400);

    const id = nanoid(10);

    await db.insert(schema.captchas).values({
      id,
      creatorName: "",
      resultMessage: body.resultMessage.trim(),
    });

    const imageIdMap = new Map<number, string>();
    for (const img of body.images) {
      const imgId = nanoid();
      imageIdMap.set(img.sortOrder, imgId);
      await db.insert(schema.captchaImages).values({
        id: imgId,
        captchaId: id,
        imageUrl: img.imageUrl,
        imageKey: img.key,
        sortOrder: img.sortOrder,
      });
    }

    for (const ch of body.challenges) {
      const chId = nanoid();
      await db.insert(schema.captchaChallenges).values({
        id: chId,
        captchaId: id,
        question: ch.question.trim(),
        sortOrder: ch.sortOrder,
      });
      for (const sortOrder of ch.correctImageSortOrders) {
        const imageId = imageIdMap.get(sortOrder);
        if (imageId) {
          await db.insert(schema.challengeCorrectImages).values({
            id: nanoid(),
            challengeId: chId,
            imageId,
          });
        }
      }
    }

    return c.json({ id }, 201);
  })

  // Get CAPTCHA for player — includes correct image IDs per challenge for client-side validation
  .get("/captchas/:id", async (c) => {
    const { id } = c.req.param();

    const captcha = await db.select().from(schema.captchas).where(eq(schema.captchas.id, id)).get();
    if (!captcha) return c.json({ error: "Not found" }, 404);

    const images = await db
      .select()
      .from(schema.captchaImages)
      .where(eq(schema.captchaImages.captchaId, id));

    const challenges = await db
      .select()
      .from(schema.captchaChallenges)
      .where(eq(schema.captchaChallenges.captchaId, id));

    // Load correct image IDs per challenge
    const correctImages = await db
      .select()
      .from(schema.challengeCorrectImages);

    const correctByChallenge = new Map<string, string[]>();
    for (const ci of correctImages) {
      const list = correctByChallenge.get(ci.challengeId) ?? [];
      list.push(ci.imageId);
      correctByChallenge.set(ci.challengeId, list);
    }

    const imagesWithUrls = await Promise.all(
      images.map(async (img) => {
        const freshUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: img.imageKey }),
          { expiresIn: 3600 * 2 }
        );
        return { id: img.id, imageUrl: freshUrl, sortOrder: img.sortOrder };
      })
    );

    const shuffled = [...imagesWithUrls].sort(() => Math.random() - 0.5);

    return c.json(
      {
        captcha: { id: captcha.id, resultMessage: captcha.resultMessage },
        images: shuffled,
        challenges: challenges
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((ch) => ({
            id: ch.id,
            question: ch.question,
            sortOrder: ch.sortOrder,
            correctImageIds: correctByChallenge.get(ch.id) ?? [],
          })),
      },
      200
    );
  });

export type AppType = typeof app;
export default app;
