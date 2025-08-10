import React from 'react';

interface ImagePlaceholderProps {
  filename: string;
  className?: string;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ filename, className = '' }) => {
  return (
    <div className={`image-placeholder ${className}`}>
      <div className="placeholder-content">
        <div className="placeholder-icon">🖼️</div>
        <div className="placeholder-text">
          <strong>Image:</strong> {filename}
        </div>
        <div className="placeholder-note">
          (Image would appear here in full version)
        </div>
      </div>
    </div>
  );
};

export default ImagePlaceholder;