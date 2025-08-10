import React from 'react';

interface HintRendererProps {
  hint: string;
  className?: string;
}

const HintRenderer: React.FC<HintRendererProps> = ({ hint, className = '' }) => {
  // Function to process mathematical notation in hints
  const processHint = (text: string) => {
    let processed = text;
    
    // Convert HTML subscripts and superscripts to Unicode equivalents
    processed = processed.replace(/<sub>([^<]+)<\/sub>/g, (match, content) => {
      return convertToSubscript(content);
    });
    
    processed = processed.replace(/<sup>([^<]+)<\/sup>/g, (match, content) => {
      return convertToSuperscript(content);
    });
    
    // Handle mathematical symbols with proper spacing
    processed = processed.replace(/\*/g, ' × ');
    processed = processed.replace(/(?<![=\s])=(?![=\s])/g, ' = ');
    processed = processed.replace(/(?<![+\s])\+(?![+\s])/g, ' + ');
    processed = processed.replace(/(?<![–\-\s])–(?![–\-\s])/g, ' – ');
    processed = processed.replace(/(?<![–\-\s])-(?![–\-\s])/g, ' - ');
    
    return processed;
  };
  
  const convertToSubscript = (text: string) => {
    const subscriptMap: { [key: string]: string } = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
      '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
      'n': 'ₙ', 'i': 'ᵢ', 'x': 'ₓ', 'a': 'ₐ', 'e': 'ₑ',
      '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎'
    };
    
    return text.split('').map(char => subscriptMap[char] || char).join('');
  };
  
  const convertToSuperscript = (text: string) => {
    const superscriptMap: { [key: string]: string } = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      'n': 'ⁿ', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾'
    };
    
    return text.split('').map(char => superscriptMap[char] || char).join('');
  };
  
  // Split hint into multiple lines if it contains commas for sequences
  const formatSequenceHint = (hint: string) => {
    // Check if this looks like a sequence pattern hint with mathematical notation
    if (hint.includes('A') && (hint.includes('sub') || hint.includes('₁') || hint.includes('<sub>'))) {
      // Split on commas but be careful with mathematical expressions
      const parts = hint.split(/,(?![^<]*>)/);
      if (parts.length > 1) {
        return (
          <div className="sequence-hint">
            {parts.map((part, index) => (
              <div key={index} className="hint-line">
                <span className="mathematical-expression">
                  {processHint(part.trim())}
                </span>
              </div>
            ))}
          </div>
        );
      }
    }
    
    // Check for other mathematical patterns
    if (hint.includes('=') && (hint.includes('B') || hint.includes('pattern') || hint.includes('sequence'))) {
      return (
        <div className="mathematical-expression">
          {processHint(hint)}
        </div>
      );
    }
    
    return <span>{processHint(hint)}</span>;
  };
  
  return (
    <div className={`hint-renderer ${className}`}>
      {formatSequenceHint(hint)}
    </div>
  );
};

export default HintRenderer;