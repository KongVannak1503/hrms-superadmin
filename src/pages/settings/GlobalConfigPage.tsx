import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ConfigService } from '../../services/config.service';

const GlobalConfigPage: React.FC = () => {
    const [configs, setConfigs] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        loadConfigs();
    }, []);

    async function loadConfigs() {
        setLoading(true);
        try {
            const data = await ConfigService.getAll();
            setConfigs(data || {});
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load configuration' });
        } finally {
            setLoading(false);
        }
    };

    const updateValue = (key: string, value: any) => {
        setConfigs((prev: any) => {
            const next = { ...prev };
            for (const group of Object.keys(next)) {
                next[group] = next[group].map((c: any) =>
                    c.key === key ? { ...c, value: String(value) } : c
                );
            }
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const flat: { key: string; value: any }[] = [];
            for (const group of Object.keys(configs)) {
                for (const c of configs[group]) {
                    flat.push({ key: c.key, value: c.value });
                }
            }
            await ConfigService.update(flat);
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Configuration saved' });
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save configuration' });
        } finally {
            setSaving(false);
        }
    };

    const groupLabels: Record<string, string> = {
        general: 'General Settings',
        regional: 'Regional & Localization',
        attendance: 'Attendance',
        integrations: 'Integrations',
        security: 'Security',
    };

    const groupIcons: Record<string, string> = {
        general: 'pi pi-cog',
        regional: 'pi pi-globe',
        attendance: 'pi pi-clock',
        integrations: 'pi pi-link',
        security: 'pi pi-shield',
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center h-full">
                <ProgressSpinner />
            </div>
        );
    }

    const renderField = (config: any) => {
        switch (config.type) {
            case 'boolean':
                return (
                    <InputSwitch
                        checked={config.value === 'true' || config.value === '1'}
                        onChange={(e) => updateValue(config.key, e.value)}
                    />
                );
            case 'number':
                return (
                    <InputNumber
                        value={parseInt(config.value) || 0}
                        onChange={(e) => updateValue(config.key, e.value)}
                        className="w-full"
                    />
                );
            default:
                return (
                    <InputText
                        value={config.value || ''}
                        onChange={(e) => updateValue(config.key, e.target.value)}
                        className="w-full"
                    />
                );
        }
    };

    return (
        <div className="p-4 mx-auto w-full" style={{ maxWidth: '1200px' }}>
            <Toast ref={toast} />

            <div className="flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="m-0 text-3xl font-bold text-900 tracking-tight">Global Configuration</h1>
                    <p className="text-500 mt-1">Manage system-wide settings and defaults for all tenants.</p>
                </div>
                <Button
                    label="Save All Changes"
                    icon="pi pi-save"
                    onClick={handleSave}
                    loading={saving}
                    className="border-round-lg shadow-1 border-none font-bold px-4"
                    style={{ backgroundColor: '#1E293B', color: '#ffffff', height: '40px' }}
                />
            </div>

            <div className="grid">
                {Object.entries(configs).map(([group, items]: [string, any]) => (
                    <div key={group} className="col-12">
                        <Card className="shadow-1 border-round-2xl border-1 border-50 mb-4 overflow-hidden">
                            <div className="flex align-items-center gap-3 p-2" style={{ borderBottom: '1px solid #e2e8f0', margin: '-1.25rem -1.25rem 1rem' }}>
                                <div className="w-3rem h-3rem bg-gray-900 border-round-lg flex align-items-center justify-content-center shadow-1">
                                    <i className={`${groupIcons[group] || 'pi pi-cog'} text-white text-sm`}></i>
                                </div>
                                <div>
                                    <h3 className="m-0 text-xl font-bold text-900">{groupLabels[group] || group}</h3>
                                </div>
                            </div>

                            <div className="grid">
                                {items.map((config: any) => (
                                    <div key={config.key} className="col-12 md:col-6 lg:col-4 mb-3">
                                        <div className="flex flex-column gap-2 p-2">
                                            <label className="font-semibold text-700 text-sm">{config.label || config.key}</label>
                                            {renderField(config)}
                                            <small className="text-500" style={{ fontSize: '0.7rem' }}>{config.key}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GlobalConfigPage;
