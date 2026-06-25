import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./routes/index";
import LoginPage from "./routes/login";
import AppLayout from "./routes/_app";
import Dashboard from "./routes/_app.dashboard";
import MapPage from "./routes/_app.map";
import Subscribers from "./routes/_app.subscribers";
import AuditPage from "./routes/_app.audit";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "map",
        element: <MapPage />,
      },
      {
        path: "subscribers",
        element: <Subscribers />,
      },
      {
        path: "audit",
        element: <AuditPage />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
