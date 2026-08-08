import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

function Sponsorships() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/sponsorships');
            if (data.success) {
                setDeals(data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch sponsorships');
        } finally {
            setLoading(false);
        }
    };

    const handleSeedData = async () => {
        try {
            const { data } = await api.post('/api/sponsorships/seed');
            if (data.success) {
                toast.success('Dummy data seeded successfully');
                fetchDeals();
            }
        } catch (error) {
            toast.error('Failed to seed data');
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    return (
        <div className="container" style={{ paddingTop: '80px', maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Sponsorship Deals</h2>
                <button 
                    onClick={handleSeedData}
                    style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Seed Dummy Data
                </button>
            </div>
            
            <p style={{ marginBottom: '20px', color: '#64748b' }}>
                This table is populated by querying a PostgreSQL database using an explicit SQL <strong>INNER JOIN</strong> between the <code>Deal</code> and <code>Sponsor</code> tables via Prisma <code>$queryRaw</code>.
            </p>

            {loading ? (
                <p>Loading...</p>
            ) : deals.length === 0 ? (
                <p style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>No sponsorship deals found. Click "Seed Dummy Data" to create some!</p>
            ) : (
                <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '12px 16px' }}>Sponsor Company</th>
                                <th style={{ padding: '12px 16px' }}>Industry</th>
                                <th style={{ padding: '12px 16px' }}>Creator Email</th>
                                <th style={{ padding: '12px 16px' }}>Deal Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deals.map((deal, index) => (
                                <tr key={deal.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{deal.companyName}</td>
                                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{deal.industry}</td>
                                    <td style={{ padding: '12px 16px' }}>{deal.creatorEmail}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#10b981' }}>${Number(deal.amount).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Sponsorships;
