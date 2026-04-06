import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError(data.error || 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
      <h1>Admin Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 10 }} />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 10 }} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
