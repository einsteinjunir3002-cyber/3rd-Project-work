/* ============================================================
   SMARTLEARN AI — PLAGIARISM DETECTION ENGINE
   Client-side academic integrity analysis module.
   All corpus data is clearly labelled [DEMO CONTENT].
   ============================================================ */

/* ---------- Demo Submission Corpus [DEMO CONTENT] ---------- */
const DEMO_SUBMISSION_CORPUS = [
  {
    id: 'corpus_1',
    title: 'CS101 Assignment 1 — Kofi Mensah (2025)',
    source: 'Internal Repository',
    text: 'A control flow in programming is the order in which the computer executes statements in a script. Code is run in order from the first line in the file to the last line, unless the computer runs across the structures that change the control flow, such as conditionals and loops. Conditional statements check a boolean condition and can run different code depending on whether the condition is true or false. Loops repeat a block of code while a condition is true.'
  },
  {
    id: 'corpus_2',
    title: 'ENG201 Project — Efua Ampah (2025)',
    source: 'Internal Repository',
    text: 'Software engineering is a systematic approach to the development, operation, and maintenance of software. It applies engineering principles to software development in a methodical way. The Agile methodology is a popular approach that promotes iterative development, team collaboration, flexibility, and continuous improvement throughout the project lifecycle. Scrum is a widely used Agile framework that organizes work in sprints of one to four weeks.'
  },
  {
    id: 'corpus_3',
    title: 'BUA202 Report — Class Submission (2025)',
    source: 'Internal Repository',
    text: 'Business administration involves the management and organization of business operations. It encompasses a broad range of activities including planning, organizing, staffing, directing, and controlling. Effective managers must possess strong leadership skills, the ability to communicate clearly, and a thorough understanding of financial management. Strategic planning is a critical component of business administration that helps organizations define their direction and allocate resources effectively.'
  },
  {
    id: 'corpus_4',
    title: 'MATH102 Problem Set — Group B (2025)',
    source: 'Internal Repository',
    text: 'Calculus is a branch of mathematics that deals with the study of rates of change and accumulation of quantities. The two main branches are differential calculus and integral calculus. Differential calculus focuses on the concept of the derivative, which represents the rate of change of a function. Integral calculus focuses on the concept of the integral, which represents the accumulation of quantities over an interval.'
  },
  {
    id: 'corpus_5',
    title: 'Research Paper — Socio-Economic Mobile Money Study',
    source: 'Published Repository',
    text: 'Mobile money services have transformed financial inclusion across West Africa, particularly in Ghana where MTN MoMo and Vodafone Cash serve millions of unbanked citizens. Studies indicate that mobile money adoption correlates strongly with increases in daily trading volumes among market women in Makola, Accra. However, network downtime and agent liquidity constraints remain significant challenges that undermine consistent access.'
  },
  {
    id: 'corpus_6',
    title: 'Web Source [DEMO] — Introduction to OOP',
    source: 'Web Source (Demo)',
    text: 'Object-oriented programming is a programming paradigm based on the concept of objects, which can contain data in the form of fields and code in the form of procedures. A feature of objects is that an object procedure can access and often modify the data fields of the object with which they are associated. In OOP, computer programs are designed by making them out of objects that interact with one another.'
  },
  {
    id: 'corpus_7',
    title: 'Web Source [DEMO] — Algorithm Complexity',
    source: 'Web Source (Demo)',
    text: 'Algorithm complexity analysis is a crucial aspect of computer science that evaluates the efficiency of algorithms. Big O notation is the standard way to express algorithm complexity and describes the upper bound of the time or space required by an algorithm as a function of the input size. Common complexity classes include O(1) for constant time, O(n) for linear time, O(n log n) for linearithmic time, and O(n squared) for quadratic time operations.'
  },
  {
    id: 'corpus_8',
    title: 'UENR Thesis Extract [DEMO] — Renewable Energy',
    source: 'Published Repository',
    text: 'Photovoltaic solar energy systems offer a promising solution to the energy deficit facing rural communities in the Northern Region of Ghana. This study evaluates the technical and economic viability of deploying off-grid solar microgrids in the Bongo District. The analysis demonstrates that a well-designed photovoltaic system can reduce household energy costs by up to 60% compared to kerosene-based lighting while simultaneously improving study hours for school children.'
  }
];

