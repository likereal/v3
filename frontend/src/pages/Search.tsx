import React from 'react';

const Search: React.FC = () => (
  <div>
    <h2>Smart Search</h2>
    <input type="text" placeholder="Search across code, docs, tasks..." style={{width: '100%', padding: '0.5rem', fontSize: '1rem'}} />
    <div style={{marginTop: '1rem'}}>
      <p>Semantic search results will appear here.</p>
    </div>
  </div>
);

export default Search; 