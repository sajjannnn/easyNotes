const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const create = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    if (parentId) {
      const parent = await prisma.folder.findFirst({
        where: { id: parentId, userId: req.user.id },
      });
      if (!parent) {
        return res.status(404).json({ error: 'Parent folder not found.' });
      }
    }

    const folder = await prisma.folder.create({
      data: { name, userId: req.user.id, parentId: parentId || null },
    });

    return res.status(201).json({ folder });
  } catch (error) {
    console.error('Create folder error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const rename = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const folder = await prisma.folder.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found.' });
    }

    const updated = await prisma.folder.update({
      where: { id },
      data: { name },
    });

    return res.status(200).json({ folder: updated });
  } catch (error) {
    console.error('Rename folder error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await prisma.folder.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found.' });
    }

    await prisma.folder.delete({ where: { id } });

    return res.status(200).json({ message: 'Folder deleted successfully.' });
  } catch (error) {
    console.error('Delete folder error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const move = async (req, res) => {
  try {
    const { id } = req.params;
    const { parentId } = req.body;

    const folder = await prisma.folder.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found.' });
    }

    if (parentId) {
      const parent = await prisma.folder.findFirst({
        where: { id: parentId, userId: req.user.id },
      });
      if (!parent) {
        return res.status(404).json({ error: 'Parent folder not found.' });
      }
    }

    const updated = await prisma.folder.update({
      where: { id },
      data: { parentId: parentId || null },
    });

    return res.status(200).json({ folder: updated });
  } catch (error) {
    console.error('Move folder error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const getAll = async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(200).json({ folders });
  } catch (error) {
    console.error('Get folders error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { create, rename, remove, move, getAll };
