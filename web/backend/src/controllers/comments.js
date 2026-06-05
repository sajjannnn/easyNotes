const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const create = async (req, res) => {
  try {
    const { text, videoId, videoTitle, timestamp, youtubeUrl, fileId } = req.body;

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId: req.user.id },
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        videoId,
        videoTitle: videoTitle || '',
        timestamp: parseFloat(timestamp) || 0,
        youtubeUrl: youtubeUrl || '',
        fileId,
      },
    });

    const existingSummary = await prisma.summary.findUnique({
      where: { videoId },
    });
    if (!existingSummary) {
      await prisma.summary.create({
        data: {
          content: '',
          videoId,
          videoTitle: videoTitle || '',
          fileId,
        },
      });
    }

    return res.status(201).json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

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

    const comments = await prisma.comment.findMany({
      where: { fileId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    const file = await prisma.file.findFirst({
      where: { id: comment.fileId, userId: req.user.id },
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    await prisma.comment.delete({ where: { id } });

    return res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { create, getByFile, remove };
