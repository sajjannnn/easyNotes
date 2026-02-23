import { getNotesByFileId } from "../../../utilis/db"
import { useDispatch } from "react-redux"

const Notes = () => {
  const dispatch = useDispatch();
  const notes = dispatch(note)
    const notes = getNotesByFileId(openNotes)
  return (
   <div className="flex-1 p-6 overflow-y-auto">
  {notes.length === 0 && (
    <p className="text-gray-500">No notes yet.</p>
  )}

  {notes.map(note => (
    <div key={note.id} className="mb-8 border-b pb-6">

      {/* Screenshot */}
      {note.image && (
        <img
          src={note.image}
          className="max-w-md rounded shadow-md mb-3"
        />
      )}

      {/* Timestamp */}
      {note.timestamp !== null && note.timestamp !== undefined && (
        <p className="text-sm text-gray-500 mb-2">
          ⏱ {note.timestamp.toFixed(2)} sec
        </p>
      )}

      {/* Text */}
      {note.text && (
        <p className="text-gray-800 whitespace-pre-wrap">
          {note.text}
        </p>
      )}

    </div>
  ))}
</div>
  )
  
}

export default Notes