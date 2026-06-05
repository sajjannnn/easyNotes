const { PrismaClient } = require('@prisma/client');
const { uploadFile, deleteFile } = require('../services/s3');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const create = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const { videoId, videoTitle, timestamp, youtubeUrl, fileId } = req.body;

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId: req.user.id },
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const key = `screenshots/${uuidv4()}-${req.file.originalname}`;
    const imageUrl = await uploadFile(req.file.buffer, key, req.file.mimetype);

    const screenshot = await prisma.screenshot.create({
      data: {
        imageUrl,
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

    return res.status(201).json({ screenshot });
  } catch (error) {
    console.error('Create screenshot error:', error);
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

    const screenshots = await prisma.screenshot.findMany({
      where: { fileId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ screenshots });
  } catch (error) {
    console.error('Get screenshots error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const screenshot = await prisma.screenshot.findUnique({ where: { id } });
    if (!screenshot) {
      return res.status(404).json({ error: 'Screenshot not found.' });
    }

    const file = await prisma.file.findFirst({
      where: { id: screenshot.fileId, userId: req.user.id },
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    await prisma.screenshot.delete({ where: { id } });

    try {
      if (screenshot.imageUrl) {
        await deleteFile(screenshot.imageUrl);
      }
    } catch (s3Err) {
      console.error('Failed to delete S3 object, DB record already removed:', s3Err);
    }

    return res.status(200).json({ message: 'Screenshot deleted successfully.' });
  } catch (error) {
    console.error('Delete screenshot error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { create, getByFile, remove };
