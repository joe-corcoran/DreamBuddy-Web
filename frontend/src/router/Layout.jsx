// frontend/src/router/Layout.jsx
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ModalProvider, Modal } from "../context/Modal";
import { thunkAuthenticate } from "../redux/session";
import Navigation from "../components/Navigation/Navigation";
import BottomNavigation from "../components/Navigation/BottomNavigation";
import "./Layout.css";

export default function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(thunkAuthenticate()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <ModalProvider>
      {isLoaded && (
        <div className="app-layout">
          <Navigation />
          <main className="main-content">
            <Outlet />
          </main>
          <BottomNavigation />
        </div>
      )}
      <Modal />
    </ModalProvider>
  );
}