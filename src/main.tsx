import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from 'redux-persist/integration/react'

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import { store, persistor } from './store'
import { Provider as ReduxProvider } from 'react-redux'
import "@/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </ReduxProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
