/**
 * Calculates Levenshtein distance between two strings
 */
function getLevenshteinDistance(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Intelligent fuzzy search utility
 * Returns { items: sortedItems, topConfidence: number, bestMatch: item, hasExactFullMatch: boolean }
 */
export function intelligentSearch(list, query, keys = ['name'], threshold = 0.4) {
  if (!query || !query.trim()) {
    return { items: list, topConfidence: 0, bestMatch: null, hasExactFullMatch: false };
  }

  const q = query.toLowerCase().trim();
  const qWords = q.split(/\s+/).filter(w => w.length >= 1);
  let hasExactFullMatch = false;

  const scored = list.map(item => {
    let maxScore = 0;

    for (const key of keys) {
      const val = item[key];
      if (!val) continue;
      
      const t = String(val).toLowerCase().trim();
      const tWords = t.split(/\s+/).filter(w => w.length >= 1);

      // Priority 1: Exact Full Match
      if (t === q) {
        maxScore = 2.0; // Boost way above 1.0 to ensure it's first
        hasExactFullMatch = true;
        break;
      }

      // Priority 2: Exact Prefix Match (Netflix style)
      if (t.startsWith(q)) {
        maxScore = Math.max(maxScore, 1.5);
      } else if (t.includes(q)) {
        maxScore = Math.max(maxScore, 1.2);
      }

      // Priority 3: Word-level matching
      let wordMatches = 0;
      qWords.forEach(qw => {
        if (tWords.some(tw => tw.startsWith(qw))) {
          wordMatches += 1.0;
        } else if (tWords.some(tw => tw.includes(qw))) {
          wordMatches += 0.8;
        } else {
          // Fast fuzzy path: only do Levenshtein if there's significant length similarity
          let bestFuzzy = 0;
          tWords.forEach(tw => {
            if (Math.abs(qw.length - tw.length) > 3) return; // Skip if lengths are too different
            const dist = getLevenshteinDistance(qw, tw);
            const s = (Math.max(qw.length, tw.length) - dist) / Math.max(qw.length, tw.length);
            if (s > bestFuzzy) bestFuzzy = s;
          });
          wordMatches += bestFuzzy * 0.5;
        }
      });

      const avgWordScore = qWords.length > 0 ? wordMatches / qWords.length : 0;
      maxScore = Math.max(maxScore, avgWordScore);
    }

    return { item, score: maxScore };
  });

  const filtered = scored
    .filter(s => s.score >= threshold)
    .sort((a, b) => b.score - a.score);

  return {
    items: filtered.map(f => f.item),
    topConfidence: filtered.length > 0 ? filtered[0].score : 0,
    bestMatch: (filtered.length > 0 && filtered[0].score >= 1.0) ? filtered[0].item : null,
    hasExactFullMatch
  };
}
