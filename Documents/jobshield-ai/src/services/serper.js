import axios from 'axios';

const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY;
const SERPER_API_URL = 'https://google.serper.dev/search';

if (!SERPER_API_KEY) {
  console.error('VITE_SERPER_API_KEY is not set in environment variables');
}

// Search for company information
export const searchCompanyInfo = async (companyName, jobTitle) => {
  try {
    // Perform three parallel searches
    const searches = [
      // Search 1: Company employees, layoffs, hiring
      searchSerper(`${companyName} employees layoffs hiring 2025 2026`),
      
      // Search 2: Company funding and investors
      searchSerper(`${companyName} funding round investors news`),
      
      // Search 3: Job posting history
      searchSerper(`${companyName} ${jobTitle} job posting history`)
    ];

    const results = await Promise.all(searches);
    
    return {
      employeeInfo: results[0],
      fundingInfo: results[1],
      postingHistory: results[2],
      summary: compileSummary(results)
    };
  } catch (error) {
    console.error('Serper API Error:', error);
    // Return empty results instead of throwing to allow analysis to continue
    return {
      employeeInfo: { organic: [] },
      fundingInfo: { organic: [] },
      postingHistory: { organic: [] },
      summary: 'Unable to retrieve web search results. Analysis will be based on listing content only.'
    };
  }
};

// Helper function to call Serper API
const searchSerper = async (query) => {
  try {
    const response = await axios.post(
      SERPER_API_URL,
      {
        q: query,
        num: 10 // Get top 10 results
      },
      {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Serper search error:', error.response?.data || error.message);
    return { organic: [] };
  }
};

// Compile search results into a summary
const compileSummary = (results) => {
  const [employeeInfo, fundingInfo, postingHistory] = results;
  
  const summary = [];
  
  // Extract key information from employee/layoff search
  if (employeeInfo.organic && employeeInfo.organic.length > 0) {
    const employeeSnippets = employeeInfo.organic
      .slice(0, 3)
      .map(r => `${r.title}: ${r.snippet}`)
      .join('\n');
    summary.push(`Employee/Layoff Information:\n${employeeSnippets}`);
  }
  
  // Extract funding information
  if (fundingInfo.organic && fundingInfo.organic.length > 0) {
    const fundingSnippets = fundingInfo.organic
      .slice(0, 3)
      .map(r => `${r.title}: ${r.snippet}`)
      .join('\n');
    summary.push(`Funding Information:\n${fundingSnippets}`);
  }
  
  // Extract posting history
  if (postingHistory.organic && postingHistory.organic.length > 0) {
    const postingSnippets = postingHistory.organic
      .slice(0, 3)
      .map(r => `${r.title}: ${r.snippet}`)
      .join('\n');
    summary.push(`Job Posting History:\n${postingSnippets}`);
  }
  
  return summary.join('\n\n---\n\n');
};

// Search for recruiter legitimacy
export const searchRecruiterInfo = async (recruiterName, email, company) => {
  try {
    const searches = [
      searchSerper(`${recruiterName} ${company} LinkedIn recruiter`),
      searchSerper(`${email} ${company} contact verification`)
    ];

    const results = await Promise.all(searches);
    
    return {
      linkedInResults: results[0],
      emailVerification: results[1],
      summary: compileSummary(results)
    };
  } catch (error) {
    console.error('Recruiter search error:', error);
    return {
      linkedInResults: { organic: [] },
      emailVerification: { organic: [] },
      summary: 'Unable to verify recruiter information.'
    };
  }
};

// Search for salary market data
export const searchSalaryData = async (jobTitle, location) => {
  try {
    const query = `${jobTitle} salary ${location} 2025 2026 market rate`;
    const results = await searchSerper(query);
    
    return {
      results,
      summary: results.organic && results.organic.length > 0
        ? results.organic.slice(0, 5).map(r => `${r.title}: ${r.snippet}`).join('\n')
        : 'No salary data found.'
    };
  } catch (error) {
    console.error('Salary search error:', error);
    return {
      results: { organic: [] },
      summary: 'Unable to retrieve salary data.'
    };
  }
};

// Search for company reviews and reputation
export const searchCompanyReputation = async (companyName) => {
  try {
    const searches = [
      searchSerper(`${companyName} reviews Glassdoor Indeed`),
      searchSerper(`${companyName} scam fraud complaints`)
    ];

    const results = await Promise.all(searches);
    
    return {
      reviews: results[0],
      complaints: results[1],
      summary: compileSummary(results)
    };
  } catch (error) {
    console.error('Reputation search error:', error);
    return {
      reviews: { organic: [] },
      complaints: { organic: [] },
      summary: 'Unable to retrieve company reputation data.'
    };
  }
};

// Extract company name from job listing text
export const extractCompanyName = (listingText) => {
  // Simple extraction - look for common patterns
  const patterns = [
    /company[:\s]+([A-Z][A-Za-z\s&]+)/i,
    /at\s+([A-Z][A-Za-z\s&]+)/,
    /([A-Z][A-Za-z\s&]+)\s+is\s+hiring/i,
    /join\s+([A-Z][A-Za-z\s&]+)/i
  ];

  for (const pattern of patterns) {
    const match = listingText.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'Unknown Company';
};

// Extract job title from listing text
export const extractJobTitle = (listingText) => {
  // Look for job title patterns
  const patterns = [
    /position[:\s]+([A-Z][A-Za-z\s]+)/i,
    /role[:\s]+([A-Z][A-Za-z\s]+)/i,
    /hiring[:\s]+([A-Z][A-Za-z\s]+)/i,
    /^([A-Z][A-Za-z\s]+)\s*[-–—]\s*/m
  ];

  for (const pattern of patterns) {
    const match = listingText.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'Unknown Position';
};

// Made with Bob
