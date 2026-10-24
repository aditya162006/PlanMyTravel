import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { DestinationDetailPage } from './pages/DestinationDetailPage';
import { StaysPage } from './pages/StaysPage';
import { ConciergePlannerPage } from './pages/ConciergePlannerPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { WalletPage } from './pages/WalletPage';
import { BookingsPage } from './pages/BookingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { GuideRegistrationPage } from './pages/GuideRegistrationPage';
import { ExpenseTrackerPage } from './pages/ExpenseTrackerPage';
import { VehicleRentalsPage } from './pages/VehicleRentalsPage';
import { PlanlyChatbot } from './components/PlanlyChatbot';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141413]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/destinations/:slug" element={<DestinationDetailPage />} />
              <Route path="/stays" element={<StaysPage />} />
              <Route path="/rentals" element={<VehicleRentalsPage />} />
              <Route path="/concierge" element={<ConciergePlannerPage />} />
              <Route path="/trips" element={<MyTripsPage />} />
              <Route path="/expenses" element={<ExpenseTrackerPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/become-a-guide" element={<GuideRegistrationPage />} />
            </Routes>
          </main>
          <Footer />
          <AuthModal />
          <PlanlyChatbot />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

