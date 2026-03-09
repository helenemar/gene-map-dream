import React from 'react';
import { useViewport } from '@xyflow/react';

interface ViewportOverlayProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ViewportOverlay: React.FC<ViewportOverlayProps> = ({ children, className = '', style }) => {
  const { x, y, zoom } = useViewport();
  return (
    <div
      className={`absolute top-0 left-0 pointer-events-none ${className}`}
      style={{
        transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        transformOrigin: '0 0',
        width: 1,
        height: 1,
        overflow: 'visible',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default ViewportOverlay;
