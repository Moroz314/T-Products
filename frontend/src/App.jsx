import { Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import Profile from './components/Profile';
import Basket from './components/Basket';
import Map from './components/Map';
import ProductCard from './components/ProductCard';
import Catalog from './components/Catalog';
import About from './components/About';
import Login from './components/auth/Login';
import Register from './components/auth/register';

function App() {

    return (
        <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/basket" element={<Basket />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registr" element={<Register />} />
            <Route path="/map" element={<Map />} />
            <Route path="/product" element={<ProductCard />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/about" element={<About />} />
        </Routes>
    );
}

export default App;
