import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LocaleProvider } from './i18n';
import { SiteLayout } from './components/SiteLayout';
import { AboutPage, ContactsPage, FaqPage, HomePage, OwnerPage, PrivacyPage, RentalSuccessPage, VehicleCatalogPage, VehicleDetailsPage } from './pages/PublicPages';
import { AdminPage } from './pages/AdminPage';

export function App() {
  const Router = import.meta.env.BASE_URL === '/' ? BrowserRouter : HashRouter;
  return <LocaleProvider><Router><Routes>
    <Route path="/" element={<SiteLayout />}>
      <Route index element={<HomePage/>}/>
      <Route path="drivers" element={<Navigate to="/owners" replace/>}/>
      <Route path="owners" element={<OwnerPage/>}/>
      <Route path="vehicles" element={<VehicleCatalogPage/>}/>
      <Route path="vehicles/:id" element={<VehicleDetailsPage/>}/>
      <Route path="about" element={<AboutPage/>}/>
      <Route path="faq" element={<FaqPage/>}/>
      <Route path="contacts" element={<ContactsPage/>}/>
      <Route path="privacy" element={<PrivacyPage/>}/>
      <Route path="success" element={<RentalSuccessPage/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Route>
    <Route path="/admin" element={<AdminPage/>}/>
  </Routes></Router></LocaleProvider>;
}
