import {
  Outlet,
  Route,
  HashRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Popup from "./components/Popup";
import News from "./pages/News";
import AddNews from "./pages/AddNews";
import NewsDetail from "./pages/NewsDetail";
import { ToastContainer } from "react-toastify";

const App = () => {
  const LayoutsWithNavbar = () => {
    return (
      <>
        <Navbar />
        <Outlet />
        <Popup />
        <ToastContainer />
      </>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LayoutsWithNavbar />}>
          <Route exact path="/" element={<Navigate to="/news" />} />
          <Route path="news">
            <Route path="" element={<News />} />
            <Route path=":id" element={<NewsDetail />} />
            <Route path="create" element={<AddNews />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
