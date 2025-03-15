import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const testConnection = async () => {
    setConnectionStatus('loading');
    setErrorMessage(null);
    
    try {
      // Test the connection by fetching categories
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(5);
      
      if (error) {
        throw error;
      }
      
      setCategories(data || []);
      setConnectionStatus('success');
    } catch (error: any) {
      console.error('Supabase connection error:', error);
      setConnectionStatus('error');
      setErrorMessage(error.message || 'An unknown error occurred');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 mt-8">
      <h2 className="text-xl font-bold text-green-800">Supabase Connection Test</h2>
      
      <Button 
        onClick={testConnection}
        disabled={connectionStatus === 'loading'}
        className="w-full"
      >
        {connectionStatus === 'loading' ? 'Testing...' : 'Test Connection'}
      </Button>
      
      {connectionStatus === 'success' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Connection Successful!</AlertTitle>
          <AlertDescription>
            Successfully connected to your Supabase project.
            {categories.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Categories found:</p>
                <ul className="list-disc pl-5 mt-1">
                  {categories.map((category) => (
                    <li key={category.id}>{category.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {connectionStatus === 'error' && (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Connection Failed</AlertTitle>
          <AlertDescription>
            {errorMessage || 'Could not connect to Supabase. Please check your credentials.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SupabaseTest; 