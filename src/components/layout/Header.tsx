import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Leaf, Tractor, Carrot, User, LogOut, Package, Plus, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/hooks/useUserType";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import SearchDropdown from "@/components/search/SearchDropdown";
import { useState, useEffect } from "react";

const Header = () => {
  const { user, signOut } = useAuth();
  const { userType, isLoading: isLoadingUserType } = useUserType();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isSeller = userType === "seller";
  const totalItems = getTotalItems();

  // Check if current page is login or signup
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  // Add scroll event listener to detect scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-md' 
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Leaf className={`h-6 w-6 ${isScrolled ? 'text-green-700' : 'text-green-600'} transition-colors`} />
            <h1 className={`text-2xl font-bold ${isScrolled ? 'text-green-900' : 'text-green-800'} transition-colors`}>FarmEase</h1>
          </Link>
          
          {/* Only show navigation links if not on auth pages */}
          {!isAuthPage && (
            <nav className="hidden md:flex items-center space-x-8">
              {isSeller ? (
                <>
                  <Link to="/my-products" className={`flex items-center ${isScrolled ? 'text-green-800' : 'text-green-700'} hover:text-green-900 transition-colors`}>
                    <Package className="h-4 w-4 mr-2" />
                    My Products
                  </Link>
                  <Link to="/add-product" className={`flex items-center ${isScrolled ? 'text-green-800' : 'text-green-700'} hover:text-green-900 transition-colors`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Link>
                  <Link to="/feedback" className={`flex items-center ${isScrolled ? 'text-green-800' : 'text-green-700'} hover:text-green-900 transition-colors`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Customer Feedback
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/rental" className={`flex items-center ${isScrolled ? 'text-green-800' : 'text-green-700'} hover:text-green-900 transition-colors`}>
                    <Tractor className="h-4 w-4 mr-2" />
                    Rental Equipment
                  </Link>
                  <Link to="/organic" className={`flex items-center ${isScrolled ? 'text-green-800' : 'text-green-700'} hover:text-green-900 transition-colors`}>
                    <Leaf className="h-4 w-4 mr-2" />
                    Organic Products
                  </Link>
                  <Link to="/produce" className={`flex items-center ${isScrolled ? 'text-green-800' : 'text-green-700'} hover:text-green-900 transition-colors`}>
                    <Carrot className="h-4 w-4 mr-2" />
                    Fruits & Vegetables
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Search Dropdown - Only show if not on auth pages */}
          {!isAuthPage && (
            <div className="hidden md:block w-64">
              <SearchDropdown />
            </div>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  className={`flex items-center gap-2 transition-colors ${isScrolled ? 'hover:bg-green-100/50' : 'hover:bg-green-50'}`} 
                  onClick={() => signOut()}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                {!isAuthPage && (
                  <Link to="/login">
                    <Button 
                      variant="ghost" 
                      className={`flex items-center gap-2 transition-colors ${isScrolled ? 'hover:bg-green-100/50' : 'hover:bg-green-50'}`}
                    >
                      <User className="h-5 w-5" />
                      <span className="hidden sm:inline">Login</span>
                    </Button>
                  </Link>
                )}
              </>
            )}
            
            {/* Only show cart for logged-in buyers and not on auth pages */}
            {!isSeller && user && !isAuthPage && (
              <Link to="/cart">
                <Button 
                  variant="outline" 
                  className={`flex items-center gap-2 relative transition-all ${
                    isScrolled 
                      ? 'bg-green-50/80 border-green-300 hover:bg-green-100/80' 
                      : 'hover:bg-green-50'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-green-600 text-white" variant="secondary">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search - Only visible on small screens and not on auth pages */}
        {!isAuthPage && (
          <div className="md:hidden mt-4">
            <SearchDropdown />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
