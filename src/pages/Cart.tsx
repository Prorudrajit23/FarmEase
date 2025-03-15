import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ArrowLeft, ShoppingCart, Plus, Minus, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { sendInvoiceEmail } from "@/services/emailService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CartProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  category: string;
  stock?: number;
}

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [stockLevels, setStockLevels] = useState<{[key: string]: number}>({});
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch current stock levels for all cart items
  useEffect(() => {
    const fetchStockLevels = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, stock')
          .in('id', cartItems.map(item => item.id));
        
        if (error) {
          console.error('Error fetching stock levels:', error);
          return;
        }

        const stockMap: {[key: string]: number} = {};
        data.forEach(product => {
          stockMap[product.id] = product.stock;
        });
        
        setStockLevels(stockMap);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (cartItems.length > 0) {
      fetchStockLevels();
    }
  }, [cartItems]);

  const sendInvoiceToUser = async () => {
    try {
      const orderNumber = `ORD-${Math.random().toString(36).substr(2, 9)}`;
      
      if (!user?.email) {
        throw new Error('User email not found');
      }

      // Ensure prices have the ₹ symbol
      const formattedCartItems = cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: formatPrice(item.price)
      }));

      const { success, error } = await sendInvoiceEmail(
        user.email,
        "",  // No need to pass HTML, the template will be used
        {
          orderNumber,
          totalAmount: `₹${getCartTotal().toFixed(2)}`,
          items: formattedCartItems
        }
      );

      if (!success) {
        throw error;
      }
      
      toast({
        title: "Invoice sent",
        description: "Check your email for the invoice details.",
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Failed to send invoice",
        description: "There was an error sending the invoice. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    setShowPaymentDialog(true);
  };

  const processPayment = async () => {
    setProcessingPayment(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Send invoice email
      await sendInvoiceToUser();
      
      setProcessingPayment(false);
      setShowPaymentDialog(false);
      
      toast({
        title: "Payment successful!",
        description: "Your order has been placed and an invoice has been sent to your email.",
      });
      
      clearCart();
      navigate("/");
    } catch (error) {
      console.error('Error processing payment:', error);
      setProcessingPayment(false);
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: string) => {
    // Extract numeric price from string (e.g., "₹45.99" -> 45.99)
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ""));
    return isNaN(numericPrice) ? price : `₹${numericPrice.toFixed(2)}`;
  };

  const calculateItemTotal = (price: string, quantity: number) => {
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ""));
    return isNaN(numericPrice) ? "N/A" : `₹${(numericPrice * quantity).toFixed(2)}`;
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const maxStock = stockLevels[id];
    if (newQuantity > maxStock) {
      toast({
        title: "Maximum stock reached",
        description: `Only ${maxStock} items available in stock.`,
        variant: "destructive",
      });
      return;
    }
    updateQuantity(id, newQuantity);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white overflow-x-hidden">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
          <h1 className="text-3xl font-bold text-green-800">Your Cart</h1>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/")}
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b">
                  <div className="col-span-6 font-medium text-gray-700">Product</div>
                  <div className="col-span-2 font-medium text-gray-700 text-center">Price</div>
                  <div className="col-span-2 font-medium text-gray-700 text-center">Quantity</div>
                  <div className="col-span-2 font-medium text-gray-700 text-center">Total</div>
                </div>
                
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center">
                      {/* Product */}
                      <div className="col-span-6 flex items-center mb-4 md:mb-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-md mr-4"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Available";
                          }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          {stockLevels[item.id] && item.quantity >= stockLevels[item.id] && (
                            <p className="text-xs text-amber-600 mt-1">Maximum stock reached</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="col-span-2 text-center mb-4 md:mb-0">
                        <div className="md:hidden text-sm text-gray-500 mb-1">Price:</div>
                        <div className="font-medium">{formatPrice(item.price)}</div>
                      </div>
                      
                      {/* Quantity */}
                      <div className="col-span-2 flex items-center justify-center mb-4 md:mb-0">
                        <div className="md:hidden text-sm text-gray-500 mr-2">Quantity:</div>
                        <div className="flex items-center border rounded-md">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value >= 1) {
                                handleQuantityChange(item.id, value);
                              }
                            }}
                            className="w-12 h-8 text-center border-0 p-0"
                            min="1"
                            max={stockLevels[item.id]}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={stockLevels[item.id] && item.quantity >= stockLevels[item.id]}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="col-span-1 text-center mb-4 md:mb-0">
                        <div className="md:hidden text-sm text-gray-500 mb-1">Total:</div>
                        <div className="font-medium">{calculateItemTotal(item.price, item.quantity)}</div>
                      </div>
                      
                      {/* Remove */}
                      <div className="col-span-1 flex justify-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-green-700">₹{getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Enter your payment details to complete the purchase
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Number</label>
                <Input 
                  placeholder="4111 1111 1111 1111"
                  disabled={processingPayment}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiry Date</label>
                  <Input 
                    placeholder="MM/YY"
                    disabled={processingPayment}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CVV</label>
                  <Input 
                    placeholder="123"
                    type="password"
                    maxLength={3}
                    disabled={processingPayment}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={processPayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>Pay ₹{getCartTotal().toFixed(2)}</>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Cart; 