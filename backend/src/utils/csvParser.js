/**
 * Utility to parse CSV text into student records adhering to RFC 4180
 */
export const parseCSV = (csvText) => {
  if (!csvText || typeof csvText !== 'string') return [];

  const lines = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // Skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f !== '')) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f !== '')) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) return [];

  // Parse header row
  const rawHeaders = lines[0];
  const normalizedHeaders = rawHeaders.map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  const headerMap = {};
  normalizedHeaders.forEach((h, idx) => {
    if (h.includes('reg') || h.includes('roll')) {
      headerMap.registerNumber = idx;
    } else if (h.includes('name')) {
      headerMap.name = idx;
    } else if (
      h.includes('git') ||
      h.includes('repo') ||
      h.includes('url') ||
      h.includes('link')
    ) {
      headerMap.githubRepoUrl = idx;
    } else if (h.includes('pass')) {
      headerMap.password = idx;
    }
  });

  // Default positional fallback if headers didn't match keywords
  if (headerMap.registerNumber === undefined && rawHeaders.length >= 1) {
    headerMap.registerNumber = 0;
  }
  if (headerMap.name === undefined && rawHeaders.length >= 2) {
    headerMap.name = 1;
  }
  if (headerMap.githubRepoUrl === undefined && rawHeaders.length >= 3) {
    headerMap.githubRepoUrl = 2;
  }

  const results = [];
  for (let r = 1; r < lines.length; r++) {
    const row = lines[r];
    const regNo = (row[headerMap.registerNumber] || '').trim();
    const name = (row[headerMap.name] || '').trim();
    const github = (row[headerMap.githubRepoUrl] || '').trim();
    const pass =
      headerMap.password !== undefined
        ? (row[headerMap.password] || '').trim()
        : '';

    // Ignore completely empty rows
    if (regNo || name || github) {
      results.push({
        rowNumber: r + 1,
        registerNumber: regNo,
        name,
        githubRepoUrl: github,
        password: pass,
      });
    }
  }

  return results;
};

