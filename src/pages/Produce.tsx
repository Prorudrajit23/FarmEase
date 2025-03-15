import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import SearchBar from "@/components/search/SearchBar";
import ProductGrid from "@/components/products/ProductGrid";
import { Carrot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
}

const Produce = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch products from the Produce category
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', await getCategoryId('Fruits and Vegetables'));
        
        if (error) {
          console.error('Error fetching produce products:', error);
          return;
        }
        
        setProducts(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getCategoryId = async (categoryName: string) => {
    const { data } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();
    
    return data?.id;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Carrot className="h-16 w-16 mx-auto text-green-600 mb-4" />
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Fruits & Vegetables
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Shop for fresh, locally grown fruits and vegetables
          </p>

          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-600 py-8">
            <p className="text-xl">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <div className="text-center text-gray-600 py-8">
            <p className="text-xl">No produce found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Produce;
