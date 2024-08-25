import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { app } from "./firebase/init.ts";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const db = getFirestore(app);

connectFirestoreEmulator(db, "localhost", 8080);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App db={db} />
  </StrictMode>
);
