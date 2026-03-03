import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../srcDashBoard/utilis/dashBoardStore";
import {
  getNotesByFileId,
  deleteNote,
  updateNote,
} from "../../../utilis/db";
import type { Note } from "../../../utilis/db";

const Notes = () => {
  const activeFileId = useSelector(
    (state: RootState) => state.file.activeFileId
  );

  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");

  // =========================
  // LOAD NOTES
  // =========================
  const loadNotes = async () => {
    if (!activeFileId) {
      setNotes([]);
      return;
    }

    const fileNotes = await getNotesByFileId(activeFileId);
    setNotes(fileNotes);
  };

  useEffect(() => {
    loadNotes();
  }, [activeFileId]);

  // =========================
  // DELETE NOTE
  // =========================
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;

    await deleteNote(id);
    await loadNotes();
  };

  // =========================
  // START EDIT
  // =========================
  const handleEditStart = (note: Note) => {
    setEditingId(note.id);
    setEditedText(note.text || "");
  };

  // =========================
  // SAVE EDIT
  // =========================
  const handleSave = async (note: Note) => {
    const updatedNote: Note = {
      ...note,
      text: editedText,
    };

    await updateNote(updatedNote);

    setEditingId(null);
    setEditedText("");
    await loadNotes();
  };

  // =========================
  // OPEN YOUTUBE AT TIME
  // =========================
  const openAtTime = (note: Note) => {
    if (!note.videoId) return;

    const seconds = Math.floor(note.timestamp ?? 0);

    const youtubeUrl = `https://www.youtube.com/watch?v=${note.videoId}&t=${seconds}s`;

    chrome.tabs.create({ url: youtubeUrl });
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {!activeFileId && (
        <p className="text-gray-400">Select a file to view notes.</p>
      )}

      {activeFileId && notes.length === 0 && (
        <p className="text-gray-400">No notes yet.</p>
      )}

      {notes.map((note) => (
        <div
          key={note.id}
          className="border rounded-lg p-4 shadow-sm relative group"
        >
          {/* DELETE BUTTON */}
          <button
            onClick={() => handleDelete(note.id)}
            className="absolute top-2 right-2 text-red-500 text-xs opacity-0 group-hover:opacity-100"
          >
            Delete
          </button>

          {/* IMAGE */}
          {note.image && (
            <img
              src={note.image}
              className="max-w-md rounded mb-3 cursor-pointer"
              onClick={() => openAtTime(note)}
            />
          )}

          {/* TIMESTAMP */}
          {note.timestamp !== null && (
            <p className="text-sm text-gray-500 mb-2">
              ⏱ {note.timestamp?.toFixed(2)} sec
            </p>
          )}

          {/* TEXT SECTION */}
          {editingId === note.id ? (
            <div className="space-y-2">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full border rounded p-2 text-sm"
                rows={4}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(note)}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded"
                >
                  Save
                </button>

                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 bg-gray-300 text-xs rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            note.text && (
              <p
                className="text-gray-800 whitespace-pre-wrap cursor-pointer"
                onDoubleClick={() => handleEditStart(note)}
              >
                {note.text}
              </p>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default Notes;