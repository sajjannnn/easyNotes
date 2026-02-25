import { createSlice} from "@reduxjs/toolkit";
import type { Note } from "../../../utilis/db";

interface NotesState {
  notes: Note[];
}

const initialState: NotesState = {
  notes: [],
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
    addNote: (state, action) => {
      state.notes.push(action.payload);
    },
    deleteNote: (state, action) => {
      state.notes = state.notes.filter(
        (note) => note.id !== action.payload
      );
    },
    clearNotes: (state) => {
      state.notes = [];
    },
  },
});

export const { setNotes, addNote, deleteNote, clearNotes } =
  notesSlice.actions;

export default notesSlice.reducer;