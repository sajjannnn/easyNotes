const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const search = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const searchTerm = `%${q.trim()}%`;
    const userId = req.user.id;

    const [folders, files, comments, summaries, screenshotVideos, commentVideos, summaryVideos] =
      await Promise.all([
        prisma.$queryRawUnsafe(
          `SELECT id, name, "userId", "parentId", "createdAt", "updatedAt" FROM "Folder" WHERE "userId" = $1 AND "name" ILIKE $2`,
          userId,
          searchTerm
        ),
        prisma.$queryRawUnsafe(
          `SELECT id, name, "userId", "folderId", "createdAt", "updatedAt" FROM "File" WHERE "userId" = $1 AND "name" ILIKE $2`,
          userId,
          searchTerm
        ),
        prisma.$queryRawUnsafe(
          `SELECT c.id, c.text, c."videoId", c."videoTitle", c.timestamp, c."youtubeUrl", c."fileId", c."createdAt"
           FROM "Comment" c
           JOIN "File" f ON f.id = c."fileId"
           WHERE f."userId" = $1 AND c.text ILIKE $2`,
          userId,
          searchTerm
        ),
        prisma.$queryRawUnsafe(
          `SELECT s.id, s.content, s."videoId", s."videoTitle", s."fileId", s."createdAt", s."updatedAt"
           FROM "Summary" s
           JOIN "File" f ON f.id = s."fileId"
           WHERE f."userId" = $1 AND s.content ILIKE $2`,
          userId,
          searchTerm
        ),
        prisma.$queryRawUnsafe(
          `SELECT DISTINCT s.id, s."imageUrl", s."videoId", s."videoTitle", s.timestamp, s."youtubeUrl", s."fileId", s."createdAt"
           FROM "Screenshot" s
           JOIN "File" f ON f.id = s."fileId"
           WHERE f."userId" = $1 AND s."videoTitle" ILIKE $2`,
          userId,
          searchTerm
        ),
        prisma.$queryRawUnsafe(
          `SELECT DISTINCT c.id, c.text, c."videoId", c."videoTitle", c.timestamp, c."youtubeUrl", c."fileId", c."createdAt"
           FROM "Comment" c
           JOIN "File" f ON f.id = c."fileId"
           WHERE f."userId" = $1 AND c."videoTitle" ILIKE $2`,
          userId,
          searchTerm
        ),
        prisma.$queryRawUnsafe(
          `SELECT DISTINCT s.id, s.content, s."videoId", s."videoTitle", s."fileId", s."createdAt", s."updatedAt"
           FROM "Summary" s
           JOIN "File" f ON f.id = s."fileId"
           WHERE f."userId" = $1 AND s."videoTitle" ILIKE $2`,
          userId,
          searchTerm
        ),
      ]);

    const videoTitles = [
      ...screenshotVideos.map((s) => ({ ...s, type: 'screenshot' })),
      ...commentVideos.map((c) => ({ ...c, type: 'comment' })),
      ...summaryVideos.map((s) => ({ ...s, type: 'summary' })),
    ];

    const uniqueVideoTitles = [];
    const seen = new Set();
    for (const item of videoTitles) {
      const key = `${item.type}-${item.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueVideoTitles.push(item);
      }
    }

    return res.status(200).json({
      results: {
        folders: folders || [],
        files: files || [],
        comments: comments || [],
        summaries: summaries || [],
        videoTitles: uniqueVideoTitles,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { search };
