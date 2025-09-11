interface AnalysisResult {
  stability: number
  bindingSites: Array<{
    position: number
    confidence: number
    type: string
  }>
  interactions: Array<{
    type: string
    count: number
    strength: number
  }>
  recommendations: string[]
  timestamp: string
}

export const parseGeminiAnalysis = (text: string): AnalysisResult | null => {
  console.log("Raw Gemini Output:", text)
  // Try to parse as JSON first
  try {
    let jsonStart = text.indexOf('{');
    let jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonText = text.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonText);
      // Validate minimal keys
      if (
        typeof parsed.stability === 'number' &&
        Array.isArray(parsed.bindingSites) &&
        Array.isArray(parsed.interactions) &&
        Array.isArray(parsed.recommendations)
      ) {
        return {
          stability: parsed.stability,
          bindingSites: parsed.bindingSites,
          interactions: parsed.interactions,
          recommendations: parsed.recommendations,
          timestamp: new Date().toISOString(),
        };
      }
    }
  } catch (jsonErr) {
    console.warn('JSON parse failed, fallback to regex:', jsonErr);
  }

  // Fallback to regex parsing
  try {
    const result: Partial<AnalysisResult> = {
      bindingSites: [],
      interactions: [],
      recommendations: [],
    };

    const stabilityMatch = text.match(/stability.*?(\d+\.?\d*)/i);
    if (stabilityMatch) {
      result.stability = parseFloat(stabilityMatch[1]);
    } else {
      console.log("No stability match found");
    }

    const bindingSitesSection = text.match(/binding sites([\s\S]*?)(interactions|recommendations)/i);
    if (bindingSitesSection) {
      const bindingSitesText = bindingSitesSection[1];
      const siteMatches = [...bindingSitesText.matchAll(/position:\s*(\d+).*confidence:\s*(\d+\.?\d*).*type:\s*(\w+)/gi)];
      siteMatches.forEach(match => {
        result.bindingSites?.push({
          position: parseInt(match[1]),
          confidence: parseFloat(match[2]),
          type: match[3],
        });
      });
    } else {
      console.log("No binding sites section found");
    }

    const interactionsSection = text.match(/interactions([\s\S]*?)(recommendations)/i);
    if (interactionsSection) {
      const interactionsText = interactionsSection[1];
      const interactionMatches = [...interactionsText.matchAll(/type:\s*(\w+).*count:\s*(\d+).*strength:\s*(\d+\.?\d*)/gi)];
      interactionMatches.forEach(match => {
        result.interactions?.push({
          type: match[1],
          count: parseInt(match[2]),
          strength: parseFloat(match[3]),
        });
      });
    } else {
      console.log("No interactions section found");
    }

    const recommendationsSection = text.match(/recommendations([\s\S]*)/i);
    if (recommendationsSection) {
      const recommendationsText = recommendationsSection[1];
      result.recommendations = recommendationsText.split(/[\n-]/).map(rec => rec.trim()).filter(rec => rec.length > 0);
    } else {
      console.log("No recommendations section found");
    }

    result.timestamp = new Date().toISOString();

    if (
      typeof result.stability === 'number' &&
      Array.isArray(result.bindingSites) &&
      Array.isArray(result.interactions) &&
      Array.isArray(result.recommendations)
    ) {
      return result as AnalysisResult;
    }

    console.log("Parsed result is incomplete:", result);
    return null;
  } catch (error) {
    console.error("Failed to parse Gemini analysis:", error);
    return null;
  }
}
