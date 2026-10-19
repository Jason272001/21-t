import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "../src/server/passwords";
import { readArticlePicture } from "../src/server/article-images";
import { articleSchema } from "../src/validators/management";

test("password hashing and anonymous blog discussion (isolated local schema)", async (t) => {
  const url = new URL(process.env.DATABASE_URL || "");
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
  const schema = `test_${randomUUID().replaceAll("-", "")}`;
  url.searchParams.set("schema", schema);
  process.env.DATABASE_URL = url.toString();
  execFileSync(
    process.execPath,
    [
      "node_modules/prisma/build/index.js",
      "migrate",
      "deploy",
      "--schema",
      "backend/prisma/schema.prisma",
    ],
    { env: process.env, stdio: "pipe" },
  );
  const { prisma } = await import("../src/lib/prisma");
  const { saveArticle, deleteArticle } = await import("../src/server/management");
  const { postComment, reactToArticle, removeComment } = await import("../src/server/discussion");
  try {
    await t.test("Passwords use salted scrypt and preserve the full password", async () => {
      const secret = "A-strong-password-123!";
      const [a, b] = await Promise.all([hashPassword(secret), hashPassword(secret)]);
      assert.notEqual(a, b);
      assert.notEqual(a, secret);
      assert.ok(a.startsWith("scrypt$v1$32768$8$3$"));
      assert.equal(await verifyPassword(secret, a), true);
      assert.equal(await verifyPassword("wrong", a), false);
      await assert.rejects(hashPassword("12345"));
      const long = "က".repeat(200);
      const longHash = await hashPassword(long);
      assert.equal(await verifyPassword(long, longHash), true);
      assert.equal(await verifyPassword(long + "x", longHash), false);
      assert.equal(await verifyPassword("a".repeat(73), a), false);
      assert.equal(await verifyPassword(secret, secret), false);
    });
    const admin = await prisma.user.create({
      data: { email: "owner@example.test", role: "ADMIN", adminLevel: "OWNER" },
    });
    const student = await prisma.user.create({
      data: { email: "student@example.test", role: "STUDENT" },
    });
    const input = articleSchema.parse({
      title: "Learning computers",
      category: "Technology",
      tags: "Computer basics, မြန်မာ, Computer basics",
      excerpt: "Practical lessons in technology.",
      content: "Learn to use a computer with practical exercises.",
      status: "DRAFT",
    });
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j0ioAAAAASUVORK5CYII=",
      "base64",
    );
    const picture = await readArticlePicture(new File([png], "cover.png", { type: "image/png" }));
    let post = await saveArticle(admin, input, undefined, picture);
    await t.test(
      "Cover images persist, tags deduplicate and unauthorized writers are rejected",
      async () => {
        const saved = await prisma.article.findUniqueOrThrow({
          where: { id: post.id },
          include: { tags: true, image: true },
        });
        assert.equal(saved.featuredImage, `/api/articles/${post.id}/image`);
        assert.equal(saved.tags.length, 2);
        assert.deepEqual(Buffer.from(saved.image!.data), png);
        await assert.rejects(saveArticle({ ...student, role: "ADMIN" }, input), /Administrator/);
        await assert.rejects(
          readArticlePicture(new File(["<svg/ >"], "bad.svg", { type: "image/svg+xml" })),
        );
        await assert.rejects(
          readArticlePicture(new File([png], "fake.jpg", { type: "image/jpeg" })),
        );
        await assert.rejects(
          readArticlePicture(
            new File([new Uint8Array(2097153)], "large.png", { type: "image/png" }),
          ),
        );
        assert.equal(articleSchema.safeParse({ ...input, tags: "x".repeat(41) }).success, false);
      },
    );
    await t.test("Tags with different punctuation remain distinct", async () => {
      await saveArticle(admin, { ...input, tags: ["C++", "C#"] }, post.id);
      const saved = await prisma.article.findUniqueOrThrow({
        where: { id: post.id },
        include: { tags: true },
      });
      assert.equal(saved.tags.length, 2);
      assert.equal(new Set(saved.tags.map((tag) => tag.slug)).size, 2);
    });
    await t.test("Drafts reject anonymous comments and votes", async () => {
      await assert.rejects(postComment(post.id, { body: "Not public" }), /unavailable/);
      await assert.rejects(reactToArticle(post.id, "UP"), /unavailable/);
      await assert.rejects(postComment("missing", { body: "Hello" }), /unavailable/);
    });
    post = await saveArticle(admin, { ...input, status: "PUBLISHED", tags: ["Changed"] }, post.id);
    await t.test(
      "Anyone can comment; only message, timestamp and internal relations are stored",
      async () => {
        const result = await postComment(post.id, {
          body: "<script>alert('test')</script> A plain text comment.",
          userId: student.id,
          ip: "127.0.0.1",
          name: "Ignored",
          email: student.email,
        });
        const comment = await prisma.articleComment.findUniqueOrThrow({ where: { id: result.id } });
        assert.deepEqual(Object.keys(comment).sort(), ["articleId", "body", "createdAt", "id"]);
        assert.ok(comment.createdAt instanceof Date);
        assert.match(comment.body, /<script>/);
        await assert.rejects(postComment(post.id, { body: " " }));
        await assert.rejects(postComment(post.id, { body: "a".repeat(2001) }));
        await assert.rejects(postComment(post.id, { body: "spam", website: "bot.example" }));
        assert.equal(
          (
            await prisma.article.findUniqueOrThrow({
              where: { id: post.id },
              include: { tags: true },
            })
          ).tags[0].name,
          "Changed",
        );
      },
    );
    await t.test(
      "Concurrent anonymous votes increment exactly, with no voter records",
      async () => {
        await Promise.all(Array.from({ length: 12 }, () => reactToArticle(post.id, "UP")));
        await Promise.all(Array.from({ length: 3 }, () => reactToArticle(post.id, "DOWN")));
        const saved = await prisma.article.findUniqueOrThrow({ where: { id: post.id } });
        assert.equal(saved.thumbsUp, 12);
        assert.equal(saved.thumbsDown, 3);
        await assert.rejects(reactToArticle(post.id, "OTHER"));
      },
    );
    await t.test(
      "Shared comment limits work without identifying visitors; moderation requires admin",
      async () => {
        await Promise.all(
          Array.from({ length: 19 }, (_, i) => postComment(post.id, { body: `Comment ${i}` })),
        );
        await assert.rejects(postComment(post.id, { body: "One more" }), /busy/);
        const comment = await prisma.articleComment.findFirstOrThrow({
          where: { articleId: post.id },
        });
        await assert.rejects(
          removeComment({ ...student, role: "ADMIN" }, post.id, comment.id),
          /Administrator/,
        );
        await removeComment(admin, post.id, comment.id);
        assert.equal(await prisma.articleComment.count({ where: { articleId: post.id } }), 19);
      },
    );
    await t.test("Image removal and article deletion clean up only dependent records", async () => {
      await saveArticle(admin, { ...input, tags: [], removeImage: true }, post.id);
      assert.equal(await prisma.articleImage.count({ where: { articleId: post.id } }), 0);
      assert.equal(
        (await prisma.article.findUniqueOrThrow({ where: { id: post.id } })).featuredImage,
        null,
      );
      await deleteArticle(admin, post.id, input.title);
      assert.equal(await prisma.articleComment.count({ where: { articleId: post.id } }), 0);
    });
  } finally {
    await prisma.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
    await prisma.$disconnect();
  }
});
