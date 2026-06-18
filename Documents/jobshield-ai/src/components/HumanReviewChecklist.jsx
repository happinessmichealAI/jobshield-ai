import { useState } from 'react';

function HumanReviewChecklist({ scamScore, ghostScore, roiScore, companyName }) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Determine which checklist to show based on scores
  const getChecklist = () => {
    const lists = [];

    // High Scam Risk Checklist
    if (scamScore > 70) {
      lists.push({
        title: 'High Scam Risk - Verification Steps',
        color: 'danger',
        items: [
          { id: 'scam-1', text: `Search "${companyName} + scam" independently` },
          { id: 'scam-2', text: 'Verify recruiter identity on LinkedIn' },
          { id: 'scam-3', text: 'Confirm company has an official careers page' },
          { id: 'scam-4', text: 'Never send documents before a verified interview' },
          { id: 'scam-5', text: 'Request all communication via official company email' }
        ]
      });
    }

    // High Ghost Risk Checklist
    if (ghostScore > 70) {
      lists.push({
        title: 'High Ghost Job Risk - Verification Steps',
        color: 'warning',
        items: [
          { id: 'ghost-1', text: `Find a real employee of ${companyName} on LinkedIn` },
          { id: 'ghost-2', text: 'Message them to confirm the role is actively hiring' },
          { id: 'ghost-3', text: 'Check how long this listing has been posted' },
          { id: 'ghost-4', text: 'Ask for a named hiring manager before applying' },
          { id: 'ghost-5', text: 'Research if company recently had layoffs' }
        ]
      });
    }

    // Low ROI Checklist
    if (roiScore < 30) {
      lists.push({
        title: 'Low Application ROI - Optimization Steps',
        color: 'warning',
        items: [
          { id: 'roi-1', text: 'Check applicant count before investing time' },
          { id: 'roi-2', text: 'Tailor your application specifically — generic won\'t work' },
          { id: 'roi-3', text: 'Set a response deadline: if no reply in 3 weeks, move on' },
          { id: 'roi-4', text: 'Consider if your skills truly match the requirements' },
          { id: 'roi-5', text: 'Research the company\'s actual hiring patterns' }
        ]
      });
    }

    // General Best Practices (always show)
    lists.push({
      title: 'General Verification Best Practices',
      color: 'primary',
      items: [
        { id: 'general-1', text: 'Verify company website independently (don\'t click links in emails)' },
        { id: 'general-2', text: 'Check company reviews on Glassdoor or similar platforms' },
        { id: 'general-3', text: 'Never pay any fees for job applications or training' },
        { id: 'general-4', text: 'Be cautious of jobs requiring immediate start or urgent decisions' },
        { id: 'general-5', text: 'Trust your instincts — if something feels off, investigate further' }
      ]
    });

    return lists;
  };

  const checklists = getChecklist();
  const totalItems = checklists.reduce((sum, list) => sum + list.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  const colorClasses = {
    danger: 'border-danger bg-danger/5',
    warning: 'border-warning bg-warning/5',
    primary: 'border-primary bg-primary/5'
  };

  return (
    <div className="card border-2 border-primary">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-text-primary mb-2">Before You Decide</h3>
        <p className="text-text-secondary mb-4">
          These are the steps a human should verify regardless of AI assessment
        </p>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Verification Progress</span>
            <span className="text-text-primary font-semibold">{checkedCount} / {totalItems}</span>
          </div>
          <div className="progress-bar h-3">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Checklists */}
      <div className="space-y-6">
        {checklists.map((checklist, idx) => (
          <div key={idx} className={`border-l-4 pl-4 py-2 ${colorClasses[checklist.color]}`}>
            <h4 className="text-lg font-bold text-text-primary mb-3">{checklist.title}</h4>
            <div className="space-y-3">
              {checklist.items.map(item => (
                <label 
                  key={item.id}
                  className="flex items-start space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={checkedItems[item.id] || false}
                    onChange={() => toggleCheck(item.id)}
                    className="mt-1 w-5 h-5 rounded border-2 border-border bg-surface checked:bg-primary checked:border-primary cursor-pointer"
                  />
                  <span className={`text-text-primary group-hover:text-primary transition ${
                    checkedItems[item.id] ? 'line-through opacity-60' : ''
                  }`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Message */}
      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-text-primary font-semibold text-lg mb-2">
          JobShield AI provides decision support, not decisions.
        </p>
        <p className="text-text-secondary">
          Every action belongs to you. Complete these verification steps before proceeding.
        </p>
      </div>

      {/* Completion Message */}
      {progress === 100 && (
        <div className="mt-4 bg-success/10 border border-success rounded-lg p-4 text-center">
          <p className="text-success font-semibold">
            ✓ All verification steps reviewed! You're ready to make an informed decision.
          </p>
        </div>
      )}
    </div>
  );
}

export default HumanReviewChecklist;

// Made with Bob
