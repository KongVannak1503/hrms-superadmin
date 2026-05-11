import React from 'react';
import { Card } from 'primereact/card';

const GlobalConfigPage: React.FC = () => {
    return (
        <div className="p-4 mx-auto w-full" style={{ maxWidth: '1200px' }}>
            <div className="flex align-items-center mb-5">
                <h1 className="m-0 text-3xl font-bold text-900 tracking-tight">Global Configuration</h1>
            </div>
            
            <Card className="shadow-1 border-round-2xl border-1 border-50">
                <div className="flex flex-column align-items-center justify-content-center p-5 text-center">
                    <i className="pi pi-cog text-500 mb-4" style={{ fontSize: '4rem' }}></i>
                    <h2 className="text-900 font-bold text-2xl mb-2">Coming Soon</h2>
                    <p className="text-600 m-0 max-w-20rem">Global configuration settings will be available in the next system update.</p>
                </div>
            </Card>
        </div>
    );
};

export default GlobalConfigPage;
