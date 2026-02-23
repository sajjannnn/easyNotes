import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import DashboardApp from "./DashboardApp";
import { Provider } from "react-redux";
import store from "./srcDashBoard/utilis/dashBoardStore";

// Enable Tailwind dark mode for dashboard as well
document.documentElement.classList.add("dark");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <DashboardApp />
    </Provider>
  </React.StrictMode>,
);
