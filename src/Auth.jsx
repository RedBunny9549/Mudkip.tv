import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { LogIn, UserPlus, Loader2, Mail } from 'lucide-react';

function Auth({ onSession }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else if (isSignUp) {
      alert("Check your email for a confirmation link!");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-accent mb-2">
            {isSignUp ? 'JOIN THE SQUAD' : 'WELCOME BACK'}
          </h2>
          <p className="text-gray-500 text-sm">Access your watch history on Mudkip.tv</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-gray-800 rounded-lg py-3 px-10 outline-none focus:ring-2 focus:ring-accent transition"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-gray-800 rounded-lg py-3 px-10 outline-none focus:ring-2 focus:ring-accent transition"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-accent hover:bg-blue-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? <UserPlus size={20}/> : <LogIn size={20}/>)}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 text-sm text-gray-500 hover:text-accent transition"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'New to Mudkip? Create an account'}
        </button>
      </div>
    </div>
  );
}

export default Auth;