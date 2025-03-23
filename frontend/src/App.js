import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Header from './components/UIC/Header';
import Home from './components/pages/Home';
import AddExperience from './components/pages/AddExperience';
import ExperienceDetails from './components/pages/ExperienceDetails';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/addexperience',
    element: <AddExperience />
  },
  {
    path: '/experiencedetails/:id',
    element: <ExperienceDetails />
  }
]);

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
