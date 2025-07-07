
import React, { useState } from 'react';
import { Search, Bell, Menu, LogOut, LogIn } from 'lucide-react';
import RegisterMemberForm from './RegisterMemberForm';
import MemberCheckInDialog from './MemberCheckInDialog';
import PaymentRecordDialog from './PaymentRecordDialog';
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { user, loading } = useAuthState();
  const navigate = useNavigate();

  const handleMenuClick = () => setMenuOpen(!menuOpen);

  const handleRegisterClick = () => {
    setDrawerOpen(true);
    setMenuOpen(false);
  };

  const handleCheckInClick = () => {
    setCheckInOpen(true);
    setMenuOpen(false);
  };

  const handlePaymentClick = () => {
    setPaymentOpen(true);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const goToLogin = () => {
    navigate("/auth");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 relative">
      <div className="flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Gym CRM Dashboard</h1>
        </div>
        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        {/* Actions/Notifications + Hamburger */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          {/* Show Login/Logout */}
          {!loading && (
            user ? (
              <Button
                size="icon"
                variant="ghost"
                aria-label="Logout"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                aria-label="Login"
                onClick={goToLogin}
                className="text-gray-500 hover:text-blue-600"
                title="Login"
              >
                <LogIn className="h-5 w-5" />
              </Button>
            )
          )}
          {/* Hamburger menu */}
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleMenuClick}
              aria-label="Open menu"
              className="text-gray-500 hover:text-blue-600"
            >
              <Menu className="h-6 w-6" />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow z-50">
                <button
                  onClick={handleRegisterClick}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Register a new member
                </button>
                <button
                  onClick={handleCheckInClick}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 border-t"
                >
                  Member check in
                </button>
                <button
                  onClick={handlePaymentClick}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 border-t"
                >
                  Record payment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Register Drawer */}
      <RegisterMemberForm open={drawerOpen} onOpenChange={setDrawerOpen} />
      {/* Member Check-In Dialog */}
      <MemberCheckInDialog open={checkInOpen} onOpenChange={setCheckInOpen} />
      {/* Payment Record Dialog */}
      <PaymentRecordDialog open={paymentOpen} onOpenChange={setPaymentOpen} />
    </header>
  );
};

export default Header;
