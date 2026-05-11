import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { AuthService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await AuthService.login({ email, password });
            setUser(data.user);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex align-items-center justify-content-center min-h-screen bg-gray-200">
            <Card style={{ width: '400px' }} className="shadow-4">
                <div className="text-center mb-5">
                    <h2 className="text-900 font-bold">SuperAdmin Portal</h2>
                    <p className="text-600">Please sign in to continue</p>
                </div>
                <form onSubmit={handleLogin} className="flex flex-column gap-3">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="email">Email</label>
                        <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="password">Password</label>
                        <Password id="password" value={password} onChange={(e) => setPassword(e.target.value)} feedback={false} toggleMask required style={{ width: '100%' }} inputStyle={{ width: '100%' }} />
                    </div>
                    <Button label="Sign In" icon="pi pi-user" loading={loading} className="mt-2" />
                </form>
            </Card>
        </div>
    );
};

export default LoginPage;