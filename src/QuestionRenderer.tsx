import React from 'react';

interface QuestionRendererProps {
  content: string;
  className?: string;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ content, className = '' }) => {
  // Safety check for undefined/null content
  if (!content) {
    return <span className={className}>No content available</span>;
  }
  
  // For debugging - let's render the content as-is first
  if (typeof content !== 'string') {
    return <span className={className}>Invalid content type: {typeof content}</span>;
  }
  
  // Simple text rendering first (no images for now)
  if (!content.includes('![](')) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: content }} />;
  }
  
  // If it has images, render as div with image handling
  const imageRegex = /!\[\]\(([^)]+)\)/g;
  const parts = content.split(imageRegex);
  const elements: React.ReactNode[] = [];
  
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Regular text
      if (parts[i]) {
        elements.push(
          <span key={i} dangerouslySetInnerHTML={{ __html: parts[i] }} />
        );
      }
    } else {
      // Image path - simplified for now
      const imagePath = parts[i];
      let correctedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      if (!correctedPath.startsWith('/data/')) {
        correctedPath = `/data/${imagePath}`;
      }
      
      elements.push(
        <div key={i} className="image-container">
          <img
            src={correctedPath}
            alt="Question image"
            className="question-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const container = target.parentElement;
              if (container && !container.querySelector('.image-fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'image-fallback';
                fallback.textContent = `[Image: ${imagePath.split('/').pop()} not found]`;
                container.appendChild(fallback);
              }
            }}
          />
        </div>
      );
    }
  }
  
  return <div className={className}>{elements}</div>;
};

export default QuestionRenderer;