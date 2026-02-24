import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getNotesByFileId } from "../../../utilis/db";

type NoteType = {
  id: string;
  image?: string;
  text?: string;
  timestamp?: number | null;
  createdAt: number;
};

const Notes = () => {
  const openNotes = useSelector(
    (store: any) => store.noteSlice.openNote
  );

  const [notes, setNotes] = useState<NoteType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!openNotes) {
      setNotes([]);
      return;
    }

    async function fetchNotes() {
      setLoading(true);

      const fetchedNotes = await getNotesByFileId(openNotes);

      setNotes(fetchedNotes);
      setLoading(false);
    }

    fetchNotes();
  }, [openNotes]);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      
      {loading && <p>Loading...</p>}

      {!loading && notes.length === 0 && (
        <p className="text-gray-500">No notes yet.</p>
      )}

      {notes.map((note) => (
        <div key={note.id} className="mb-8 border-b pb-6">

          {note.image && (
            <img
              src={note.image}
              className="max-w-md rounded shadow-md mb-3"
            />
          )}

          {note.timestamp !== null &&
            note.timestamp !== undefined && (
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