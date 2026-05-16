import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Password } from 'primereact/password';
import { CompanyService } from '../services/company.service';
import ImageCropper from '../components/common/ImageCropper';

const CompanyEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    
    // Form State
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [employeeIdPrefix, setEmployeeIdPrefix] = useState('EMP-');
    const [employeeIdNextNumber, setEmployeeIdNextNumber] = useState<number>(1);
    const [employeeIdLength, setEmployeeIdLength] = useState<number>(4);
    const [status, setStatus] = useState('Active');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [showCropDialog, setShowCropDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setImageError("File size exceeds 10MB limit.");
                toast.current?.show({ severity: 'error', summary: 'File Too Large', detail: 'Maximum upload size is 10MB.' });
                e.target.value = '';
                return;
            }
            setImageError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCropSrc(reader.result as string);
                setShowCropDialog(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropConfirm = async (croppedBlob: Blob) => {
        const croppedFile = new File([croppedBlob], 'logo.jpg', { type: 'image/jpeg' });
        setImageFile(croppedFile);
        setPreviewImage(URL.createObjectURL(croppedBlob));
        setShowCropDialog(false);
        setCropSrc(null);
    };

    const handleCropCancel = () => {
        setShowCropDialog(false);
        setCropSrc(null);
        setImageFile(null);
        setPreviewImage(null);
    };

    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Suspended', value: 'Suspended' },
        { label: 'Inactive', value: 'Inactive' }
    ];

    useEffect(() => {
        if (id) {
            loadCompany();
        }
    }, [id]);

    const loadCompany = async () => {
        setIsLoading(true);
        try {
            const data = await CompanyService.getById(id as string);
            const comp = data.company || data;
            const adm = data.admin;
            setName(comp.name || '');
            setWebsite(comp.website || '');
            setEmployeeIdPrefix(comp.employee_id_prefix || 'EMP-');
            setEmployeeIdNextNumber(comp.employee_id_next_number || 1);
            setEmployeeIdLength(comp.employee_id_length || 4);
            setStatus(comp.status || 'Active');
            
            if (comp.logo_url) {
                const STORAGE_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api', '') + '/storage/';
                setPreviewImage(`${STORAGE_BASE_URL}${comp.logo_url}`);
            }

            if (adm) {
                setAdminEmail(adm.email || '');
            }
        } catch (error) {
            console.error('Failed to load company details', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load company details' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name || !adminEmail) {
            toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields.' });
            return;
        }

        setIsSubmitting(true);
        try {
            if (id) {
                const payload: any = { 
                    name, 
                    website,
                    employee_id_prefix: employeeIdPrefix,
                    employee_id_next_number: employeeIdNextNumber,
                    employee_id_length: employeeIdLength,
                    status, 
                    admin_email: adminEmail 
                };
                if (adminPassword) {
                    payload.admin_password = adminPassword;
                }
                await CompanyService.update(id, payload);

                if (imageFile) {
                    try {
                        await CompanyService.uploadLogo(id, imageFile);
                    } catch (imgError) {
                        console.error("Failed to upload logo", imgError);
                        toast.current?.show({ severity: 'warn', summary: 'Upload Failed', detail: 'Company updated but logo upload failed.' });
                    }
                }

                toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Company Updated Successfully' });
                setTimeout(() => navigate('/companies'), 1000);
            }
        } catch (error: any) {
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: error.response?.data?.message || 'Failed to update company' 
            });
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-content-center align-items-center h-full">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div className="p-4 max-w-screen-lg mx-auto">
            <Toast ref={toast} />
            <div className="text-500 text-sm mb-3 font-medium">
                <span className="cursor-pointer hover:text-900 transition-colors" onClick={() => navigate('/companies')}>Companies</span>
                <span className="mx-2">›</span>
                <span className="text-900 font-bold">Edit Company</span>
            </div>

            <div className="flex flex-column md:flex-row md:align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="m-0 text-3xl font-bold text-900 mb-2" style={{ color: '#0F172A' }}>Update Company Tenant</h1>
                    <p className="m-0 text-500">Modify the tenant details and active status.</p>
                </div>
                <div className="flex gap-3 mt-3 md:mt-0">
                    <Button label="Cancel" severity="secondary" outlined onClick={() => navigate('/companies')} className="border-round-lg shadow-1" />
                    <Button label="Save Changes" icon="pi pi-save" onClick={handleSave} loading={isSubmitting} className="border-round-lg shadow-1 border-none" style={{ backgroundColor: '#1E293B', color: '#ffffff' }} />
                </div>
            </div>

            {cropSrc && (
                <ImageCropper
                    imageSrc={cropSrc}
                    open={showCropDialog}
                    onCancel={handleCropCancel}
                    onConfirm={handleCropConfirm}
                    aspect={1}
                />
            )}

            <div className="grid">
                {/* General Info Card */}
                <div className="col-12 md:col-7">
                    <Card className="bg-white border-1 border-round-xl mb-4 shadow-1" style={{ borderColor: '#e5e7eb' }}>
                        <div className="flex justify-content-between align-items-center mb-4">
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-building text-600 text-xl"></i>
                                <span className="font-bold text-900 text-xl">Company Information</span>
                            </div>
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 border-round border-1 border-indigo-100">TENANT DETAILS</span>
                        </div>

                        <div className="grid">
                            <div className="col-12 mb-3">
                                <label className="block mb-2 font-semibold text-700">Company Name *</label>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-briefcase ml-2" />
                                    <InputText placeholder="Enter official company name" className="w-full border-round-lg pl-5" value={name} onChange={(e) => setName(e.target.value)} />
                                </span>
                            </div>

                            <div className="col-12 mb-3">
                                <label className="block mb-2 font-semibold text-700">Website</label>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-globe ml-2" />
                                    <InputText placeholder="https://www.company.com" className="w-full border-round-lg pl-5" value={website} onChange={(e) => setWebsite(e.target.value)} />
                                </span>
                            </div>

                            <div className="col-12 mt-3 mb-2">
                                <h3 className="text-lg font-bold text-800 m-0 border-top-1 border-200 pt-3">Employee ID Configuration</h3>
                                <p className="text-500 text-sm m-0 mt-1">Configure how employee IDs are automatically generated.</p>
                            </div>

                            <div className="col-12 md:col-4 mb-3">
                                <label className="block mb-2 font-semibold text-700">ID Prefix</label>
                                <InputText placeholder="EMP-" className="w-full border-round-lg" value={employeeIdPrefix} onChange={(e) => setEmployeeIdPrefix(e.target.value)} />
                            </div>
                            <div className="col-12 md:col-4 mb-3">
                                <label className="block mb-2 font-semibold text-700">Next Number</label>
                                <InputText type="number" className="w-full border-round-lg" value={employeeIdNextNumber as any} onChange={(e) => setEmployeeIdNextNumber(parseInt(e.target.value) || 1)} />
                            </div>
                            <div className="col-12 md:col-4 mb-3">
                                <label className="block mb-2 font-semibold text-700">ID Length</label>
                                <InputText type="number" className="w-full border-round-lg" value={employeeIdLength as any} onChange={(e) => setEmployeeIdLength(parseInt(e.target.value) || 4)} />
                            </div>
                            <div className="col-12 mt-2">
                                <div className="bg-blue-50 p-3 border-round-lg border-1 border-blue-100 flex align-items-center gap-2">
                                    <i className="pi pi-info-circle text-blue-500"></i>
                                    <span className="text-sm text-blue-800">Preview: <strong>{employeeIdPrefix}{String(employeeIdNextNumber).padStart(employeeIdLength, '0')}</strong></span>
                                </div>
                            </div>
                            
                            <div className="col-12 mt-4">
                                <div className="border-1 border-gray-200 border-dashed border-round-lg p-4 flex gap-4 align-items-center bg-gray-50">
                                    <input 
                                        type="file" 
                                        accept="image/png, image/jpeg" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={handleImageChange}
                                    />
                                    <div 
                                        className="w-8rem h-8rem bg-white border-1 border-gray-200 border-dashed border-round flex flex-column align-items-center justify-content-center text-500 cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {previewImage ? (
                                            <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <>
                                                <i className="pi pi-image text-2xl mb-2"></i>
                                                <span className="text-xs font-bold uppercase">Upload Logo</span>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-900 mb-1">Company Logo</div>
                                        <div className="text-sm text-500 line-height-3 mb-3">Recommended: Square PNG with transparent background.<br/>Max file size: 10MB.</div>
                                        {imageError && (
                                            <div className="text-red-500 text-sm mt-2 flex align-items-center gap-1">
                                                <i className="pi pi-exclamation-circle" />
                                                {imageError}
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <Button label="SELECT FILE" type="button" size="small" severity="secondary" outlined onClick={() => fileInputRef.current?.click()} />
                                            {previewImage && <Button label="REMOVE" type="button" size="small" text severity="danger" onClick={() => { setPreviewImage(null); setImageFile(null); }} />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Status Settings Card */}
                <div className="col-12 md:col-5">
                    <Card className="bg-white border-1 border-round-xl h-full shadow-1" style={{ borderColor: '#e5e7eb' }}>
                        <div className="flex justify-content-between align-items-center mb-4">
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-shield text-600 text-xl"></i>
                                <span className="font-bold text-900 text-xl">Master Administrator</span>
                            </div>
                        </div>

                        <div className="flex flex-column gap-4 mb-4">
                            <div className="bg-orange-50 p-3 border-round-lg border-1 border-orange-100 flex align-items-start gap-2 mb-2">
                                <i className="pi pi-info-circle text-orange-500 mt-1"></i>
                                <span className="text-sm text-orange-800 line-height-3">Update the master admin's email or reset their password here. Leave password blank if you do not wish to change it.</span>
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold text-700">Admin Email Address *</label>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-envelope ml-2" />
                                    <InputText 
                                        type="email"
                                        placeholder="admin@company.com" 
                                        className="w-full border-round-lg pl-5" 
                                        value={adminEmail} 
                                        onChange={(e) => setAdminEmail(e.target.value)} 
                                    />
                                </span>
                            </div>
                            
                            <div>
                                <label className="block mb-2 font-semibold text-700">New Password (Optional)</label>
                                <Password 
                                    value={adminPassword} 
                                    onChange={(e) => setAdminPassword(e.target.value)} 
                                    toggleMask 
                                    feedback={false}
                                    placeholder="Enter new password to reset"
                                    className="w-full"
                                    inputClassName="w-full border-round-lg"
                                />
                            </div>
                        </div>

                        <hr className="my-4 border-top-1 border-200" />

                        <div className="flex justify-content-between align-items-center mb-4">
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-sliders-h text-600 text-xl"></i>
                                <span className="font-bold text-900 text-xl">Tenant Settings</span>
                            </div>
                        </div>

                        <div className="flex flex-column gap-4">
                            <div className="bg-blue-50 p-3 border-round-lg border-1 border-blue-100 flex align-items-start gap-2 mb-2">
                                <i className="pi pi-info-circle text-blue-500 mt-1"></i>
                                <span className="text-sm text-blue-800 line-height-3">Changing the status to Suspended will immediately revoke login access for all users under this tenant.</span>
                            </div>

                            <div>
                                <label className="block mb-2 font-semibold text-700">Account Status *</label>
                                <Dropdown 
                                    value={status} 
                                    onChange={(e) => setStatus(e.value)} 
                                    options={statusOptions} 
                                    optionLabel="label"
                                    className="w-full border-round-lg"
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CompanyEditPage;
