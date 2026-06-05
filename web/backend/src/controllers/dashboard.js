const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalFolders, totalFiles, totalScreenshots, totalComments, totalSummaries] =
      await Promise.all([
        prisma.folder.count({ where: { userId } }),
        prisma.file.count({ where: { userId } }),
        prisma.screenshot.count({
          where: { file: { userId } },
        }),
        prisma.comment.count({
          where: { file: { userId } },
        }),
        prisma.summary.count({
          where: { file: { userId } },
        }),
      ]);

    return res.status(200).json({
      stats: {
        totalFolders,
        totalFiles,
        totalScreenshots,
        totalComments,
        totalSummaries,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const getRecent = async (req, res) => {
  try {
    const userId = req.user.id;

    const [screenshots, comments, summaries] = await Promise.all([
      prisma.screenshot.findMany({
        where: { file: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.comment.findMany({
        where: { file: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.summary.findMany({
        where: { file: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const typed = [
      ...screenshots.map((s) => ({ ...s, type: 'screenshot' })),
      ...comments.map((c) => ({ ...c, type: 'comment' })),
      ...summaries.map((s) => ({ ...s, type: 'summary' })),
    ];

    typed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ items: typed.slice(0, 10) });
  } catch (error) {
    console.error('Get recent error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const getRecentFiles = async (req, res) => {
  try {
    const userId = req.user.id;

    const files = await prisma.file.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return res.status(200).json({ files });
  } catch (error) {
    console.error('Get recent files error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getStats, getRecent, getRecentFiles };
