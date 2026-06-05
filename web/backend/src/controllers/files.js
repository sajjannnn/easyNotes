const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const create = async (req, res) => {
  try {
    const { name, folderId } = req.body;

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId: req.user.id },
      });
      if (!folder) {
        return res.status(404).json({ error: 'Folder not found.' });
      }
    }

    const file = await prisma.file.create({
      data: { name, userId: req.user.id, folderId: folderId || null },
    });

    return res.status(201).json({ file });
  } catch (error) {
    console.error('Create file error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const rename = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const file = await prisma.file.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const updated = await prisma.file.update({
      where: { id },
      data: { name },
    });

    return res.status(200).json({ file: updated });
  } catch (error) {
    console.error('Rename file error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await prisma.file.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    await prisma.file.delete({ where: { id } });

    return res.status(200).json({ message: 'File deleted successfully.' });
  } catch (error) {
    console.error('Delete file error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const move = async (req, res) => {
  try {
    const { id } = req.params;
    const { folderId } = req.body;

    const file = await prisma.file.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId: req.user.id },
      });
      if (!folder) {
        return res.status(404).json({ error: 'Folder not found.' });
      }
    }

    const updated = await prisma.file.update({
      where: { id },
      data: { folderId: folderId || null },
    });

    return res.status(200).json({ file: updated });
  } catch (error) {
    console.error('Move file error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const getAll = async (req, res) => {
  try {
    const { folderId } = req.query;
    const where = { userId: req.user.id };
    if (folderId) {
      where.folderId = folderId;
    }

    const files = await prisma.file.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await prisma.file.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }
    return res.status(200).json(file);
  } catch (error) {
    console.error('Get file by id error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { create, rename, remove, move, getAll, getById };
