// frontend/src/router/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import HomePage from '../components/HomePage/HomePage';
import DreamJournal from '../components/Dreams/DreamJournal/DreamJournal';
import DreamCalendar from '../components/Calendar/DreamCalendar';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/journal",
        element: <DreamJournal />,
      },
      {
        path: "/calendar",
        element: <DreamCalendar/>,
      },
    ],
  },
]);