import { createSlice } from "@reduxjs/toolkit";

const notesSlice = createSlice({
    name: 'noteSlice',
    initialState : {
        openNote : "",
    },
    reducers : {
        nowOpenNoteId : (state, action)=> {
            state.openNote = action.payload;
        }
    }
})

export const {nowOpenNoteId} = notesSlice.actions;
export default notesSlice.reducer;