/* ---------- AI-Generated Text Pattern Indicators ---------- */
const AI_PATTERN_INDICATORS = [
  'it is worth noting that', 'it is important to note', 'in conclusion, it can be said',
  'this essay will explore', 'furthermore, it should be emphasized', 'in summary,',
  'delve into', 'it is crucial to understand', 'this report aims to',
  'as an ai language model', 'i am unable to', 'as of my knowledge cutoff',
  'let us explore', 'in the realm of', 'plays a pivotal role',
  'it is imperative that', 'in the context of modern', 'a comprehensive overview',
  'the intricacies of', 'shed light on'
];

/* ---------- Core Text Processing Utilities ---------- */
function tokenizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
}

function getNgrams(tokens, n) {
  const ngrams = new Set();
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.add(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

function computeJaccardSimilarity(text1, text2) {
  const tokens1 = new Set(tokenizeText(text1));
  const tokens2 = new Set(tokenizeText(text2));
  if (!tokens1.size || !tokens2.size) return 0;
  const intersection = new Set([...tokens1].filter(t => tokens2.has(t)));
  const union = new Set([...tokens1, ...tokens2]);
  return Math.round((intersection.size / union.size) * 100);
}

function computeNgramSimilarity(text1, text2, n = 3) {
  const t1 = tokenizeText(text1);
  const t2 = tokenizeText(text2);
  const ng1 = getNgrams(t1, n);
  const ng2 = getNgrams(t2, n);
  if (!ng1.size || !ng2.size) return 0;
  const intersection = [...ng1].filter(g => ng2.has(g));
  return Math.round((intersection.length / Math.max(ng1.size, ng2.size)) * 100);
}

function detectAIGeneratedPatterns(text) {
  const lower = text.toLowerCase();
  const hits = AI_PATTERN_INDICATORS.filter(pattern => lower.includes(pattern));
  const score = Math.min(Math.round((hits.length / AI_PATTERN_INDICATORS.length) * 100 * 3), 95);
  return { score, indicators: hits.slice(0, 5) };
}

function detectMissingCitations(text) {
  const missing = [];
  const corporateRefs = ['Mensah', 'Osei', 'Appiah', 'Serwaa', 'Tetteh', 'Komey'];
  const hasReferenceSection = /references|bibliography|works cited/i.test(text);
  if (!hasReferenceSection && text.length > 400) {
    missing.push('No References/Bibliography section detected');
  }
  corporateRefs.forEach(ref => {
    const refPatt = new RegExp(`\\b${ref}\\b`, 'i');
    const citePatt = new RegExp(`\\(${ref}`, 'i');
    if (refPatt.test(text) && !citePatt.test(text)) {
      missing.push(`Author "${ref}" mentioned but not cited`);
    }
  });
  return missing.slice(0, 4);
}

function findMatchedExcerpts(submittedText, corpusEntry) {
  const subTokens = tokenizeText(submittedText);
  const corTokens = tokenizeText(corpusEntry.text);
  const subWords = submittedText.toLowerCase().split(/\s+/);
  const corWords = corpusEntry.text.toLowerCase().split(/\s+/);

  // Find longest common substring (simplified window approach)
  let bestMatch = '';
  const windowSize = 8;
  for (let i = 0; i <= corWords.length - windowSize; i++) {
    const phrase = corWords.slice(i, i + windowSize).join(' ');
    if (submittedText.toLowerCase().includes(phrase) && phrase.length > bestMatch.length) {
      bestMatch = phrase;
    }
  }
  return bestMatch ? `"...${bestMatch}..."` : null;
}

/* ---------- Main Plagiarism Analysis Function ---------- */
function analyzeTextForPlagiarism(text, documentName) {
  if (!text || text.trim().length < 50) {
    return {
      error: 'Text too short for meaningful analysis. Please submit at least 50 words.',
      valid: false
    };
  }

  const matches = [];
  let highestSimilarity = 0;

  DEMO_SUBMISSION_CORPUS.forEach(entry => {
    const jaccard = computeJaccardSimilarity(text, entry.text);
    const ngram = computeNgramSimilarity(text, entry.text, 3);
    const combinedScore = Math.round((jaccard * 0.4) + (ngram * 0.6));

    if (combinedScore >= 15) {
      const excerpt = findMatchedExcerpts(text, entry);
      matches.push({
        source: entry.title,
        sourceType: entry.source,
        jaccardScore: jaccard,
        ngramScore: ngram,
        combinedSimilarity: combinedScore,
        matchType: combinedScore >= 60 ? 'exact' : combinedScore >= 35 ? 'paraphrase' : 'similar_topic',
        excerpt: excerpt || `Similar content detected in ${entry.title}`
      });
      if (combinedScore > highestSimilarity) highestSimilarity = combinedScore;
    }
  });

  // Sort by combined similarity descending
  matches.sort((a, b) => b.combinedSimilarity - a.combinedSimilarity);

  const aiAnalysis = detectAIGeneratedPatterns(text);
  const missingCitations = detectMissingCitations(text);

  // Overall similarity (weighted average of top matches)
  const topMatches = matches.slice(0, 3);
  const overallSimilarity = topMatches.length
    ? Math.round(topMatches.reduce((acc, m) => acc + m.combinedSimilarity, 0) / topMatches.length * 0.7)
    : 0;

  let recommendation;
  if (overallSimilarity >= 50 || aiAnalysis.score >= 60) {
    recommendation = 'FLAG_CONCERN';
  } else if (overallSimilarity >= 25 || aiAnalysis.score >= 35) {
    recommendation = 'REVIEW_REQUIRED';
  } else {
    recommendation = 'CLEAR';
  }

  return {
    valid: true,
    documentName: documentName || 'Submitted Document',
    analysisDate: new Date().toLocaleDateString('en-GH', { year: 'numeric', month: 'long', day: 'numeric' }),
    wordCount: tokenizeText(text).length,
    overallSimilarity,
    aiGeneratedLikelihood: aiAnalysis.score,
    aiIndicators: aiAnalysis.indicators,
    matches: matches.slice(0, 6),
    missingCitations,
    recommendation,
    overrideAllowed: true,
    demoNote: '[DEMO CONTENT] — This analysis uses demonstration datasets for evaluation purposes. Results are simulated for academic project showcase.'
  };
}

/* ---------- Report Rendering ---------- */
function renderPlagiarismReport(report) {
  if (!report.valid) {
    showToastNotification(report.error);
    return;
  }

  const recColors = {
    CLEAR: { bg: 'rgba(16,185,129,0.1)', border: '#10b981', text: '#10b981', label: '✅ CLEAR — No significant concerns detected' },
    REVIEW_REQUIRED: { bg: 'rgba(245,158,11,0.1)', border: '#f59e0b', text: '#f59e0b', label: '⚠️ REVIEW REQUIRED — Potential similarities found' },
    FLAG_CONCERN: { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', text: '#ef4444', label: '🚨 FLAG CONCERN — High similarity or AI content detected' }
  };
  const rec = recColors[report.recommendation] || recColors.REVIEW_REQUIRED;

  const similarityColor = report.overallSimilarity >= 50 ? '#ef4444' : report.overallSimilarity >= 25 ? '#f59e0b' : '#10b981';
  const aiColor = report.aiGeneratedLikelihood >= 50 ? '#ef4444' : report.aiGeneratedLikelihood >= 25 ? '#f59e0b' : '#10b981';

  const matchesHtml = report.matches.length
    ? report.matches.map(m => `
      <div style="padding:12px; border-radius:10px; background:rgba(0,0,0,0.15); border-left:3px solid ${m.combinedSimilarity >= 50 ? '#ef4444' : m.combinedSimilarity >= 25 ? '#f59e0b' : '#6b7280'}; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:0.82rem; font-weight:700;">${m.source}</span>
          <span class="badge" style="background:${m.combinedSimilarity >= 50 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}; color:${m.combinedSimilarity >= 50 ? '#ef4444' : '#f59e0b'}; font-size:0.7rem;">${m.combinedSimilarity}% match</span>
        </div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:4px;">📁 ${m.sourceType} | Type: <strong>${m.matchType.replace('_', ' ')}</strong></div>
        <div style="font-size:0.75rem; color:var(--text-light); font-style:italic; padding:6px 10px; background:rgba(0,0,0,0.1); border-radius:6px;">${m.excerpt}</div>
      </div>`).join('')
    : '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:20px;">No significant matches found in the corpus.</p>';

  const citationsHtml = report.missingCitations.length
    ? report.missingCitations.map(c => `<div style="font-size:0.78rem; padding:4px 10px; background:rgba(245,158,11,0.1); border-radius:6px; color:#f59e0b;">⚠️ ${c}</div>`).join('')
    : '<div style="font-size:0.78rem; color:#10b981;">✅ No citation issues detected</div>';

  const modal = D.get('plagiarism-report-modal');
  if (!modal) return;

  D.get('plagiarism-report-content').innerHTML = `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 style="font-size:1.2rem; margin-bottom:4px;">📄 ${report.documentName}</h3>
          <p style="font-size:0.75rem; color:var(--text-muted);">Analyzed: ${report.analysisDate} | ${report.wordCount} words processed</p>
        </div>
        <div style="padding:10px 16px; border-radius:10px; background:${rec.bg}; border:1px solid ${rec.border}; color:${rec.text}; font-size:0.8rem; font-weight:700;">${rec.label}</div>
      </div>

      <!-- Score Meters -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        <div class="glass" style="padding:16px; border-radius:12px; text-align:center;">
          <div style="font-size:2.5rem; font-weight:900; color:${similarityColor};">${report.overallSimilarity}%</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Overall Similarity</div>
          <div style="height:6px; background:rgba(0,0,0,0.2); border-radius:3px; margin-top:10px; overflow:hidden;">
            <div style="height:100%; width:${report.overallSimilarity}%; background:${similarityColor}; border-radius:3px; transition:width 1s ease;"></div>
          </div>
        </div>
        <div class="glass" style="padding:16px; border-radius:12px; text-align:center;">
          <div style="font-size:2.5rem; font-weight:900; color:${aiColor};">${report.aiGeneratedLikelihood}%</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">AI-Generated Likelihood</div>
          <div style="height:6px; background:rgba(0,0,0,0.2); border-radius:3px; margin-top:10px; overflow:hidden;">
            <div style="height:100%; width:${report.aiGeneratedLikelihood}%; background:${aiColor}; border-radius:3px; transition:width 1s ease;"></div>
          </div>
        </div>
      </div>

      <!-- Matched Sources -->
      <div>
        <h4 style="font-size:0.95rem; margin-bottom:12px;">🔍 Matched Sources (${report.matches.length} found)</h4>
        ${matchesHtml}
      </div>

      <!-- Citation Issues -->
      <div>
        <h4 style="font-size:0.95rem; margin-bottom:8px;">📚 Citation Analysis</h4>
        <div style="display:flex; flex-direction:column; gap:6px;">${citationsHtml}</div>
      </div>

      ${report.aiIndicators.length ? `
      <div>
        <h4 style="font-size:0.95rem; margin-bottom:8px;">🤖 AI Pattern Indicators</h4>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${report.aiIndicators.map(i => `<span class="badge" style="background:rgba(139,92,246,0.15); color:#a78bfa; font-size:0.7rem;">"${i}"</span>`).join('')}
        </div>
      </div>` : ''}

      <!-- Demo Notice -->
      <div style="padding:10px 14px; border-radius:8px; background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.2); font-size:0.7rem; color:var(--text-muted);">
        ℹ️ ${report.demoNote}
      </div>

      <!-- Actions -->
      <div style="display:flex; gap:10px; flex-wrap:wrap; padding-top:8px; border-top:1px solid var(--border);">
        <button class="btn btn-secondary btn-sm" onclick="downloadPlagiarismReport()" style="flex:1;">⬇️ Download Report</button>
        <button class="btn btn-primary btn-sm" onclick="overridePlagiarismFlag()" style="flex:1;">✅ Override / Clear</button>
        <button class="btn btn-sm" style="flex:1; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3);" onclick="flagMisconductPlagiarism()">🚨 Flag Misconduct</button>
      </div>
    </div>
  `;

  // Store report globally for download
  window._lastPlagiarismReport = report;
  modal.style.display = 'flex';
}

function closePlagiarismModal() {
  const modal = D.get('plagiarism-report-modal');
  if (modal) modal.style.display = 'none';
}

function downloadPlagiarismReport() {
  const r = window._lastPlagiarismReport;
  if (!r) return;
  const text = [
    `SMARTLEARN AI — PLAGIARISM ANALYSIS REPORT`,
    `${'='.repeat(50)}`,
    `Document: ${r.documentName}`,
    `Analysis Date: ${r.analysisDate}`,
    `Word Count: ${r.wordCount}`,
    ``,
    `RESULTS SUMMARY`,
    `-`.repeat(30),
    `Overall Similarity: ${r.overallSimilarity}%`,
    `AI-Generated Likelihood: ${r.aiGeneratedLikelihood}%`,
    `Recommendation: ${r.recommendation}`,
    ``,
    `MATCHED SOURCES`,
    `-`.repeat(30),
    ...r.matches.map(m => `• ${m.source} (${m.combinedSimilarity}% — ${m.matchType})\n  ${m.excerpt}`),
    ``,
    `CITATION ISSUES`,
    `-`.repeat(30),
    ...r.missingCitations.map(c => `• ${c}`),
    ``,
    r.demoNote
  ].join('\n');

  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `plagiarism_report_${r.documentName.replace(/\s+/g,'_')}.txt`;
  link.click();
  showToastNotification('Report downloaded successfully!');
}

function overridePlagiarismFlag() {
  showToastNotification('Override recorded. Document marked as cleared by lecturer.');
  closePlagiarismModal();
}

function flagMisconductPlagiarism() {
  showToastNotification('Academic misconduct flagged. Administrator has been notified.');
  closePlagiarismModal();
}

/* ---------- Quick Scan (for assignment submissions) ---------- */
function quickScanSubmission(text, docName) {
  const report = analyzeTextForPlagiarism(text, docName);
  if (report.valid) {
    renderPlagiarismReport(report);
    // Store in demo logs
    if (!appState.plagiarismReports) appState.plagiarismReports = [];
    appState.plagiarismReports.unshift(report);
  }
}

/* ---------- Render Plagiarism Reports Table (Lecturer/Admin) ---------- */
function renderPlagiarismReportsTable(containerId) {
  const container = D.get(containerId);
  if (!container) return;
  const reports = appState.plagiarismReports || appState.demoPlagiarismReports || [];

  if (!reports.length) {
    container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">No plagiarism reports yet. Reports are generated automatically when students submit assignments.</div>';
    return;
  }

  container.innerHTML = reports.map((r, idx) => {
    const recColor = r.recommendation === 'CLEAR' ? '#10b981' : r.recommendation === 'FLAG_CONCERN' ? '#ef4444' : '#f59e0b';
    const recBg = r.recommendation === 'CLEAR' ? 'rgba(16,185,129,0.1)' : r.recommendation === 'FLAG_CONCERN' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)';
    return `
      <div class="glass" style="padding:16px; border-radius:12px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="flex:1; min-width:200px;">
          <h4 style="font-size:0.9rem; margin-bottom:4px;">📄 ${r.documentName}</h4>
          <p style="font-size:0.75rem; color:var(--text-muted);">${r.analysisDate} · ${r.wordCount || '?'} words · ${r.matches ? r.matches.length : 0} matches</p>
        </div>
        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          <div style="text-align:center;">
            <div style="font-size:1.2rem; font-weight:800; color:${recColor};">${r.overallSimilarity}%</div>
            <div style="font-size:0.65rem; color:var(--text-muted);">Similarity</div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:1.2rem; font-weight:800; color:#a78bfa;">${r.aiGeneratedLikelihood || 0}%</div>
            <div style="font-size:0.65rem; color:var(--text-muted);">AI Likelihood</div>
          </div>
          <span style="padding:4px 10px; border-radius:8px; background:${recBg}; color:${recColor}; font-size:0.7rem; font-weight:700;">${r.recommendation.replace(/_/g,' ')}</span>
          <button class="btn btn-secondary btn-sm" onclick="window._lastPlagiarismReport = appState.plagiarismReports[${idx}] || appState.demoPlagiarismReports[${idx}]; renderPlagiarismReport(window._lastPlagiarismReport);" style="font-size:0.72rem;">View Full Report</button>
        </div>
      </div>`;
  }).join('');
}
