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
    <div style={{ maxWidth: 800, margin: '40px auto', background: '#e6fce6', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h2 style={{ color: '#555' }}>Web Documentation Search</h2>
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: '#888', marginRight: 8 }}>Try these examples:</span>
        {exampleQueries.map((q, idx) => (
          <button
            key={q}
            onClick={() => handleExampleClick(q)}
            style={{
              marginRight: 8,
              marginBottom: 6,
              padding: '4px 12px',
              borderRadius: 4,
              border: '1px solidrgb(99, 171, 244)',
              background: '#f5faff',
              color: '#1976d2',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {q}
          </button>
        ))}
      </div>
      <form onSubmit={handleSearch} style={{ display: 'flex', marginBottom: 24, background: '#e6fce6', borderRadius: 6, padding: 8 }}>
        <input
          type="text"
          placeholder="Search documentation..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }}
        />
        <button
          type="submit"
          style={{ marginLeft: 12, padding: '10px 24px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 500, fontSize: 16 }}
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
          <li key={idx} style={{ marginBottom: 24, padding: 16, border: '1px solid #f0f0f0', borderRadius: 6 }}>
            <div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontWeight: 'bold',
                  fontSize: 18,
                  color: '#1976d2',
                  textDecoration: 'underline',
                  wordBreak: 'break-all',
                }}
                onClick={() => {
                  try {
                    localStorage.setItem('last_docs_read', JSON.stringify({
                      title: doc.title,
                      url: doc.url,
                      date: new Date().toISOString(),
                    }));
                  } catch {}
                }}
              >
                {doc.title}
              </a>
              {doc.description && <div style={{ color: '#555', margin: '6px 0 0 0' }}>{doc.description}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Docs; 