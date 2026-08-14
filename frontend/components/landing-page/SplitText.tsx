import React from 'react';

export const SplitText = ({ text, className = '' }: { text: string; className?: string }) => {
  return (
    <span className={`inline-block ${className}`}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pr-2 pb-2">
          <span className="word-reveal inline-block">
            {word}
          </span>
        </span>
      ))}
    </span>
  );
};
