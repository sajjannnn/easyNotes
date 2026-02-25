import { createSlice } from "@reduxjs/toolkit";

interface FileState {
  activeFileId: string | null;
}

const initialState: FileState = {
  activeFileId: null,
};

const fileSlice = createSlice({
  name: "file",
  initialState,
  reducers: {
    setActiveFileId: (state, action) => {
      state.activeFileId = action.payload;
    },
  },
});

export const { setActiveFileId } = fileSlice.actions;
export default fileSlice.reducer;