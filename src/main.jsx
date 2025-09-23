import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Memories from "./pages/Memories.jsx";
import SpecialDays from "./pages/SpecialDays.jsx";
import Trips from "./pages/Trips.jsx";
import Todos from "./pages/Todos.jsx";
import Games from "./pages/Games.jsx";
import { AuthProvider } from "./services/auth.jsx";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "memories", element: <Memories /> },
      { path: "special-days", element: <SpecialDays /> },
      { path: "trips", element: <Trips /> },
      { path: "todos", element: <Todos /> },
      { path: "games", element: <Games /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);