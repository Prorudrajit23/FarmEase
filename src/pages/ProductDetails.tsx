import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, ChevronDown, ChevronUp, Video, ShoppingCart, Plus, Minus, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/hooks/useUserType";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format, differenceInDays, addDays } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  category_id: string;
  stock: number;
  created_at: string;
  seller_id?: string;
  video_url?: string | null;
}

interface SellerInfo {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

// Helper function to parse specifications from description for rental equipment
const parseSpecifications = (description: string): Record<string, string> => {
  const specs: Record<string, string> = {};
  
  // Try to find specifications in the format "Key: Value" in the description
  const specRegex = /([A-Za-z\s]+):\s*([^,\n]+)(?:,|\n|$)/g;
  let match;
  
  while ((match = specRegex.exec(description)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (key && value) {
      specs[key] = value;
    }
  }
  
  return specs;
}

// Helper function to get the general description without the specifications
const getGeneralDescription = (description: string): string => {
  // Find the first occurrence of a specification pattern
  const specIndex = description.search(/([A-Za-z\s]+):\s*([^,\n]+)(?:,|\n|$)/);
  
  if (specIndex === -1) {
    return description; // No specifications found, return the entire description
  }
  
  return description.substring(0, specIndex).trim();
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { userType } = useUserType();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>("");
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  
  const getCategoryDisplayName = (dbCategoryName: string): string => {
    switch(dbCategoryName) {
      case "Rental Equipment": return "Rental Equipment";
      case "Organic Produce": return "Organic Produce";
      case "Fruits and Vegetables": return "Fruits and Vegetables";
      default: return dbCategoryName;
    }
  };

  const isRentalProduct = categoryName === "Rental Equipment";
  const isCartProduct = categoryName === "Organic Produce" || categoryName === "Fruits and Vegetables";
  const isSeller = userType === "seller";
  const isProductOwner = user && product?.seller_id === user.id;

  // Calculate total price based on selected dates
  useEffect(() => {
    if (isRentalProduct && fromDate && toDate && product) {
      const days = differenceInDays(toDate, fromDate) + 1; // Include both start and end dates
      const dailyRate = parseFloat(product.price.replace(/[^0-9.]/g, ""));
      if (!isNaN(dailyRate) && days > 0) {
        setTotalPrice(dailyRate * days);
      }
    }
  }, [fromDate, toDate, product, isRentalProduct]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch the product by ID
        const { data, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (productError) {
          console.error('Error fetching product:', productError);
          return;
        }
        
        if (data) {
          // Cast the data to any to bypass TypeScript type checking temporarily
          const productData = data as any;
          
          // Set the product with required fields
          setProduct({
            id: productData.id,
            name: productData.name,
            price: productData.price,
            description: productData.description,
            image: productData.image,
            category_id: productData.category_id,
            stock: productData.stock || 0,
            created_at: productData.created_at,
            seller_id: productData.seller_id,
            video_url: productData.video_url
          });
          
          // Fetch the category name
          const { data: categoryData } = await supabase
            .from('categories')
            .select('name')
            .eq('id', productData.category_id)
            .single();
          
          if (categoryData) {
            setCategoryName(categoryData.name);
          }
          
          // Fetch seller information if seller_id exists
          if (productData.seller_id) {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name')
              .eq('id', productData.seller_id)
              .single();
            
            if (userError) {
              console.error('Error fetching seller info:', userError);
            } else if (userData) {
              // Get the seller's email from auth.users
              const { data: authData } = await supabase.auth.admin.getUserById(
                productData.seller_id
              );
              
              setSellerInfo({
                ...userData,
                email: authData?.user?.email || null
              });
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleContactSeller = () => {
    if (sellerInfo?.email) {
      window.location.href = `mailto:${sellerInfo.email}?subject=Inquiry about ${product?.name}`;
    }
  };

  const handleAddToCart = () => {
    if (!product || (isRentalProduct && (!fromDate || !toDate))) {
      toast({
        title: "Please select dates",
        description: "You must select both start and end dates for rental equipment.",
        variant: "destructive",
      });
      return;
    }
    
    if (isRentalProduct) {
      // Create a basic cart item
      const cartItem = {
        id: product.id,
        name: product.name,
        price: totalPrice?.toString() || product.price,
        image: product.image,
        quantity: 1,
        category: getCategoryDisplayName(categoryName)
      };
      
      // Use the any type to bypass TypeScript checking for rental dates
      // This allows us to add rentalDates without modifying the CartItem interface
      (cartItem as any).rentalDates = {
        from: fromDate.toISOString(),
        to: toDate.toISOString()
      };
      
      // Add to cart
      addToCart(cartItem);
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart for rental from ${format(fromDate, 'PP')} to ${format(toDate, 'PP')}.`,
      });
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        category: getCategoryDisplayName(categoryName),
      });
      
      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} has been added to your cart.`,
      });
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600 py-8">
            <p className="text-xl">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600 py-8">
            <p className="text-xl">Product not found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleGoBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Parse specifications if this is a rental product
  const specifications = isRentalProduct ? parseSpecifications(product.description) : {};
  const generalDescription = isRentalProduct ? getGeneralDescription(product.description) : product.description;
  const hasSpecifications = Object.keys(specifications).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button 
          variant="outline" 
          className="mb-8"
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {getCategoryDisplayName(categoryName)}
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-white h-fit">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full max-h-[400px] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Available";
              }}
            />
          </div>
          
          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold text-green-800 mb-4">{product.name}</h1>
            <div className="text-2xl font-bold text-green-700 mb-6">
              {isRentalProduct ? (
                <>₹{product.price}</>
              ) : (
                <>₹{product.price}</>
              )}
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{generalDescription}</p>
            </div>
            
            {/* Specifications for rental equipment */}
            {isRentalProduct && hasSpecifications && (
              <div className="mb-6">
                <Accordion type="single" collapsible className="border rounded-md">
                  <AccordionItem value="specifications">
                    <AccordionTrigger className="text-xl font-semibold text-green-800 px-4">
                      Technical Specifications
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(specifications).map(([key, value], index) => (
                          <div key={index} className="grid grid-cols-2 py-2 border-b border-gray-100 last:border-0">
                            <div className="font-medium text-gray-700">{key}</div>
                            <div className="text-gray-600">{value}</div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Details</h2>
              <ul className="text-gray-700 space-y-2">
                <li><span className="font-medium">Category:</span> {getCategoryDisplayName(categoryName)}</li>
                <li><span className="font-medium">Availability:</span> {product.stock > 0 ? 'In Stock' : 'Out of Stock'}</li>
                {product.stock > 0 && <li><span className="font-medium">Quantity Available:</span> {product.stock}</li>}
                {sellerInfo && (
                  <li>
                    <span className="font-medium">Seller:</span> {sellerInfo.first_name} {sellerInfo.last_name}
                  </li>
                )}
              </ul>
            </div>
            
            {/* Date Selection for Rental Equipment */}
            {!isSeller && product.stock > 0 && isRentalProduct && (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={fromDate}
                          onSelect={setFromDate}
                          disabled={(date) => date < new Date() || (toDate ? date > toDate : false)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={toDate}
                          onSelect={setToDate}
                          disabled={(date) => !fromDate || date < fromDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {totalPrice !== null && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Total for {differenceInDays(toDate!, fromDate!) + 1} days:</span>
                      <span className="text-xl font-bold text-green-700">₹{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                {user ? (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                    onClick={handleAddToCart}
                    disabled={!fromDate || !toDate}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gray-400 text-white py-3 text-lg cursor-not-allowed"
                      disabled
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                    <p className="text-center text-sm text-amber-600">
                      Please <Button variant="link" className="p-0 h-auto text-sm font-semibold text-amber-600" onClick={() => navigate('/login')}>login</Button> to rent equipment
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Show Add to Cart button for Organic and Produce categories */}
            {!isSeller && product.stock > 0 && isCartProduct && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-md">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-none"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1 || !user}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-none"
                      onClick={incrementQuantity}
                      disabled={(product && quantity >= product.stock) || !user}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {user ? (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gray-400 text-white py-3 text-lg cursor-not-allowed"
                      disabled
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                    <p className="text-center text-sm text-amber-600">
                      Please <Button variant="link" className="p-0 h-auto text-sm font-semibold text-amber-600" onClick={() => navigate('/login')}>login</Button> to add items to your cart
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {isProductOwner && (
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                onClick={() => navigate(`/edit-product/${product.id}`)}
              >
                Edit Product
              </Button>
            )}
          </div>
        </div>
        
        {/* Video Section - Only show for Equipment and Organic categories */}
        {product.video_url && (isRentalProduct || categoryName === "Organic Produce") && (
          <div className="mt-12 rounded-lg overflow-hidden shadow-lg bg-white">
            <h3 className="text-xl font-semibold text-green-800 p-4 border-b flex items-center">
              <Video className="mr-2 h-5 w-5" />
              Product Video
            </h3>
            <div className="w-full bg-black p-0">
              <div className="relative w-full h-0 pb-[56.25%]">
                <iframe 
                  id="player" 
                  src={product.video_url}
                  style={{ border: 0 }}
                  className="absolute top-0 left-0 w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails; 
