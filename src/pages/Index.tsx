import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Leaf, Tractor, Carrot, ShoppingBag, Truck, Award, ThumbsUp, LogOut, User, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductGrid from "@/components/products/ProductGrid";
import { useUserType } from "@/hooks/useUserType";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  category_id: string;
  category_name?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { userType } = useUserType();
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [equipmentProducts, setEquipmentProducts] = useState<Product[]>([]);
  const [organicProducts, setOrganicProducts] = useState<Product[]>([]);
  const [produceProducts, setProduceProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isSeller = userType === "seller";

  // Check for search parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  useEffect(() => {
    // Redirect sellers to their products page
    if (isSeller) {
      navigate("/my-products");
    }
  }, [isSeller, navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name');
        
        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }
        
        const categoryMap: Record<string, string> = {};
        data?.forEach(category => {
          categoryMap[category.id] = category.name;
        });
        
        setCategories(categoryMap);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch all products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }
        
        if (data) {
          // Add category name to each product
          const productsWithCategory = data.map(product => ({
            ...product,
            category_name: categories[product.category_id] || 'Unknown'
          }));
          
          setAllProducts(productsWithCategory);
          
          // Filter products by category
          setEquipmentProducts(productsWithCategory.filter(p => p.category_name === 'Rental Equipment'));
          setOrganicProducts(productsWithCategory.filter(p => p.category_name === 'Organic Produce'));
          setProduceProducts(productsWithCategory.filter(p => p.category_name === 'Fruits and Vegetables'));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(categories).length > 0) {
    fetchProducts();
    }
  }, [categories]);

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryDisplayName = (dbCategoryName: string): string => {
    switch(dbCategoryName) {
      case "Rental Equipment": return "Rental Equipment";
      case "Organic Produce": return "Organic Produce";
      case "Fruits and Vegetables": return "Fruits and Vegetables";
      default: return dbCategoryName;
    }
  };

  // Add scroll event listener to detect scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Fresh Farm Products Delivered to Your Doorstep
                </h1>
                <p className="text-xl opacity-90">
                  FarmEase connects you directly with local farmers for the freshest organic produce, 
                  fruits, vegetables, and equipment rental for your agricultural needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-yellow-500 text-white hover:bg-yellow-600 border-2 border-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden group"
                    onClick={() => navigate("/rental")}
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="relative flex items-center">
                      <Tractor className="mr-2 h-5 w-5 animate-pulse" />
                      <span className="font-bold">Rent Equipment</span>
                    </span>
                  </Button>
                  <Button 
                    size="lg" 
                    className="bg-white text-green-800 hover:bg-gray-100 transition-all duration-300"
                    onClick={() => navigate("/organic")}
                  >
                    <Leaf className="mr-2 h-5 w-5" />
                    Shop Organic
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1595855759920-86582396756a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="Fresh farm produce" 
                  className="rounded-lg shadow-xl"
          />
        </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose FarmEase?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">100% Organic</h3>
                <p className="text-gray-600">All our products are certified organic, grown without harmful pesticides or chemicals.</p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">We ensure quick delivery to maintain the freshness of all products.</p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Direct from Farmers</h3>
                <p className="text-gray-600">Buy directly from local farmers, supporting sustainable agriculture.</p>
      </div>

              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">We stand behind the quality of every product we offer.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Our Products</h2>
            <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Browse our wide selection of farm-fresh products, organic supplies, and rental equipment
            </p>
            
            {searchQuery ? (
              <>
                <h3 className="text-xl font-semibold mb-6">Search Results for "{searchQuery}"</h3>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                    <p className="text-gray-500">Try adjusting your search terms or browse our categories below.</p>
                  </div>
                )}
              </>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="all">All Products</TabsTrigger>
                  <TabsTrigger value="equipment" className="flex items-center gap-2">
                    <Tractor className="h-4 w-4" />
                    <span>Rental Equipment</span>
                  </TabsTrigger>
                  <TabsTrigger value="organic" className="flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    <span>Organic Products</span>
                  </TabsTrigger>
                  <TabsTrigger value="produce" className="flex items-center gap-2">
                    <Carrot className="h-4 w-4" />
                    <span>Fruits & Vegetables</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600">Loading products...</p>
                    </div>
                  ) : allProducts.length > 0 ? (
                    <ProductGrid products={allProducts} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No products available at the moment.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="equipment">
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600">Loading equipment...</p>
                    </div>
                  ) : equipmentProducts.length > 0 ? (
                    <ProductGrid products={equipmentProducts} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No rental equipment available at the moment.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="organic">
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600">Loading organic products...</p>
                    </div>
                  ) : organicProducts.length > 0 ? (
                    <ProductGrid products={organicProducts} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No organic products available at the moment.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="produce">
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600">Loading produce...</p>
                    </div>
                  ) : produceProducts.length > 0 ? (
                    <ProductGrid products={produceProducts} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No fruits & vegetables available at the moment.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>
        
        {/* Testimonials Section - Only show for non-sellers */}
        {!isSeller && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What Our Customers Say</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <ThumbsUp className="h-5 w-5 text-yellow-500 mr-1" />
                    <ThumbsUp className="h-5 w-5 text-yellow-500 mr-1" />
                    <ThumbsUp className="h-5 w-5 text-yellow-500 mr-1" />
                    <ThumbsUp className="h-5 w-5 text-yellow-500 mr-1" />
                    <ThumbsUp className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-gray-600 italic mb-4">"The organic vegetables I ordered were incredibly fresh. You can really taste the difference compared to supermarket produce!"</p>
                  <p className="font-semibold text-gray-800">- Sarah Johnson</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <ThumbsUp className="h-5 w-5 text-yellow-500 mr-1" />
                    <ThumbsUp className="h-5 w-5 text-yellow-500 mr-1" />
                    <ThumbsUp className="h-5 w-5 text-yellow-500 mr-1" />
                    <ThumbsUp className="h-5 w-5 text-yellow-500 mr-1" />
                    <ThumbsUp className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-gray-600 italic mb-4">"Renting a tractor through FarmEase saved me a lot of money. The equipment was in excellent condition and the process was seamless."</p>
                  <p className="font-semibold text-gray-800">- Michael Thompson</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <ThumbsUp className="h-5 w-5 text-yellow-500 mr-1" />
                    <ThumbsUp className="h-5 w-5 text-yellow-500 mr-1" />
                    <ThumbsUp className="h-5 w-5 text-yellow-500 mr-1" />
                    <ThumbsUp className="h-5 w-5 text-yellow-500 mr-1" />
                    <ThumbsUp className="h-5 w-5 text-gray-300" />
                  </div>
                  <p className="text-gray-600 italic mb-4">"I love that I can support local farmers directly. The fruits are always sweet and perfectly ripe. Will definitely keep ordering!"</p>
                  <p className="font-semibold text-gray-800">- Emily Rodriguez</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
