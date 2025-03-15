import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import SearchBar from "@/components/search/SearchBar";
import ProductGrid from "@/components/products/ProductGrid";
import { Tractor } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
}

const Rental = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [equipment, setEquipment] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        
        // Fetch products from the Equipment category
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', await getCategoryId('Rental Equipment'));
        
        if (error) {
          console.error('Error fetching equipment:', error);
          return;
        }
        
        setEquipment(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const getCategoryId = async (categoryName: string) => {
    const { data } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();
    
    return data?.id;
  };

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Tractor className="h-16 w-16 mx-auto text-green-600 mb-4" />
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Rental Equipment
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Find and rent the farming equipment you need for your agricultural projects
          </p>

          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search equipment..."
          />
        </div>
        
        {loading ? (
          <div className="text-center text-gray-600 py-8">
            <p className="text-xl">Loading equipment...</p>
          </div>
        ) : filteredEquipment.length > 0 ? (
          <ProductGrid products={filteredEquipment} />
        ) : (
          <div className="text-center text-gray-600 py-8">
            <p className="text-xl">No equipment found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rental;
