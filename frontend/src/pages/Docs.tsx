import React, { useState } from 'react';
import './Dashboard.css';

const exampleQueries = [
'Python',
'Node.js',
'React',
'TypeScript',
'Express',
'MongoDB',
'CSS',
];

const Docs: React.FC = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await fetch(`http://localhost:5000/api/webdocs?q=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error('Failed to fetch docs');
      const data = await res.json();
      setResults(data.docs || []);
    } catch (err: any) {
      setError('Could not fetch documentation.');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (query: string) => {
    setSearch(query);
    setTimeout(() => handleSearch(), 0);
  };

  return (
    <div className="docs-page" style={{ maxWidth: 800, margin: '40px auto', background: '#1c1c27', borderRadius: 16, boxShadow: '0 2px 16px #181818', padding: 32, color: '#fff' }}>
      <h2 style={{ color: '#eebbc3', fontWeight: 700 }}>Web Documentation Search</h2>
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: '#b8c1ec', marginRight: 8 }}>Try these examples:</span>
        {exampleQueries.map((q, idx) => (
          <button
            key={q}
            onClick={() => handleExampleClick(q)}
            style={{
              marginRight: 8,
              marginBottom: 6,
              padding: '4px 12px',
              borderRadius: 6,
              border: '1.5px solid #eebbc3',
              background: 'transparent',
              color: '#eebbc3',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background 0.18s, color 0.18s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#232946'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            {q}
          </button>
        ))}
      </div>
      <form onSubmit={handleSearch} style={{ display: 'flex', marginBottom: 24, background: '#232946', borderRadius: 8, padding: 8 }}>
        <input
          type="text"
          placeholder="Search documentation..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 6, border: '1.5px solid #b8c1ec', fontSize: 16, background: '#181818', color: '#fff' }}
        />
        <button
          type="submit"
          style={{ marginLeft: 12, padding: '10px 24px', borderRadius: 6, background: '#eebbc3', color: '#232946', border: 'none', fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px #232946', transition: 'background 0.18s, color 0.18s' }}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {!loading && results.length === 0 && !error && (
          <li style={{ color: '#888' }}>No documentation found. Try searching for a topic.</li>
        )}
        {results.map((doc, idx) => (
          <li key={idx} style={{ marginBottom: 24, padding: 20, border: '1.5px solid #232946', borderRadius: 12, background: '#232946', color: '#fff', boxShadow: '0 2px 8px #181818' }}>
            <div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontWeight: 'bold',
                  fontSize: 18,
                  color: '#eebbc3',
                  textDecoration: 'underline',
                  wordBreak: 'break-all',
                }}
              >
                {doc.title}
              </a>
              {doc.description && <div style={{ color: '#b8c1ec', margin: '6px 0 0 0' }}>{doc.description}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Docs; 