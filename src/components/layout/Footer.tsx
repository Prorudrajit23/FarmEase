import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Star, 
  Leaf, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserType } from "@/hooks/useUserType";

const Footer = () => {
  const { user } = useAuth();
  const { userType } = useUserType();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const isSeller = userType === "seller";

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback required",
        description: "Please provide some feedback before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if the feedback table exists
      const { error: tableCheckError } = await supabase
        .from('feedback')
        .select('id')
        .limit(1);
      
      // If the table doesn't exist, show a specific error
      if (tableCheckError && tableCheckError.message.includes('does not exist')) {
        console.error('Feedback table does not exist:', tableCheckError);
        toast({
          title: "System Error",
          description: "The feedback system is currently unavailable. Please try again later.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            user_id: user?.id || null,
            user_email: user?.email || null,
            feedback: feedback,
            rating: rating,
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Error submitting feedback:', error);
        
        // Provide more specific error messages based on the error type
        if (error.code === '23505') {
          toast({
            title: "Duplicate Feedback",
            description: "You've already submitted feedback recently. Please try again later.",
            variant: "destructive",
          });
        } else if (error.code === '42501') {
          toast({
            title: "Permission Denied",
            description: "You don't have permission to submit feedback. Please log in and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to submit feedback. Please try again later.",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate your input and will use it to improve our services.",
      });

      setFeedback("");
      setRating(0);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="h-6 w-6 text-green-400" />
              <h2 className="text-2xl font-bold">FarmEase</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Connecting farmers and consumers for a sustainable agricultural future.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              {!isSeller && (
                <>
                  <li>
                    <Link to="/rental" className="text-gray-400 hover:text-white transition-colors">
                      Rental Equipment
                    </Link>
                  </li>
                  <li>
                    <Link to="/organic" className="text-gray-400 hover:text-white transition-colors">
                      Organic Products
                    </Link>
                  </li>
                  <li>
                    <Link to="/produce" className="text-gray-400 hover:text-white transition-colors">
                      Fruits & Vegetables
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" className="text-gray-400 hover:text-white transition-colors">
                      Cart
                    </Link>
                  </li>
                </>
              )}
              {isSeller && (
                <>
                  <li>
                    <Link to="/my-products" className="text-gray-400 hover:text-white transition-colors">
                      My Products
                    </Link>
                  </li>
                  <li>
                    <Link to="/add-product" className="text-gray-400 hover:text-white transition-colors">
                      Add Product
                    </Link>
                  </li>
                  <li>
                    <Link to="/feedback" className="text-gray-400 hover:text-white transition-colors">
                      Customer Feedback
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-gray-400">+91 9163700904</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-gray-400">rudrajitdutta9@gmail.com</span>
              </li>
              {/* Only show feedback button for buyers or non-logged in users */}
              {!isSeller && (
                <li className="mt-4">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="bg-green-600 hover:bg-green-700 border-0">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Feedback & Support
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Send Feedback</DialogTitle>
                        <DialogDescription>
                          Share your thoughts or report an issue. We value your input!
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Your Email</label>
                          <Input 
                            value={user?.email || ""} 
                            disabled={!!user}
                            placeholder="your.email@example.com"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Your Feedback</label>
                          <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Tell us what you think or describe your issue..."
                            className="col-span-3 min-h-[100px]"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Rate Your Experience</label>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-6 w-6 cursor-pointer ${
                                  (hoverRating || rating) >= star
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          onClick={handleSubmitFeedback}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Feedback"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </li>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} FarmEase Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center">
            <span className="text-gray-400 text-sm border border-gray-700 rounded px-2 py-1">
              FarmEase Pvt. Ltd.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 