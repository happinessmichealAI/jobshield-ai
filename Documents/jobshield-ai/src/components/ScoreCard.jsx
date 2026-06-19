import { useState, useEffect } from 'react';

function ScoreCard({ title, score, confidence, type, signals }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score on mount
  useEffect(() => {
    const duration = 800; // 800ms animation
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  // Determine verdict and color based on type and score
  const getVerdictAndColor = () => {
    if (type === 'roi') {
      // For ROI, higher is better
      if (score >= 70) return { verdict: 'HIGH VALUE', color: 'success' };
      if (score >= 40) return { verdict: 'MEDIUM VALUE', color: 'warning' };
      return { verdict: 'LOW VALUE', color: 'danger' };
    } else {
      // For scam and ghost, lower is better
      if (score >= 70) return { verdict: 'HIGH RISK', color: 'danger' };
      if (score >= 40) return { verdict: 'MEDIUM RISK', color: 'warning' };
      return { verdict: 'LOW RISK', color: 'success' };
    }
  };

  const { verdict, color } = getVerdictAndColor();
  
  const colorClasses = {
    success: 'text-success border-success bg-success/10',
    warning: 'text-warning border-warning bg-warning/10',
    danger: 'text-danger border-danger bg-danger/10'
  };

  const badgeColors = {
    success: 'bg-success text-white',
    warning: 'bg-warning text-gray-900',
    danger: 'bg-danger text-white'
  };

  // Convert signals to flag format
  const getSignalFlags = () => {
    if (!signals) return [];
    
    return Object.entries(signals).map(([signal, value]) => {
      const isPresent = value > 0.3; // Threshold for "detected"
      const signalName = signal.replace(/([A-Z])/g, ' $1').trim();
      
      return {
        name: signalName.charAt(0).toUpperCase() + signalName.slice(1),
        detected: isPresent,
        strength: value
      };
    }).sort((a, b) => b.strength - a.strength); // Sort by strength
  };

  const signalFlags = getSignalFlags();

  return (
    <div className={`score-card border-2 ${colorClasses[color]}`}>
      <h3 className="text-lg font-bold text-text-primary mb-4">{title}</h3>
      
      {/* PRIMARY: Verdict Badge */}
      <div className="mb-4">
        <div className={`inline-block px-6 py-3 rounded-lg font-bold text-2xl ${badgeColors[color]}`}>
          {verdict}
        </div>
      </div>

      {/* SECONDARY: Score and Confidence */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-text-primary mb-2 text-center">
          {animatedScore}%
        </div>
        
        {/* Animated Progress Bar */}
        <div className="w-full bg-surface rounded-full h-3 mb-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              color === 'success' ? 'bg-success' :
              color === 'warning' ? 'bg-warning' :
              'bg-danger'
            }`}
            style={{ width: `${animatedScore}%` }}
          />
        </div>
        
        <div className="text-sm text-text-secondary uppercase tracking-wide text-center">
          {confidence || 'LOW'} Confidence
        </div>
      </div>

      {/* SIGNALS: Flag Format (No Percentages) */}
      <div className="border-t border-border pt-4">
        <p className="text-xs text-text-secondary font-semibold uppercase mb-3">Detected Signals:</p>
        <div className="space-y-2">
          {signalFlags.map((signal, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-sm">
              {signal.detected ? (
                <>
                  <span className="text-warning text-lg leading-none">⚠️</span>
                  <span className="text-text-primary">{signal.name} detected</span>
                </>
              ) : (
                <>
                  <span className="text-success text-lg leading-none">✓</span>
                  <span className="text-text-secondary">{signal.name} clear</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ScoreCard;

// Made with Bob
