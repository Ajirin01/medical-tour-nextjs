import { configureStore } from "@reduxjs/toolkit";
import specialistReducer from "./specialistSlice";

export const store = configureStore({
  reducer: {
    specialist: specialistReducer,
  },
});
