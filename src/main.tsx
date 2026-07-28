import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import OAuthConsent from "./pages/OAuthConsent.tsx";

// The OAuth consent screen is served at a real path (the app itself uses a
// HashRouter), so it is mounted outside the router.
const isConsent = window.location.pathname.startsWith("/.lovable/oauth/consent");

createRoot(document.getElementById("root")!).render(
  isConsent ? <OAuthConsent /> : <App />,
);
