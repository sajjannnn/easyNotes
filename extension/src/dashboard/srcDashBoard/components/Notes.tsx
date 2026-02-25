import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../srcDashBoard/utilis/dashBoardStore";
import { getNotesByFileId } from "../../../utilis/db";
import type { Note } from "../../../utilis/db";

const Notes = () => {
  const activeFileId = useSelector(
    (state: RootState) => state.file.activeFileId
  );

  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (!activeFileId) {
      setNotes([]);
      return;
    }

    const loadNotes = async () => {
      const fileNotes = await getNotesByFileId(activeFileId);
      setNotes(fileNotes);
    };

    loadNotes();
  }, [activeFileId]);
console.log("Active File ID:", activeFileId);useEffect(() => {
  const load = async () => {
    if (!activeFileId) return;

    console.log("Active File ID:", activeFileId);

    const fetched = await getNotesByFileId(activeFileId);
    console.log("Fetched Notes:", fetched);

    setNotes(fetched);
  };

  load();
}, [activeFileId]);
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {!activeFileId && (
        <p className="text-gray-400">Select a file to view notes.</p>
      )}

      {activeFileId && notes.length === 0 && (
        <p className="text-gray-400">No notes yet.</p>
      )}

      {notes.map((note) => (
        <div key={note.id} className="mb-8 border-b pb-6">
          {note.image && (
            <img
              src={note.image}
              className="max-w-md rounded shadow-md mb-3"
            />
          )}

          {note.timestamp !== null && (
            <p className="text-sm text-gray-500 mb-2">
              ⏱ {note.timestamp.toFixed(2)} sec
            </p>
          )}

          {note.text && (
            <p className="text-gray-800 whitespace-pre-wrap">
              {note.text}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Notes;