import React from 'react';

interface QuestionRendererProps {
  content: string;
  className?: string;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ content, className = '' }) => {
  // Function to render content with images
  const renderContent = (text: string) => {
    // Safety check for undefined text
    if (!text || typeof text !== 'string') {
      return <span>No content</span>;
    }
    
    // Regex to match ![](path) markdown image syntax
    const imageRegex = /!\[\]\(([^)]+)\)/g;
    
    const parts = text.split(imageRegex);
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
        // Image path
        const imagePath = parts[i];
        // Fix image path - ensure it starts with / and handle data/ prefix
        let correctedPath = imagePath;
        if (!correctedPath.startsWith('/')) {
          correctedPath = `/${correctedPath}`;
        }
        // If it doesn't start with /data/, add it
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
                // Try alternative paths if the first one fails
                const target = e.target as HTMLImageElement;
                const originalSrc = target.src;
                
                // Try different path variations
                if (!target.dataset.retried) {
                  target.dataset.retried = 'true';
                  
                  // Try just the original path without modifications
                  if (!originalSrc.endsWith(imagePath)) {
                    target.src = `/${imagePath}`;
                    return;
                  }
                }
                
                if (!target.dataset.retried2) {
                  target.dataset.retried2 = 'true';
                  
                  // Try with public prefix
                  target.src = `/public/data/${imagePath.replace(/^data\//, '')}`;
                  return;
                }
                
                // All attempts failed - replace with placeholder
                target.style.display = 'none';
                const container = target.parentElement;
                if (container && !container.querySelector('.image-fallback')) {
                  // Create a React placeholder component
                  const filename = imagePath.split('/').pop() || 'unknown';
                  const fallback = document.createElement('div');
                  fallback.className = 'image-fallback';
                  fallback.innerHTML = `
                    <div class="image-placeholder">
                      <div class="placeholder-content">
                        <div class="placeholder-icon">🖼️</div>
                        <div class="placeholder-text"><strong>Image:</strong> ${filename}</div>
                        <div class="placeholder-note">(Would show: ${imagePath})</div>
                      </div>
                    </div>
                  `;
                  container.appendChild(fallback);
                }
              }}
            />
          </div>
        );
      }
    }
    
    return elements;
  };

  // Check if content has images to decide wrapper element
  const hasImages = content && content.includes('![](');
  const Wrapper = hasImages ? 'div' : 'span';
  
  return (
    <Wrapper className={className}>
      {renderContent(content)}
    </Wrapper>
  );
};

export default QuestionRenderer;