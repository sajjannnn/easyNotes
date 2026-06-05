const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getByFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId: req.user.id },
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const [screenshots, comments, summaries] = await Promise.all([
      prisma.screenshot.findMany({ where: { fileId } }),
      prisma.comment.findMany({ where: { fileId } }),
      prisma.summary.findMany({ where: { fileId } }),
    ]);

    const typedScreenshots = screenshots.map((s) => ({ ...s, type: 'screenshot' }));
    const typedComments = comments.map((c) => ({ ...c, type: 'comment' }));
    const typedSummaries = summaries.map((s) => ({ ...s, type: 'summary' }));

    const merged = [...typedScreenshots, ...typedComments, ...typedSummaries].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    return res.status(200).json({ items: merged });
  } catch (error) {
    console.error('Get timeline error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getByFile };
