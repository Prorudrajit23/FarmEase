import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  category_id: string;
  category_name?: string;
}

interface SearchDropdownProps {
  onNavigate?: () => void;
}

const SearchDropdown = ({ onNavigate }: SearchDropdownProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search products when query changes
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch products that match the search query
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .limit(5);

        if (error) {
          console.error('Error searching products:', error);
          return;
        }

        if (data) {
          // Format the data to match our Product interface
          const formattedData = data.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description,
            image: item.image,
            category_id: item.category_id,
            category_name: item.categories?.name || 'Unknown'
          }));
          
          setSearchResults(formattedData);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProducts();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setShowDropdown(false);
    setSearchQuery("");
    if (onNavigate) onNavigate();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
      if (onNavigate) onNavigate();
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isScrolled ? 'text-green-700' : 'text-green-600'} h-4 w-4 transition-colors`} />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            className={`pl-9 py-2 text-sm rounded-full transition-all duration-300 ${
              isScrolled 
                ? 'bg-white/90 border-green-300 focus:border-green-500 focus:ring-green-300 shadow-sm' 
                : 'bg-gray-50 border-green-200 focus:border-green-400'
            }`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowDropdown(true);
              }
            }}
          />
          {searchQuery && (
            <button 
              type="button"
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isScrolled ? 'text-green-700' : 'text-green-600'} hover:text-green-900 transition-colors`}
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowDropdown(false);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className={`absolute z-50 mt-1 w-full rounded-md shadow-lg max-h-80 overflow-y-auto transition-all ${
            isScrolled 
              ? 'bg-white/95 backdrop-blur-sm border border-green-100' 
              : 'bg-white border border-gray-100'
          }`}
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent mr-2"></div>
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <ul className="py-2">
              {searchResults.map((product) => (
                <li 
                  key={product.id}
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    isScrolled 
                      ? 'hover:bg-green-50/80' 
                      : 'hover:bg-green-50'
                  }`}
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0 mr-3 overflow-hidden rounded">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {product.category_name} • ₹{product.price}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              <li className="px-4 py-3 text-center border-t border-green-100">
                <button 
                  className={`text-sm font-medium transition-colors ${
                    isScrolled 
                      ? 'text-green-700 hover:text-green-900' 
                      : 'text-green-600 hover:text-green-800'
                  }`}
                  onClick={handleSearchSubmit}
                >
                  See all results for "{searchQuery}"
                </button>
              </li>
            </ul>
          ) : searchQuery.trim() ? (
            <div className="p-6 text-center">
              <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium mb-1">No products found</p>
              <p className="text-gray-500 text-sm">Try a different search term</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown; 