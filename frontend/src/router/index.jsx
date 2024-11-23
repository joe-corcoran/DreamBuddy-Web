import { createBrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import HomePage from '../components/HomePage/HomePage';
import DreamJournal from '../components/Dreams/DreamJournal/DreamJournal';
import DreamCalendar from '../components/Calendar/DreamCalendar';
import ProtectedRoute from '../components/ProtectedRoute';
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
        element: (
          <ProtectedRoute>
            <DreamJournal />
          </ProtectedRoute>
        ),
      },
      {
        path: "/calendar",
        element: (
          <ProtectedRoute>
            <DreamCalendar />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);