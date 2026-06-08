import { useState, useRef } from 'react';
import ReactCrop, { type PixelCrop, type PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface ImageCropperProps {
  imageSrc: string;
  open: boolean;
  onCancel: () => void;
  onConfirm: (croppedBlob: Blob) => void;
  onSkip?: () => void;
  aspect?: number;
}

export default function ImageCropper({ imageSrc, open, onCancel, onConfirm, onSkip, aspect = 1 }: ImageCropperProps) {
  const [crop, setCrop] = useState<PixelCrop>();
  const [loading, setLoading] = useState(false);
  const [cropSize, setCropSize] = useState<string>('');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const completedCropRef = useRef<PercentCrop | null>(null);

  const handleConfirm = async () => {
    const img = imgRef.current;
    const percentCrop = completedCropRef.current;
    if (!img || !percentCrop || percentCrop.width === 0 || percentCrop.height === 0) return;

    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      const scaleX = img.naturalWidth / 100;
      const scaleY = img.naturalHeight / 100;

      canvas.width = Math.round(percentCrop.width * scaleX);
      canvas.height = Math.round(percentCrop.height * scaleY);

      ctx.drawImage(
        img,
        Math.round(percentCrop.x * scaleX),
        Math.round(percentCrop.y * scaleY),
        Math.round(percentCrop.width * scaleX),
        Math.round(percentCrop.height * scaleY),
        0,
        0,
        Math.round(percentCrop.width * scaleX),
        Math.round(percentCrop.height * scaleY)
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => { if (b) resolve(b); else reject(new Error('Canvas empty')); },
          'image/jpeg', 0.9
        );
      });

      onConfirm(blob);
    } catch (e) {
      console.error('Crop failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCrop(undefined);
    completedCropRef.current = null;
    imgRef.current = null;
    onCancel();
  };

  return (
    <Dialog
      header="Crop Image"
      visible={open}
      onHide={handleCancel}
      style={{ width: '520px' }}
      modal
      draggable={false}
      closable={!loading}
      pt={{ content: { style: { padding: 0, overflow: 'hidden' } } }}
    >
      <div style={{ background: '#1a1a2e', display: 'flex', justifyContent: 'center' }}>
        <ReactCrop
          crop={crop}
          onChange={(c) => { setCrop(c); setCropSize(`${Math.round(c.width)} × ${Math.round(c.height)}`); }}
          onComplete={(_, p) => { completedCropRef.current = p; }}
          aspect={aspect}
          minWidth={50}
          minHeight={50}
          ruleOfThirds
        >
          <img ref={imgRef} src={imageSrc} style={{ maxHeight: 420 }} />
        </ReactCrop>
      </div>
      <div style={{ textAlign: 'center', padding: '6px 12px', background: '#1a1a2e', color: '#94a3b8', fontSize: '13px', fontWeight: 600, letterSpacing: '0.3px' }}>
        {cropSize || 'Drag to crop'}
      </div>
      <div className="flex justify-content-end gap-2 px-3 pb-3 pt-3">
        {onSkip && <Button label="Use Original" severity="info" outlined onClick={onSkip} disabled={loading} />}
        <Button label="Cancel" severity="secondary" outlined onClick={handleCancel} disabled={loading} />
        <Button label="Save" icon="pi pi-check" onClick={handleConfirm} loading={loading} />
      </div>
    </Dialog>
  );
}
