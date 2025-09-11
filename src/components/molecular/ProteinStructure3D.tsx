

// Deklarasi global untuk window.$3Dmol
declare global {
  interface Window {
    $3Dmol: any;
  }
}

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

type ProteinStructure3DProps = {
  pdbData?: string;
  pdbId?: string;
  style?: string;
  autoRotate?: boolean;
};

const ProteinStructure3D = forwardRef<any, ProteinStructure3DProps>(({ pdbData, pdbId, style = 'ribbon+stick', autoRotate = false }, ref) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    setSpin: (spin: boolean) => {
      if (viewerInstance.current) {
        if (typeof viewerInstance.current.setSpin === 'function') {
          viewerInstance.current.setSpin(spin);
        } else if (typeof viewerInstance.current.spin === 'function') {
          viewerInstance.current.spin(spin ? 'y' : false);
        }
      }
    },
    zoomTo: () => {
      if (viewerInstance.current && typeof viewerInstance.current.zoomTo === 'function') {
        viewerInstance.current.zoomTo();
        if (typeof viewerInstance.current.render === 'function') {
          viewerInstance.current.render();
        }
      }
    }
  }), []);

  useEffect(() => {
    if (!window.$3Dmol) {
      if (viewerRef.current) {
        viewerRef.current.innerHTML = '<div style="color:red;padding:16px">3Dmol.js library not loaded. Please check CDN in index.html.</div>';
      }
      return;
    }
    if (viewerRef.current) {
      viewerRef.current.innerHTML = '';
      const config = { backgroundColor: 'black' };
      const viewer = window.$3Dmol.createViewer(viewerRef.current, config);
      viewerInstance.current = viewer;
      if (pdbData && pdbData.trim().length > 0) {
        viewer.addModel(pdbData, 'pdb');
        // Mapping style prop ke setStyle 3Dmol.js
        let styleObj: any = {};
        switch (style) {
          case 'ribbon+stick':
            styleObj = { ribbon: { color: 'spectrum' }, stick: {}, sphere: { scale: 0.3 } };
            break;
          case 'sphere':
            styleObj = { sphere: { scale: 0.3 } };
            break;
          case 'stick':
            styleObj = { stick: {} };
            break;
          case 'sphere+stick':
            styleObj = { sphere: { scale: 0.3 }, stick: {} };
            break;
          case 'surface':
            styleObj = { surface: { opacity: 0.85, color: 'white' } };
            break;
          default:
            styleObj = { ribbon: { color: 'spectrum' }, stick: {}, sphere: { scale: 0.3 } };
        }
        viewer.setStyle({}, styleObj);
        viewer.zoomTo();
        if (typeof viewer.setSpin === 'function') {
          viewer.setSpin(autoRotate);
        } else if (typeof viewer.spin === 'function') {
          viewer.spin(autoRotate ? 'y' : false);
        }
        viewer.render();
      } else {
        viewerRef.current.innerHTML = '<div style="color:orange;padding:16px">No valid PDB data loaded.</div>';
      }
    }
  }, [pdbData, pdbId, style, autoRotate]);

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative', background: 'black', borderRadius: '12px' }}>
      <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: 10, left: 10, color: '#fff', fontSize: 16, textShadow: '0 0 4px #000' }}>
        {pdbId ? `PDB: ${pdbId}` : 'Protein Structure'}
      </div>
    </div>
  );
});

export default ProteinStructure3D;

