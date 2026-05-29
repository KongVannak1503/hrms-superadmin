import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Avatar } from 'primereact/avatar';
import { Checkbox } from 'primereact/checkbox';
import { SelectButton } from 'primereact/selectbutton';
import { Toast } from 'primereact/toast';
import { UserService } from '../../services/user.service';
import ImageCropper from '../../components/common/ImageCropper';

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userDialog, setUserDialog] = useState(false);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [user, setUser] = useState<any>({ name: '', email: '', password: '' });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Image Upload State
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [showCropDialog, setShowCropDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Permissions
    const [permissionList, setPermissionList] = useState<any[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [fullAccess, setFullAccess] = useState<boolean>(true);

    const toast = useRef<Toast>(null);

    const STORAGE_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '') + '/storage/';

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await UserService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    };

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
        const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
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

    const openNew = () => {
        setUser({ name: '', email: '', password: '' });
        setPreviewImage(null);
        setImageFile(null);
        setSubmitted(false);
        setFullAccess(true);
        setSelectedPermissions([]);
        loadPermissions();
        setUserDialog(true);
    };

    const editUser = (usr: any) => {
        setUser({ ...usr, password: '' });
        setPreviewImage(usr.profile_image ? `${STORAGE_BASE_URL}${usr.profile_image}` : null);
        setImageFile(null);
        setSubmitted(false);
        const perms = usr.permissions ?? [];
        const isFull = perms.length === 0 || perms.includes('full_access');
        setFullAccess(isFull);
        setSelectedPermissions(isFull ? [] : perms);
        loadPermissions();
        setUserDialog(true);
    };

    const hideDialog = () => {
        setUserDialog(false);
        setSubmitted(false);
    };

    const loadPermissions = async () => {
        try {
            const list = await UserService.getPermissionsList();
            setPermissionList(Array.isArray(list) ? list : []);
        } catch (_) { }
    };

    const confirmDeleteUser = (usr: any) => {
        setUser(usr);
        setDeleteUserDialog(true);
    };

    const hideDeleteDialog = () => {
        setDeleteUserDialog(false);
    };

    const saveUser = async () => {
        setSubmitted(true);

        if (user.name.trim() && user.email.trim() && (!user.id && !user.password.trim() ? false : true)) {
            setIsSubmitting(true);
            try {
                let result;
                const permissions = fullAccess ? [] : selectedPermissions;
                if (user.id) {
                    const payload: any = { name: user.name, email: user.email, permissions };
                    if (user.password) payload.password = user.password;
                    result = await UserService.update(user.id, payload);
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'SuperAdmin Updated', life: 3000 });
                } else {
                    result = await UserService.create({ ...user, permissions });
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'SuperAdmin Created', life: 3000 });
                }

                const userId = user.id || result?.id;
                if (imageFile && userId) {
                    try {
                        await UserService.uploadImage(userId, imageFile);
                    } catch (imgError) {
                        console.error("Failed to upload profile image", imgError);
                        toast.current?.show({ severity: 'warn', summary: 'Upload Failed', detail: 'User saved but profile image upload failed.' });
                    }
                }

                setUserDialog(false);
                loadUsers();
            } catch (error: any) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to save user' });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const deleteUser = async () => {
        try {
            await UserService.delete(user.id);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
            setDeleteUserDialog(false);
            loadUsers();
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to delete user' });
        }
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-2">
            <h2 className="m-0 text-900 font-bold" style={{ color: '#0F172A' }}>System Administrators</h2>
            <Button label="New SuperAdmin" icon="pi pi-plus" onClick={openNew} className="border-round-lg font-bold shadow-1 border-none" style={{ height: '34px', backgroundColor: '#1E293B', color: '#ffffff' }} />
        </div>
    );

    const userDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} className="text-600" />
            <Button label={user.id ? "Update User" : "Create User"} icon="pi pi-check" onClick={saveUser} loading={isSubmitting} className="border-round-lg" style={{ backgroundColor: '#1E293B', borderColor: '#1E293B' }} />
        </>
    );

    const deleteUserDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteUser} />
        </>
    );

    const userBodyTemplate = (rowData: any) => {
        return (
            <div className="flex align-items-center gap-3">
                <Avatar 
                    image={rowData.profile_image ? `${STORAGE_BASE_URL}${rowData.profile_image}` : undefined} 
                    label={!rowData.profile_image ? rowData.name.charAt(0).toUpperCase() : undefined} 
                    shape="circle" 
                    className="shadow-1 border-1 border-100"
                    style={{ backgroundColor: !rowData.profile_image ? '#0F172A' : 'transparent', color: '#ffffff' }}
                />
                <span className="font-bold text-900">{rowData.name}</span>
            </div>
        );
    };

    return (
        <div className="p-4 mx-auto w-full" style={{ maxWidth: '1200px' }}>
            <Toast ref={toast} />
            <div className="flex align-items-center mb-5">
                <h1 className="m-0 text-3xl font-bold text-900 tracking-tight" style={{ color: '#0F172A' }}>SuperAdmin Users</h1>
            </div>
            
            <div className="card shadow-1 border-1 border-round-2xl overflow-hidden bg-white" style={{ borderColor: '#e5e7eb' }}>
                <DataTable value={users} header={header} loading={loading} 
                    paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                    className="p-datatable-sm" responsiveLayout="scroll">
                    <Column field="id" header="ID" sortable style={{ width: '80px' }} className="text-500 font-mono" />
                    <Column field="name" header="NAME" sortable body={userBodyTemplate} />
                    <Column field="email" header="EMAIL ADDRESS" sortable className="text-600" />
                    <Column field="role" header="ROLE" body={() => (
                        <span className="px-2 py-1 border-round text-xs font-bold bg-indigo-50 text-indigo-700 border-1 border-indigo-100 uppercase tracking-widest">
                            SuperAdmin
                        </span>
                    )} />
                    <Column header="ACTIONS" body={(rowData) => (
                        <div className="flex gap-2">
                            <Button icon="pi pi-pencil" rounded outlined severity="info" onClick={() => editUser(rowData)} style={{ width: '32px', height: '32px' }} tooltip="Edit User" />
                            <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteUser(rowData)} style={{ width: '32px', height: '32px' }} tooltip="Delete User" />
                        </div>
                    )} style={{ width: '100px' }} />
                </DataTable>
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

            <Dialog visible={userDialog} style={{ width: '600px' }} header={user.id ? "Edit SuperAdmin" : "Register New SuperAdmin"} modal className="p-fluid" footer={userDialogFooter} onHide={hideDialog}>
                <div className="flex flex-column gap-4">
                    {/* Avatar Upload Section */}
                    <div className="flex flex-column align-items-center gap-3 py-2">
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleImageChange}
                        />
                        <div 
                            className="relative cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Avatar 
                                image={previewImage || undefined} 
                                label={!previewImage ? user.name?.charAt(0).toUpperCase() : undefined}
                                shape="circle" 
                                className="shadow-4 border-2 border-white"
                                style={{ width: '100px', height: '100px', backgroundColor: '#0F172A', color: '#ffffff', fontSize: '2.5rem' }} 
                            />
                            <div className="absolute bottom-0 right-0 w-2rem h-2rem bg-gray-900 text-white border-circle border-2 border-white flex align-items-center justify-content-center shadow-2">
                                <i className="pi pi-camera text-xs"></i>
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-bold text-700 block">Profile Image</span>
                            <span className="text-xs text-500">Click to upload (JPG or PNG, max 10MB)</span>
                            {imageError && <small className="p-error block mt-1">{imageError}</small>}
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="name" className="font-bold text-700">Full Name *</label>
                        <span className="p-input-icon-left">
                            <i className="pi pi-user ml-2" />
                            <InputText id="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} required autoFocus className={`pl-5 ${submitted && !user.name ? 'p-invalid' : ''}`} />
                        </span>
                        {submitted && !user.name && <small className="p-error">Name is required.</small>}
                    </div>

                    <div className="field">
                        <label htmlFor="email" className="font-bold text-700">Email Address *</label>
                        <span className="p-input-icon-left">
                            <i className="pi pi-envelope ml-2" />
                            <InputText id="email" type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} required className={`pl-5 ${submitted && !user.email ? 'p-invalid' : ''}`} />
                        </span>
                        {submitted && !user.email && <small className="p-error">Email is required.</small>}
                    </div>

                    <div className="field">
                        <label htmlFor="password" title={user.id ? "Leave blank to keep current password" : ""} className="font-bold text-700">
                            {user.id ? "New Password (Optional)" : "Security Password *"}
                        </label>
                        <Password 
                            id="password" 
                            value={user.password} 
                            onChange={(e) => setUser({ ...user, password: e.target.value })} 
                            toggleMask 
                            feedback={!user.id}
                            className={submitted && !user.id && !user.password ? 'p-invalid' : ''}
                            inputClassName="w-full"
                            placeholder={user.id ? "Leave empty to keep existing" : "Enter secure password"}
                        />
                        {submitted && !user.id && !user.password && <small className="p-error">Password is required for new users.</small>}
                    </div>

                    {/* Permissions Section */}
                    <div className="field">
                        <label className="font-bold text-700 block mb-2">Access Permissions</label>
                        <div className="flex align-items-center gap-3 mb-3 p-3 border-round-xl bg-blue-50 border-1 border-blue-100">
                            <span className="text-sm font-medium text-700">Full Access (all permissions)</span>
                            <SelectButton
                                value={fullAccess ? 1 : 0}
                                onChange={(e) => setFullAccess(e.value === 1)}
                                options={[{ label: 'Yes', value: 1 }, { label: 'Custom', value: 0 }]}
                                className="p-buttonset-sm ml-auto"
                            />
                        </div>
                        {!fullAccess && permissionList.length > 0 && (
                            <div className="border-1 border-100 border-round-xl p-3 max-h-20rem overflow-y-auto">
                                {Object.entries(
                                    permissionList.reduce((acc: any, p: any) => {
                                        (acc[p.group] = acc[p.group] || []).push(p);
                                        return acc;
                                    }, {})
                                ).map(([group, perms]: any) => (
                                    <div key={group} className="mb-3">
                                        <div className="text-xs font-bold text-500 uppercase tracking-widest mb-2">{group}</div>
                                        <div className="grid">
                                            {perms.map((p: any) => (
                                                <div key={p.key} className="col-6 flex align-items-center gap-2">
                                                    <Checkbox
                                                        inputId={`perm-${p.key}`}
                                                        checked={selectedPermissions.includes(p.key)}
                                                        onChange={(e) => {
                                                            if (e.checked) {
                                                                setSelectedPermissions([...selectedPermissions, p.key]);
                                                            } else {
                                                                setSelectedPermissions(selectedPermissions.filter(k => k !== p.key));
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor={`perm-${p.key}`} className="text-sm text-700 cursor-pointer">{p.label}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!fullAccess && permissionList.length === 0 && (
                            <div className="text-500 text-sm p-3">Loading permissions...</div>
                        )}
                    </div>
                </div>
            </Dialog>

            <Dialog visible={deleteUserDialog} style={{ width: '450px' }} header="Confirm Deletion" modal footer={deleteUserDialogFooter} onHide={hideDeleteDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3 text-red-500" style={{ fontSize: '2rem' }} />
                    {user && (
                        <span>
                            Are you sure you want to delete the SuperAdmin account for <b>{user.name}</b>?
                            <br/><br/>
                            <span className="text-red-500 font-semibold italic">Warning: This action is permanent.</span>
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default UsersPage;
