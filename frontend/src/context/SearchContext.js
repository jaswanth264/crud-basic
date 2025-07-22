import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  return (
    <SearchContext.Provider value={{ search, setSearch, searchActive, setSearchActive }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
