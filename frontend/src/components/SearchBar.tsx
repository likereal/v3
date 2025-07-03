import React from 'react';

type SearchBarProps = {
  placeholder?: string;
};

const SearchBar: React.FC<SearchBarProps> = ({ placeholder }) => (
  <input type="text" placeholder={placeholder || 'Search...'} style={{width: '100%', padding: '0.5rem', fontSize: '1rem'}} />
);

export default SearchBar; 