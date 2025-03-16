import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
}

interface ProductUpdate {
  name: string;
  price: string;
  description: string;
  image: string;
  category_id: string;
  stock: number;
  video_url: string | null;
}

const formSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  price: z.string().min(1, "Price is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().url("Please enter a valid image URL"),
  category_id: z.string().min(1, "Please select a category"),
  stock: z.coerce.number().int().min(1, "Stock must be at least 1"),
  video_url: z.string().url("Please enter a valid video URL").optional().or(z.literal("")),
});

// Helper function to convert YouTube watch URLs to embed URLs
const convertYouTubeUrl = (url: string): string => {
  if (!url) return "";
  
  // Check if it's already an embed URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  // Convert watch URL to embed URL
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (videoIdMatch && videoIdMatch[1]) {
    return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
  }
  
  // Return original URL if it doesn't match YouTube patterns
  return url;
};

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productLoaded, setProductLoaded] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      image: "",
      category_id: "",
      stock: 1,
    },
  });

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch categories
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
        
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [user]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || !user) return;

      try {
        setIsLoading(true);
        
        const { data: rawData, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        // Use type assertion to handle missing properties
        const data = rawData as any;
        
        // Check if the product belongs to the current user
        if (data.seller_id !== user.id) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to edit this product.",
            variant: "destructive",
          });
          navigate("/my-products");
          return;
        }
        
        // Set form values
        form.reset({
          name: data.name,
          price: data.price,
          description: data.description,
          image: data.image,
          category_id: data.category_id,
          stock: data.stock || 1,
          video_url: data.video_url || "",
        });
        
        setProductLoaded(true);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again.",
          variant: "destructive",
        });
        navigate("/my-products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, user, navigate, toast, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !id) {
      toast({
        title: "Error",
        description: "Missing required information.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert YouTube URL if provided
      if (values.video_url) {
        values.video_url = convertYouTubeUrl(values.video_url);
      }
      
      // Create a strongly typed update object
      const productUpdate: ProductUpdate = {
        name: values.name,
        price: values.price,
        description: values.description,
        image: values.image,
        category_id: values.category_id,
        stock: values.stock,
        video_url: values.video_url || null
      };
      
      // Bypass TypeScript with 'any'
      // Using the 'as any' casting to avoid the deep type instantiation error
      const supabaseAny = supabase as any;
      const result = await supabaseAny
        .from('products')
        .update(productUpdate)
        .eq('id', id)
        .eq('seller_id', user.id);
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Product updated",
        description: "Your product has been successfully updated.",
      });
      
      // Use setTimeout to ensure the toast is shown before navigation
      setTimeout(() => {
        // Navigate back to the my products page
        navigate("/my-products", { replace: true });
      }, 500);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update the product. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold text-green-800 mb-6">Edit Product</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1999 or 500/day for rentals (numbers only)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your product in detail" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    {form.watch("category_id") && categories.find(c => c.id === form.watch("category_id"))?.name === "Rental Equipment" && (
                      <p className="text-sm text-gray-500 mt-1">
                        For rental equipment, include specifications in the format "Key: Value" (e.g., "Engine: 100HP, Weight: 5 tons, Fuel Type: Diesel").
                        These will be displayed in a structured format on the product page.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Video URL field - conditionally shown for Equipment and Organic categories */}
              {(categories.find(c => c.id === form.watch("category_id"))?.name === "Rental Equipment" || 
                categories.find(c => c.id === form.watch("category_id"))?.name === "Organic Produce") && (
                <FormField
                  control={form.control}
                  name="video_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500 mt-1">
                        You can paste a standard YouTube URL (it will be converted automatically)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch("image") && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Image Preview:</p>
                  <img 
                    src={form.watch("image")} 
                    alt="Product preview" 
                    className="w-full max-h-[200px] object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                    }}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/my-products")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct; 
