import { useState } from 'react';

function TrustGraph({ companyName, scamScore, ghostScore, roiScore, analysisData }) {
  const [selectedNode, setSelectedNode] = useState(null);

  // Calculate node states based on scores
  const getNodeColor = (nodeType) => {
    let score = 0;
    
    switch(nodeType) {
      case 'company':
        score = (100 - ghostScore); // Lower ghost score = better company
        break;
      case 'recruiter':
        score = (100 - scamScore); // Lower scam score = better recruiter
        break;
      case 'domain':
        score = (100 - scamScore * 0.7); // Domain tied to scam signals
        break;
      case 'community':
        const communityStats = analysisData.communityStats || {};
        const totalReports = communityStats.total || 0;
        const negativeReports = (communityStats.scam || 0) + (communityStats.ghost || 0);
        score = totalReports > 0 ? ((totalReports - negativeReports) / totalReports) * 100 : 50;
        break;
      case 'industry':
        score = roiScore; // Industry health tied to ROI
        break;
      case 'posting':
        score = (100 - (scamScore + ghostScore) / 2); // Average of risks
        break;
      default:
        score = 50;
    }

    if (score >= 70) return '#10B981'; // green
    if (score >= 40) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const nodes = [
    { id: 'posting', label: 'Job Posting', x: 50, y: 20, type: 'posting' },
    { id: 'recruiter', label: 'Recruiter', x: 20, y: 50, type: 'recruiter' },
    { id: 'company', label: companyName, x: 50, y: 50, type: 'company' },
    { id: 'domain', label: 'Domain', x: 80, y: 50, type: 'domain' },
    { id: 'community', label: 'Community', x: 20, y: 80, type: 'community' },
    { id: 'industry', label: 'Industry', x: 80, y: 80, type: 'industry' }
  ];

  const edges = [
    { from: 'posting', to: 'recruiter' },
    { from: 'posting', to: 'company' },
    { from: 'posting', to: 'domain' },
    { from: 'company', to: 'community' },
    { from: 'company', to: 'industry' },
    { from: 'recruiter', to: 'domain' }
  ];

  const getNodeEvidence = (nodeType) => {
    switch(nodeType) {
      case 'posting':
        return {
          status: scamScore < 40 ? 'Verified' : scamScore < 70 ? 'Uncertain' : 'Risk Detected',
          evidence: analysisData.scamAnalysis?.intentAnalysis || 'Analysis in progress'
        };
      case 'recruiter':
        const emailSignal = analysisData.scamAnalysis?.signals?.emailMismatch || 0;
        return {
          status: emailSignal < 0.4 ? 'Verified' : emailSignal < 0.7 ? 'Uncertain' : 'Suspicious',
          evidence: emailSignal > 0.5 ? 'Email domain mismatch detected' : 'Email appears legitimate'
        };
      case 'company':
        return {
          status: analysisData.ghostAnalysis?.companyExists ? 'Exists' : 'Unknown',
          evidence: analysisData.ghostAnalysis?.ghostSummary || 'Company verification in progress'
        };
      case 'domain':
        const domainSignal = analysisData.scamAnalysis?.signals?.domainAge || 0;
        return {
          status: domainSignal < 0.4 ? 'Established' : domainSignal < 0.7 ? 'Recent' : 'Very New',
          evidence: domainSignal > 0.5 ? 'Domain recently registered' : 'Domain has history'
        };
      case 'community':
        const stats = analysisData.communityStats || {};
        return {
          status: stats.total > 0 ? `${stats.total} Reports` : 'No Reports',
          evidence: stats.total > 0 
            ? `${stats.scam || 0} scam, ${stats.ghost || 0} ghost, ${stats.legitimate || 0} legitimate`
            : 'No community feedback yet'
        };
      case 'industry':
        return {
          status: roiScore > 60 ? 'Healthy' : roiScore > 30 ? 'Moderate' : 'Challenging',
          evidence: analysisData.roiAnalysis?.likelyOutcome || 'Market analysis in progress'
        };
      default:
        return { status: 'Unknown', evidence: 'No data' };
    }
  };

  return (
    <div className="space-y-6">
      {/* SVG Graph */}
      <div className="bg-surface/50 rounded-lg p-8 border border-border">
        <svg viewBox="0 0 100 100" className="w-full h-64 md:h-96">
          {/* Draw edges first */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            return (
              <line
                key={idx}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#1F2937"
                strokeWidth="0.3"
              />
            );
          })}

          {/* Draw nodes */}
          {nodes.map(node => (
            <g
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className="cursor-pointer"
            >
              <circle
                cx={node.x}
                cy={node.y}
                r="4"
                fill={getNodeColor(node.type)}
                stroke="#F9FAFB"
                strokeWidth="0.5"
                className="transition-all hover:r-5"
              />
              <text
                x={node.x}
                y={node.y - 6}
                textAnchor="middle"
                fill="#F9FAFB"
                fontSize="3"
                className="font-semibold"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-text-secondary">Safe</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-text-secondary">Uncertain</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-danger"></div>
            <span className="text-text-secondary">Risk</span>
          </div>
        </div>
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="card bg-primary/5 border-primary">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-xl font-bold text-text-primary">{selectedNode.label}</h4>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-text-secondary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-text-secondary">Status:</span>
              <p className="text-text-primary font-semibold">
                {getNodeEvidence(selectedNode.type).status}
              </p>
            </div>
            <div>
              <span className="text-sm text-text-secondary">Evidence:</span>
              <p className="text-text-primary">
                {getNodeEvidence(selectedNode.type).evidence}
              </p>
            </div>
            <div>
              <span className="text-sm text-text-secondary">Impact on Scores:</span>
              <div className="mt-2 space-y-1 text-sm">
                {selectedNode.type === 'recruiter' && (
                  <p className="text-text-primary">• Directly affects Scam Score</p>
                )}
                {selectedNode.type === 'company' && (
                  <p className="text-text-primary">• Directly affects Ghost Job Score</p>
                )}
                {selectedNode.type === 'community' && (
                  <p className="text-text-primary">• Adjusts all scores based on reports</p>
                )}
                {selectedNode.type === 'industry' && (
                  <p className="text-text-primary">• Influences Application ROI</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupling Explanation */}
      <div className="text-sm text-text-secondary italic">
        <p>
          <strong className="text-text-primary">Trust Graph Coupling:</strong> Node colors are mathematically 
          derived from the weighted scores. Changing a node's state (e.g., community reports) 
          automatically recalculates and updates the displayed scores. This is the reasoning engine made visible.
        </p>
      </div>
    </div>
  );
}

export default TrustGraph;

// Made with Bob
