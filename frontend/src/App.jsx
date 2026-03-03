import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import HomePage from "./pages/HomePage";
import {ProtectedRoute} from "./routes/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import InventoriesPage from "./pages/InventoriesPage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import CreateItemPage from "./pages/CreateItemPage.jsx";
import CreateInventoryPage from "./pages/CreateInventoryPage.jsx";
import {LoginPage} from "./pages/LoginPage";
import { AdminRoute } from "./routes/AdminRoute.jsx";
import {AdminDashboard} from "./pages/AdminDashboard.jsx";
import ItemDetailsPage from "./pages/ItemDetailsPage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path="/" element={<Dashboard />}/>
                    <Route path="/inventories" element={<InventoriesPage />} />
                    <Route path="/inventories/:id" element={<InventoryPage />} />
                    <Route path="/inventories/create" element={<CreateInventoryPage />}/>
                    <Route path="/inventories/:id/items/create" element={<CreateItemPage />}/>
                    <Route path="/items/:id" element={<ItemDetailsPage />}/>
                    <Route path="/users/:id" element={<UserProfilePage />}/>
                    <Route path="/search" element={<SearchResultsPage />}/>
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;