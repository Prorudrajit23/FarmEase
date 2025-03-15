import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Star, Search, ArrowUpDown, Calendar, Mail, MessageSquare, AlertCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useUserType } from "@/hooks/useUserType";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

interface FeedbackItem {
  id: string;
  user_email: string | null;
  feedback: string;
  rating: number;
  created_at: string;
}

// Mock feedback data for testing
const mockFeedback: FeedbackItem[] = [
  {
    id: "1",
    user_email: "customer1@example.com",
    feedback: "Great products! I especially loved the organic vegetables.",
    rating: 5,
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    user_email: "customer2@example.com",
    feedback: "The delivery was prompt and the produce was fresh.",
    rating: 4,
    created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: "3",
    user_email: "customer3@example.com",
    feedback: "Good service but some items were missing from my order.",
    rating: 3,
    created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  }
];

const Feedback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userType, isLoading: isLoadingUserType } = useUserType();
  const { toast } = useToast();
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FeedbackItem;
    direction: 'ascending' | 'descending';
  } | null>(null);

  useEffect(() => {
    // Redirect non-sellers away from this page
    if (!isLoadingUserType && userType !== "seller") {
      navigate("/");
      return;
    }
  }, [userType, navigate, isLoadingUserType]);

  // Direct SQL query to fetch feedback
  const fetchDirectSQL = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userInfo = `User ID: ${user?.id}, User Type: ${userType}`;
      console.log("Executing direct SQL query with user info:", userInfo);
      
      // Try the simplified function that doesn't check user type
      const { data: simpleData, error: simpleError } = await supabase.rpc('get_all_feedback_simple');
      
      if (!simpleError && simpleData) {
        console.log(`Fetched ${simpleData.length} feedback items via get_all_feedback_simple()`);
        setFeedbackItems(simpleData);
        setLoading(false);
        return true;
      }
      
      if (simpleError) {
        console.error('Error with get_all_feedback_simple:', simpleError);
      }
      
      // Try the other methods if the simplified function fails
      // Try the simpler direct function first
      const { data: directData, error: directError } = await supabase.rpc('get_feedback_direct');
      
      if (!directError && directData) {
        console.log(`Fetched ${directData.length} feedback items via get_feedback_direct()`);
        setFeedbackItems(directData);
        setLoading(false);
        return true;
      }
      
      if (directError) {
        console.error('Error with get_feedback_direct:', directError);
      }
      
      // Fall back to the generic direct SQL query
      const { data, error } = await supabase.rpc('direct_sql_query', {
        query_text: "SELECT * FROM public.feedback ORDER BY created_at DESC"
      });
      
      if (error) {
        console.error('Error with direct SQL query:', error);
        setError(`Direct SQL query error: ${error.message}`);
        return false;
      }
      
      console.log(`Fetched ${data?.length || 0} feedback items via direct SQL`);
      setFeedbackItems(data || []);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error with direct SQL:', error);
      setError(`Direct SQL error: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    if (userType !== "seller") return;
    
    try {
      setLoading(true);
      setError(null);
      
      // First check if the user has seller permissions
      const userInfo = `User ID: ${user?.id}, User Type: ${userType}`;
      console.log("Fetching feedback with user info:", userInfo);
      
      if (useMockData) {
        console.log("Using mock data for testing");
        setFeedbackItems(mockFeedback);
        setLoading(false);
        return;
      }
      
      // Try multiple approaches to fetch feedback
      
      // 1. Try direct SQL query first (if available)
      const directSQLSuccess = await fetchDirectSQL();
      if (directSQLSuccess) return;
      
      // 2. Try the RPC function approach
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_feedback');
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log(`Fetched ${rpcData.length} feedback items via RPC function`);
        setFeedbackItems(rpcData);
        return;
      } else if (rpcError) {
        console.error('Error with RPC function:', rpcError);
      }
      
      // 3. Fall back to regular query
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching feedback:', error);
        setError(`Failed to load feedback: ${error.message}`);
        
        // Check if it's a permissions issue
        if (error.code === '42501' || error.message.includes('permission')) {
          toast({
            title: "Permission Error",
            description: "You don't have permission to view feedback. Please ensure your account is properly set up as a seller.",
            variant: "destructive",
          });
        }
        
        // If all methods fail, use mock data as a last resort
        console.log("All fetch methods failed, using mock data as fallback");
        setFeedbackItems(mockFeedback);
        setUseMockData(true);
        return;
      }
      
      console.log(`Fetched ${data?.length || 0} feedback items via standard query`);
      setFeedbackItems(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error:', error);
      setError(`An unexpected error occurred: ${errorMessage}`);
      
      // Use mock data as fallback
      setFeedbackItems(mockFeedback);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userType === "seller" && user) {
      fetchFeedback();
    }
  }, [userType, user]);

  const requestSort = (key: keyof FeedbackItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const sortedItems = [...feedbackItems].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const { key, direction } = sortConfig;
    
    if (a[key] < b[key]) {
      return direction === 'ascending' ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredItems = sortedItems.filter(item => 
    item.feedback.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.user_email && item.user_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              rating >= star
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const toggleMockData = () => {
    setUseMockData(!useMockData);
    setFeedbackItems(useMockData ? [] : mockFeedback);
  };

  // Function to fetch feedback using the simplified function
  const fetchSimplifiedFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userInfo = `User ID: ${user?.id}, User Type: ${userType}`;
      console.log("Executing simplified feedback query with user info:", userInfo);
      
      const { data, error } = await supabase.rpc('get_all_feedback_simple');
      
      if (error) {
        console.error('Error with simplified feedback query:', error);
        setError(`Simplified query error: ${error.message}`);
        return false;
      }
      
      console.log(`Fetched ${data?.length || 0} feedback items via simplified function`);
      setFeedbackItems(data || []);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error with simplified feedback query:', error);
      setError(`Simplified query error: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // If still loading user type, show loading
  if (isLoadingUserType) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading user information...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If user is not a seller, don't render anything (they'll be redirected)
  if (userType !== "seller") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Feedback</h1>
              <p className="text-gray-600">
                View and manage feedback and ratings from your customers
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              {feedbackItems.length > 0 && (
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search feedback..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading feedback...</p>
              </div>
            ) : filteredItems.length > 0 ? (
              <Table>
                <TableCaption>A list of customer feedback and ratings.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">
                      <Button 
                        variant="ghost" 
                        onClick={() => requestSort('created_at')}
                        className="flex items-center p-0 h-auto font-semibold"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => requestSort('user_email')}
                        className="flex items-center p-0 h-auto font-semibold"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Customer
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead className="w-[100px]">
                      <Button 
                        variant="ghost" 
                        onClick={() => requestSort('rating')}
                        className="flex items-center p-0 h-auto font-semibold"
                      >
                        Rating
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {formatDate(item.created_at)}
                      </TableCell>
                      <TableCell>{item.user_email || "Anonymous"}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2">{item.feedback}</div>
                      </TableCell>
                      <TableCell>{renderStars(item.rating)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No feedback found matching your search.</p>
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No feedback yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  You haven't received any customer feedback yet. Feedback will appear here once customers submit their thoughts and ratings.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
                  <h4 className="font-medium text-gray-700 mb-2">Tips to encourage feedback:</h4>
                  <ul className="text-gray-600 text-sm text-left list-disc pl-5 space-y-1">
                    <li>Provide excellent customer service</li>
                    <li>Follow up with customers after purchase</li>
                    <li>Respond promptly to customer inquiries</li>
                    <li>Ensure product quality meets expectations</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Feedback; 