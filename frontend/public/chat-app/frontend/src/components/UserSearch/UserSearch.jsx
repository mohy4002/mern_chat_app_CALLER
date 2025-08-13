import React, { useState } from 'react';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  async function handleSearch(e) {
    e.preventDefault();
    // Dummy data for demo
    setResults([{ _id: '1', username: 'alice' }, { _id: '2', username: 'bob' }]);
  }

  return (
    <div className="user-search">
      <form onSubmit={handleSearch}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search users..."
        />
        <button type="submit">Search</button>
      </form>
      <ul>
        {results.map(user => (
          <li key={user._id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
}
