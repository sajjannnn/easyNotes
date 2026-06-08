import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { Settings as SettingsIcon, User, Key, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [groqKey, setGroqKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      await client.put('/auth/profile', { name, email });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleApiKeySave = async () => {
    if (!groqKey.trim()) return;
    setError('');
    try {
      await client.put('/settings/api-keys', { groq: groqKey.trim() });
      setGroqKey('');
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save API key');
    }
  };

  return (
    <div className="w-full lg:max-w-2xl lg:mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-indigo-400" />
          Settings
        </h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Settings saved successfully
        </div>
      )}

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-400" />
          Profile
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Key className="h-4 w-4 text-indigo-400" />
          API Keys
        </h2>
        <p className="text-xs text-gray-500 mb-3">Add your Groq API key for AI-powered summaries.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Groq API Key</label>
            <input
              type="password"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="input-field"
              placeholder="gsk_..."
            />
          </div>
          <button onClick={handleApiKeySave} disabled={!groqKey.trim()} className="btn-primary">
            Save Key
          </button>
        </div>
      </div>

      <div className="card border-red-500/20">
        <h2 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Danger Zone
        </h2>
        <p className="text-xs text-gray-500 mb-3">Permanently delete your account and all associated data.</p>
        <button className="btn-secondary text-red-400 border-red-500/30 hover:bg-red-500/10">
          Delete Account
        </button>
      </div>
    </div>
  );
}
