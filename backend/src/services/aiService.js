const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

// ─── DSA #1: Rabin-Karp String Matching ───────────────────────────────────────
// Verifies that each skill Claude returns actually appears in the resume text.
// Prevents hallucinated skill mentions from reaching the frontend.
const BASE = 31;
const MOD = 1e9 + 7;

function rabinKarpSearch(text, pattern) {
  const t = text.toLowerCase();
  const p = pattern.toLowerCase();
  const n = t.length, m = p.length;
  if (m > n) return false;

  let patHash = 0, winHash = 0, power = 1;

  for (let i = 0; i < m; i++) {
    patHash = (patHash * BASE + p.charCodeAt(i)) % MOD;
    winHash = (winHash * BASE + t.charCodeAt(i)) % MOD;
    if (i > 0) power = (power * BASE) % MOD;
  }

  if (patHash === winHash && t.slice(0, m) === p) return true;

  for (let i = 1; i <= n - m; i++) {
    winHash = (winHash - t.charCodeAt(i - 1) * power % MOD + MOD) % MOD;
    winHash = (winHash * BASE + t.charCodeAt(i + m - 1)) % MOD;
    if (winHash === patHash && t.slice(i, i + m) === p) return true;
  }
  return false;
}

function verifySkillsWithRabinKarp(resumeText, matchedSkills, missingSkills) {
  const verified = { matchedSkills: [], missingSkills: [] };

  for (const skill of matchedSkills) {
    if (rabinKarpSearch(resumeText, skill)) {
      verified.matchedSkills.push(skill);
    } else {
      // Claude said it matched but it's not actually in the resume — move it
      verified.missingSkills.push(skill);
    }
  }

  for (const skill of missingSkills) {
    // If Claude said missing but it IS in resume, promote it
    if (rabinKarpSearch(resumeText, skill)) {
      verified.matchedSkills.push(skill);
    } else {
      verified.missingSkills.push(skill);
    }
  }

  return verified;
}

// ─── Claude API Call ───────────────────────────────────────────────────────────
async function matchResume(resumeText, jobDescription) {
  const prompt = `You are an elite ATS (Applicant Tracking System) and resume scoring engine used by FAANG recruiters. You score resumes the way Resume Worded and Jobscan do — with deep analysis across multiple dimensions, not just keyword matching.

Analyze the resume against the job description and return a JSON object with this EXACT structure:
{
  "score": <integer 0-100>,
  "matchedSkills": [<array of skill strings>],
  "missingSkills": [<array of skill strings>],
  "tips": [<array of exactly 3 tip strings>],
  "breakdown": {
    "keywordMatch": <integer 0-100>,
    "experienceRelevance": <integer 0-100>,
    "achievementQuality": <integer 0-100>,
    "titleAlignment": <integer 0-100>
  }
}

SCORING METHODOLOGY (weighted):
- Keyword Match (25%): Do the exact terms, tools, and technologies from the JD appear in the resume? Partial credit for synonyms (e.g. "Postgres" for "PostgreSQL").
- Experience Relevance (30%): Does the candidate's work experience actually align with the role's responsibilities? A generic backend dev resume against an ML engineer JD should score low here.
- Achievement Quality (25%): Are bullet points quantified with metrics (%, $, time saved, users)? Vague bullets like "worked on backend systems" score very low. "Reduced API latency by 40%" scores very high.
- Title Alignment (20%): Does the candidate's most recent title/seniority match what the JD is looking for? A junior dev applying for a Staff Engineer role loses points here.

OVERALL SCORE = weighted average of above 4 dimensions. Be harsh and realistic — most resumes score 40-70. Only truly tailored resumes hit 80+. A perfect 90+ means the resume was written specifically for this JD.

SKILLS RULES:
- matchedSkills: exact tools/technologies/frameworks from JD found in resume
- missingSkills: important tools/technologies from JD missing from resume — prioritize the most critical ones (max 8)
- Keep skill names short: "React", "Kubernetes", "PyTorch", not sentences

TIPS RULES:
- Exactly 3 tips
- Each tip must be hyper-specific to THIS resume and THIS job — never generic advice
- Bad tip: "Add more metrics to your bullets"
- Good tip: "Your Node.js experience lacks quantification — add response time improvements, requests/sec, or uptime % to stand out for this backend role"
- Tips should address the biggest gaps between this resume and this specific JD
- Prioritize: missing critical skills, weak bullet points, title/seniority mismatch, missing keywords that ATS will filter on

CRITICAL: You MUST return all 4 fields inside "breakdown". Do not skip or omit it.
Return ONLY the raw JSON object. No explanation, no markdown, no backticks.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }]
  });

  const raw = response.content[0].text.trim();
  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch {
    // Strip accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  // DSA #1: Run Rabin-Karp verification on Claude's output
  const verified = verifySkillsWithRabinKarp(
    resumeText,
    parsed.matchedSkills || [],
    parsed.missingSkills || []
  );

  console.log('Claude breakdown:', JSON.stringify(parsed.breakdown))
  return {
    score: parsed.score,
    matchedSkills: verified.matchedSkills,
    missingSkills: verified.missingSkills,
    tips: parsed.tips || [],
    breakdown: parsed.breakdown || null
  };
}

async function categorizeRoles(titles) {
  if (!titles || titles.length === 0) return {};

  const prompt = `You are a job role categorizer. Given a list of job titles, group them into meaningful role categories.

Rules:
- Create concise category names (e.g. "Software Engineer", "Data Engineer", "Chip Design Engineer", "Product Manager")
- Be specific — don't lump unrelated roles together
- Only use "Other" if a title truly doesn't fit anywhere
- Merge similar titles into one category (e.g. "Senior Software Engineer" and "Software Engineer II" → "Software Engineer")
- Return ONLY a raw JSON object where keys are category names and values are counts
- No markdown, no backticks, no explanation

Job titles:
${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }]
  });

  const raw = response.content[0].text.trim().replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
}

module.exports = { matchResume, categorizeRoles };