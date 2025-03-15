import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { Eye } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
}

const ProductCard = ({ id, name, price, description, image }: ProductCardProps) => {
  const location = useLocation();
  
  return (
    <Card key={id} className="hover:shadow-lg transition-shadow group">
      <Link to={`/product/${id}`} className="block">
        <CardContent className="p-6">
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover rounded-md mb-4 group-hover:opacity-90 transition-opacity"
          />
          <h3 className="text-xl font-semibold text-green-800 mb-2 group-hover:text-green-700 transition-colors">
            {name}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-green-700">
              ₹{price}
            </span>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={(e) => {
                // Prevent navigation to product details when clicking the button
                e.preventDefault();
                // Navigate to product details
                window.location.href = `/product/${id}`;
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProductCard;
