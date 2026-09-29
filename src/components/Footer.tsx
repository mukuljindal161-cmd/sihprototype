import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-bar" role="contentinfo">
      <div className="footer-inner">
        <div>
          <strong>ColorTrace</strong> — Standardised Colour Analysis. Traceable Field Records.
        </div>
        <div>
          <em>Presumptive field screening prototype. Results are preliminary indicators and do not replace confirmatory laboratory testing.</em>
        </div>
      </div>
    </footer>
  );
};
