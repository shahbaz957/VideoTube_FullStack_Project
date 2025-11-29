import React, { useContext} from "react";
import { SearchContext } from "../context/SearchContext";
function SearchBar() {
  const {query , setQuery} = useContext(SearchContext)

  return (
    <div className="w-full flex justify-center mt-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search videos..."
        className="w-80 md:w-96 px-4 py-2 border rounded-lg shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default SearchBar;
