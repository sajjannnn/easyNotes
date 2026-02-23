import { configureStore } from '@reduxjs/toolkit'
import noteSliceReducer from "./notesSlice";
const store = configureStore({
  reducer: {
    notesSlice : noteSliceReducer,
  }
})


export default store;