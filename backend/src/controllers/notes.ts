import { Response } from 'express';
import { prisma } from '../config/db';
import { InMemoryDb } from '../utils/inMemoryDb';
import { AuthenticatedRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

// Notes CRUD
export const getNotes = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    let notes;
    try {
      notes = await prisma.note.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
      if (notes.length === 0) {
        notes = InMemoryDb.notes.filter((n) => n.userId === userId);
      }
    } catch {
      notes = InMemoryDb.notes.filter((n) => n.userId === userId);
    }
    return res.status(200).json(notes);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createNote = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { title, content, folder } = req.body;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    let note;
    try {
      note = await prisma.note.create({
        data: { userId, title, content: content || '', folder: folder || 'General' }
      });
    } catch {
      note = {
        id: uuidv4(),
        userId,
        title,
        content: content || '',
        folder: folder || 'General',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      InMemoryDb.notes.push(note);
    }
    return res.status(201).json(note);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateNote = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, content, folder } = req.body;

  try {
    let note;
    try {
      note = await prisma.note.update({
        where: { id },
        data: { title, content, folder, updatedAt: new Date() }
      });
    } catch {
      const idx = InMemoryDb.notes.findIndex((n) => n.id === id);
      if (idx !== -1) {
        InMemoryDb.notes[idx] = {
          ...InMemoryDb.notes[idx],
          title: title !== undefined ? title : InMemoryDb.notes[idx].title,
          content: content !== undefined ? content : InMemoryDb.notes[idx].content,
          folder: folder !== undefined ? folder : InMemoryDb.notes[idx].folder,
          updatedAt: new Date()
        };
        note = InMemoryDb.notes[idx];
      }
    }

    if (!note) return res.status(404).json({ error: 'Note not found' });
    return res.status(200).json(note);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    let deleted = false;
    try {
      await prisma.note.delete({ where: { id } });
      deleted = true;
    } catch {
      const idx = InMemoryDb.notes.findIndex((n) => n.id === id);
      if (idx !== -1) {
        InMemoryDb.notes.splice(idx, 1);
        deleted = true;
      }
    }
    if (!deleted) return res.status(404).json({ error: 'Note not found' });
    return res.status(200).json({ message: 'Note deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Bookmarks CRUD
export const getBookmarks = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    let bookmarks;
    try {
      bookmarks = await prisma.bookmark.findMany({ where: { userId } });
      if (bookmarks.length === 0) {
        bookmarks = InMemoryDb.bookmarks.filter((b) => b.userId === userId);
      }
    } catch {
      bookmarks = InMemoryDb.bookmarks.filter((b) => b.userId === userId);
    }
    return res.status(200).json(bookmarks);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const addBookmark = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { type, referenceId, title } = req.body;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!type || !referenceId || !title) return res.status(400).json({ error: 'Missing parameters' });

  try {
    let bookmark;
    try {
      bookmark = await prisma.bookmark.create({
        data: { userId, type, referenceId, title }
      });
    } catch {
      // Check duplicate
      const duplicate = InMemoryDb.bookmarks.find((b) => b.userId === userId && b.referenceId === referenceId && b.type === type);
      if (duplicate) return res.status(200).json(duplicate);

      bookmark = {
        id: uuidv4(),
        userId,
        type,
        referenceId,
        title,
        createdAt: new Date()
      };
      InMemoryDb.bookmarks.push(bookmark);
    }
    return res.status(201).json(bookmark);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const removeBookmark = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    let deleted = false;
    try {
      await prisma.bookmark.delete({ where: { id } });
      deleted = true;
    } catch {
      const idx = InMemoryDb.bookmarks.findIndex((b) => b.id === id);
      if (idx !== -1) {
        InMemoryDb.bookmarks.splice(idx, 1);
        deleted = true;
      }
    }
    if (!deleted) return res.status(404).json({ error: 'Bookmark not found' });
    return res.status(200).json({ message: 'Bookmark removed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
