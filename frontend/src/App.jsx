import { useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import AdminApp from "./admin/AdminApp";
import Layout from "./components/Layout";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";
import PromotionPage from "./pages/PromotionPage";
import RatingsReviewsPage from "./pages/RatingsReviewsPage";

export default function App() {
  const [modalState, setModalState] = useState({ open: false, mode: "rfq", product: "" });

  const handleOpenModal = (mode, product = "") => {
    setModalState({ open: true, mode, product });
  };

  const handleCloseModal = () => {
    setModalState({ open: false, mode: "rfq", product: "" });
  };

  return (
    <HashRouter>
      <Routes>
        {/* Dedicated Secure Admin Panel Route */}
        <Route path="/myadmin/*" element={<AdminApp />} />
        <Route path="/myadmin" element={<AdminApp />} />

        {/* Public Storefront Routes wrapped in Public Layout */}
        <Route
          path="/*"
          element={
            <Layout
              onOpenModal={handleOpenModal}
              modalState={modalState}
              onCloseModal={handleCloseModal}
            >
              <Routes>
                <Route path="/" element={<HomePage onOpenModal={handleOpenModal} />} />
                <Route path="/products" element={<ProductsPage onOpenModal={handleOpenModal} />} />
                <Route path="/product/:sku" element={<ProductDetailPage onOpenModal={handleOpenModal} />} />
                <Route path="/company-profile" element={<CompanyProfilePage />} />
                <Route path="/company-profile/feedback" element={<RatingsReviewsPage onOpenModal={handleOpenModal} />} />
                <Route path="/promotion" element={<PromotionPage onOpenModal={handleOpenModal} />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </HashRouter>
  );
}
