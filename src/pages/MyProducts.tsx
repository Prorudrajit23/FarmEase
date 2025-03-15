import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Plus, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  category_id: string;
  stock: number;
  created_at: string;
  category_name?: string;
}

const MyProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [categories, setCategories] = useState<{[key: string]: string}>({});
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch categories first
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name');
        
        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        const categoryMap: {[key: string]: string} = {};
        data.forEach(category => {
          categoryMap[category.id] = category.name;
        });
        
        setCategories(categoryMap);
        setCategoriesLoaded(true);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [user]);

  // Fetch products after categories are loaded
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user || !categoriesLoaded) return;
      
      try {
        setLoading(true);
        
        // Fetch products created by the current user
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id);
        
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }
        
        // Add category name to each product
        const productsWithCategory = data.map(product => ({
          ...product,
          category_name: categories[product.category_id] || 'Unknown'
        }));
        
        setProducts(productsWithCategory);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, categoriesLoaded, categories]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Remove the deleted product from state
      setProducts(products.filter(product => product.id !== id));
      
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete the product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/edit-product/${id}`);
  };

  const filteredProducts = activeTab === "all" 
    ? products 
    : products.filter(product => {
        const categoryName = categories[product.category_id];
        if (activeTab === "equipment") return categoryName === "Rental Equipment";
        if (activeTab === "organic") return categoryName === "Organic Produce";
        if (activeTab === "produce") return categoryName === "Fruits and Vegetables";
        return true;
      });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">My Products</h1>
          <Button 
            onClick={() => navigate("/add-product")}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="equipment">Rental Equipment</TabsTrigger>
            <TabsTrigger value="organic">Organic Products</TabsTrigger>
            <TabsTrigger value="produce">Fruits & Vegetables</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Found";
                      }}
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-green-800">{product.name}</h3>
                          <p className="text-sm text-gray-500">{categories[product.category_id]}</p>
                        </div>
                        <span className="font-bold text-green-700">₹{product.price}</span>
                      </div>
                      <p className="mt-2 text-gray-600 line-clamp-2">{product.description}</p>
                      <p className="mt-2 text-sm">Stock: {product.stock}</p>
                      
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(product.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                <p className="mt-2 text-gray-500">
                  You haven't added any products in this category yet.
                </p>
                <Button 
                  onClick={() => navigate("/add-product")}
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyProducts; 