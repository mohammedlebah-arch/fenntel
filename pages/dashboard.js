import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => {
        if (res.status === 401) { router.push('/login'); return null; }
        return res.json();
      })
      .then(d => d && setData(d));
  }, []);

  if (!data) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <p>Total Visitors: {data.totalVisitors}</p>
      <p>Total Clicks: {data.totalClicks}</p>
      <p>Total Sales: {data.totalSales}</p>
    </div>
  );
}
