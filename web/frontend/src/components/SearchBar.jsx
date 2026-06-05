import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search files, comments, summaries..."
        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 transition-all duration-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
      />
    </form>
  );
}
