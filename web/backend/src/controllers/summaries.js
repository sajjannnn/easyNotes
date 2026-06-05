const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getByFile = async (req, res) => {
  try {
    const { fileId } = req.query;

    if (!fileId) {
      return res.status(400).json({ error: 'fileId query parameter is required.' });
    }

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId: req.user.id },
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const summaries = await prisma.summary.findMany({
      where: { fileId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ summaries });
  } catch (error) {
    console.error('Get summaries by file error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const getByVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const summary = await prisma.summary.findUnique({
      where: { videoId },
    });

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found for this video.' });
    }

    const file = await prisma.file.findFirst({
      where: { id: summary.fileId, userId: req.user.id },
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    return res.status(200).json({ summary });
  } catch (error) {
    console.error('Get summary by video error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const create = async (req, res) => {
  try {
    const { content, videoId, videoTitle, fileId } = req.body;

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId: req.user.id },
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const existing = await prisma.summary.findUnique({
      where: { videoId },
    });

    let summary;
    if (existing) {
      summary = await prisma.summary.update({
        where: { videoId },
        data: { content, videoTitle: videoTitle || existing.videoTitle, fileId },
      });
    } else {
      summary = await prisma.summary.create({
        data: {
          content,
          videoId,
          videoTitle: videoTitle || '',
          fileId,
        },
      });
    }

    return res.status(200).json({ summary });
  } catch (error) {
    console.error('Create summary error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getByFile, getByVideo, create };
