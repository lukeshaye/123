import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/react-app/index.css";
import App from "@/react-app/App.tsx";

// --- ADICIONE ESTAS 3 LINHAS AQUI ---
import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-br');
// ------------------------------------


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
