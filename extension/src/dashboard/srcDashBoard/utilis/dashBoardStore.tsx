import { configureStore } from '@reduxjs/toolkit'
import noteSliceReducer from "./notesSlice";
import fileSliceReducer from "./fileSlice"
const store = configureStore({
  reducer: {
    notes : noteSliceReducer,
    file : fileSliceReducer,
  }
})


export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;