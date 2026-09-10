import React, { useState, useEffect, useMemo } from 'react';

// Define the structure of individual item objects expected from the JSON endpoint
interface KatanaItem {
  name: string;
  price: number | string; // Handled as both string or number depending on the JSON structure
  [key: string]: any;     // Fallback for other potential properties in the object
}

export const KatanaSearch: React.FC = () => {
  // State variables for input management and data fetching
  const [query, setQuery] = useState<string>('');
  const [data, setData] = useState<KatanaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch remote JSON data using the useEffect hook on initial mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          'https://raw.githubusercontent.com/changhejeong/web-assets-hotlink/main/katana-data.json'
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        // Ensure that the structure retrieved is an array before setting state
        if (Array.isArray(jsonData)) {
          setData(jsonData);
        } else if (jsonData && typeof jsonData === 'object') {
          // If the list is wrapped in an object property (e.g., jsonData.products)
          const fallbackArray = Object.values(jsonData).find(Array.isArray);
          setData(fallbackArray || []);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch katana data:", err);
        setError("Unable to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Perform modern, case-insensitive matching across names and prices
  const filteredResults = useMemo(() => {
    const sanitizedQuery = query.trim().toLowerCase();
    if (!sanitizedQuery) return [];

    return data.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(sanitizedQuery);
      const priceMatch = String(item.price).toLowerCase().includes(sanitizedQuery);
      return nameMatch || priceMatch;
    });
  }, [query, data]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col space-y-2">
        {/* Single-line text input styled with Tailwind */}
        <input
          id="search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the Katana you want..."
          className="w-full bg-white rounded-full border-1 border-gray-700 text-gray-700 py-2 px-4 m-1"
          disabled={isLoading || !!error}
        />
      </div>

      {/* Network Status Indicators */}
      {isLoading && (
        <div className="text-sm text-gray-500 animate-pulse text-center py-2">
          Loading records...
        </div>
      )}
      {error && (
        <div className="text-sm text-red-500 text-center py-2 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* 3. Conditional DIV Block: Displays exclusively when user has typed text */}
      {query.trim().length > 0 && !isLoading && !error && (
        <div className="fixed w-full max-w-md mx-auto mt-1 border border-gray-100 bg-gray-50 rounded-lg shadow-inner max-h-60 overflow-y-auto transition-all duration-200">
          {filteredResults.length > 0 ? (
            <div className="space-y-3">

              {filteredResults.map((item, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-2 bg-white rounded transition-colors"
                >
                  <span className="cursor-pointer font-medium text-black hover:text-blue-700">{item.name}</span>
                  <span className="cursor-pointer text-sm font-mono font-bold text-black">
                    {typeof item.price === 'number' ? `$${item.price.toLocaleString()}` : item.price}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* 4. Fallback rendering for unmapped / mismatched user queries */
            <div className="font-light text-sm tracking-wider text-black m-2 p-2">
              The result you want doesn't seem to be on the list.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KatanaSearch;
