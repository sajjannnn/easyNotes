import { createSlice } from "@reduxjs/toolkit";

interface AIState {
  isOpen: boolean;
}

const initialState: AIState = {
  isOpen: false,
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    toggleAI(state) {
      state.isOpen = !state.isOpen;
    },
   
  },
});

export const { toggleAI } = aiSlice.actions;
export default aiSlice.reducer;