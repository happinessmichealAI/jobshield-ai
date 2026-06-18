function ScoreCard({ title, score, confidence, type, signals }) {
  // Determine color based on type and score
  const getColor = () => {
    if (type === 'roi') {
      // For ROI, higher is better
      if (score >= 70) return 'success';
      if (score >= 40) return 'warning';
      return 'danger';
    } else {
      // For scam and ghost, lower is better
      if (score >= 70) return 'danger';
      if (score >= 40) return 'warning';
      return 'success';
    }
  };

  const color = getColor();
  const colorClasses = {
    success: 'text-success border-success bg-success/10',
    warning: 'text-warning border-warning bg-warning/10',
    danger: 'text-danger border-danger bg-danger/10'
  };

  const progressColors = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger'
  };

  // Get top 2 contributing signals
  const topSignals = Object.entries(signals || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  return (
    <div className={`score-card border-2 ${colorClasses[color]}`}>
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      
      {/* Score Display */}
      <div className={`text-5xl font-bold mb-2 ${colorClasses[color].split(' ')[0]}`}>
        {score}%
      </div>

      {/* Confidence Badge */}
      <div className="mb-4">
        <span className={`badge-${(confidence || 'LOW').toLowerCase()}`}>
          {confidence || 'LOW'} CONFIDENCE
        </span>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar mb-4">
        <div 
          className={`h-full ${progressColors[color]} transition-all duration-500`}
          style={{ width: `${score}%` }}
        ></div>
      </div>

      {/* Top Contributing Signals */}
      <div className="text-left space-y-2">
        <p className="text-xs text-text-secondary font-semibold uppercase">Top Signals:</p>
        {topSignals.map(([signal, value]) => (
          <div key={signal} className="text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-text-primary capitalize">
                {signal.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-text-secondary font-mono text-xs">
                {(value * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScoreCard;

// Made with Bob
