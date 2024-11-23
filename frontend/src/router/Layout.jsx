// frontend/src/router/Layout.jsx
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ModalProvider, Modal } from "../context/Modal";
import { thunkAuthenticate } from "../redux/session";
import Navigation from "../components/Navigation/Navigation";
import BottomNavigation from "../components/Navigation/BottomNavigation";
import "./Layout.css";

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const user = useSelector(state => state.session.user);

  useEffect(() => {
    dispatch(thunkAuthenticate()).then(() => setIsLoaded(true));
  }, [dispatch]);

  useEffect(() => {
    if (isLoaded && !user && window.location.pathname !== '/') {
      navigate('/');
    }
  }, [user, isLoaded, navigate]);

  return (
    <ModalProvider>
      {isLoaded && (
        <div className="app-layout">
          <Navigation />
          <main className="main-content">
            <Outlet />
          </main>
          {user && <BottomNavigation />}
        </div>
      )}
      <Modal />
    </ModalProvider>
  );
}