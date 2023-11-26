import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CDP_Search from '../pages/CDP_Search';

function AppRouter() {
    return(
        <Router>
      <Routes>
        <Route path="/" element={<CDP_Search />} />
      </Routes>
    </Router>
    )
}

export default AppRouter;