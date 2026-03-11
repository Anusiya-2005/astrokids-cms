/**
 * ContentScorer - Optimized for the 8-rule weighted system.
 * Weights: 20, 10, 15, 10, 10, 10, 15, 10 = Total 100.
 */

const TRANSITION_WORDS = [
    'however', 'therefore', 'additionally', 'meanwhile', 'because',
    'furthermore', 'nevertheless', 'consequently', 'moreover',
    'first', 'next', 'finally', 'since', 'although', 'nonetheless',
    'similarly', 'otherwise', 'instead'
];

export class ContentScorer {
    constructor(blocks, targetKeyword = '') {
        this.blocks = blocks;
        this.targetKeyword = (targetKeyword || '').toLowerCase().trim();
        this.analysis = this.performAnalysis();
    }

    performAnalysis() {
        let fullText = '';
        let titleText = '';
        let firstParaText = '';
        let paragraphs = [];
        let blockHighlights = {
            hasImage: false,
            hasInternalLink: false,
            hasExternalLink: false,
            hasMetaDescription: false,
            imageDescriptions: []
        };

        this.blocks.forEach(block => {
            let content = '';
            if (block.type === 'meta-description') {
                blockHighlights.hasMetaDescription = true;
            }
            if (block.type === 'image') {
                blockHighlights.hasImage = true;
                if (block.content) blockHighlights.imageDescriptions.push(block.content);
            }

            if (typeof block.content === 'string') {
                content = block.content;
            } else if (Array.isArray(block.items)) {
                content = block.items.join(' ');
            } else if (Array.isArray(block.rows)) {
                content = block.rows.map(row => row.join(' ')).join(' ');
            }

            if (!content) return;

            // Check for links
            const contentLower = content.toLowerCase();
            if (contentLower.includes('<a') || contentLower.includes('href=')) {
                if (contentLower.includes('http://') || contentLower.includes('https://')) {
                    blockHighlights.hasExternalLink = true;
                } else {
                    blockHighlights.hasInternalLink = true;
                }
            }

            const plainText = content.replace(/<[^>]*>/g, ' ');
            fullText += ' ' + plainText;

            if (block.type === 'title') {
                titleText += ' ' + plainText;
            }

            if (block.type === 'para' || !block.type || block.type === 'text') {
                if (!firstParaText && plainText.trim().length > 10) {
                    firstParaText = plainText;
                }
                paragraphs.push(plainText);
            }
        });

        const allWords = fullText.trim().toLowerCase().split(/\s+/).filter(w => w.length > 0);
        const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 0);

        return {
            fullText,
            titleText,
            firstParaText,
            allWords,
            sentences,
            paragraphs,
            blockHighlights,
            totalWordCount: allWords.length,
            totalSentenceCount: sentences.length,
            uniqueWords: new Set(allWords).size
        };
    }

    calculate() {
        const results = {};
        const { targetKeyword, analysis } = this;
        const { totalWordCount, totalSentenceCount, allWords, sentences, paragraphs, blockHighlights } = analysis;

        if (totalWordCount === 0) return { totalScore: 0, rules: {} };

        // 1. KEYWORD USAGE (20 marks)
        // Density = keyword count ÷ total words × 100
        let usagePoints = 0;
        let density = 0;
        if (targetKeyword) {
            const kwCount = allWords.filter(w => w === targetKeyword).length;
            density = (kwCount / totalWordCount) * 100;
            if (density >= 0.5 && density <= 2.5) usagePoints = 20;
            else if ((density > 0 && density < 0.5) || (density > 2.5 && density <= 4.0)) usagePoints = 10;
            else usagePoints = 5;
        }
        results.keywordUsage = { score: usagePoints, label: 'Keyword Usage', value: density.toFixed(1) + '%', max: 20 };

        // 2. KEYWORD POSITION (10 marks)
        // Title (+5) + First Para (+5)
        let posPoints = 0;
        if (targetKeyword) {
            if (analysis.titleText.toLowerCase().includes(targetKeyword)) posPoints += 5;
            if (analysis.firstParaText.toLowerCase().includes(targetKeyword)) posPoints += 5;
        }
        results.keywordPosition = { score: posPoints, label: 'Keyword Position', max: 10, value: 'Title & Para' };

        // 3. PARAGRAPH STRUCTURE (15 marks)
        // Good = 40-120 words.
        let paraPoints = 0;
        const paragraphWordCounts = paragraphs.map(p => p.trim().split(/\s+/).length);
        const goodParas = paragraphWordCounts.filter(c => c >= 40 && c <= 120).length;
        const longParas = paragraphWordCounts.filter(c => c > 120).length;

        if (paragraphs.length === 0) paraPoints = 0;
        else if (goodParas / paragraphs.length >= 0.6) paraPoints = 15;
        else if (longParas / paragraphs.length < 0.3) paraPoints = 8;
        else paraPoints = 3;

        results.paragraphStructure = {
            score: paraPoints,
            label: 'Paragraph Structure',
            value: paragraphs.length > 0 ? `${goodParas}/${paragraphs.length} optimal` : '0 paras',
            max: 15
        };

        // 4. TRANSITION WORDS (10 marks)
        let transPoints = 0;
        const transitionMatchCount = sentences.filter(s =>
            TRANSITION_WORDS.some(tw => s.toLowerCase().includes(tw))
        ).length;
        const transPercent = (transitionMatchCount / (totalSentenceCount || 1)) * 100;

        if (transPercent >= 25) transPoints = 10;
        else if (transPercent >= 10) transPoints = 5;
        else transPoints = 2;
        results.transitionWords = { score: transPoints, label: 'Transition Usage', value: transPercent.toFixed(1) + '%', max: 10 };

        // 5. SENTENCE LENGTH (10 marks)
        let sentPoints = 0;
        const avgSentWords = totalWordCount / (totalSentenceCount || 1);
        if (avgSentWords < 20) sentPoints = 10;
        else if (avgSentWords <= 30) sentPoints = 6;
        else sentPoints = 2;
        results.sentenceLength = { score: sentPoints, label: 'Sentence Length', value: Math.round(avgSentWords) + ' words', max: 10 };

        // 6. ACTIVE VOICE (10 marks)
        const passiveCount = sentences.filter(s => {
            const pattern = /\b(am|is|are|was|were|been|being)\b\s+(\w+ed|seen|known|found|made|done|given|taken|written)/i;
            return pattern.test(s);
        }).length;
        const activePercent = 100 - ((passiveCount / (totalSentenceCount || 1)) * 100);

        let voicePoints = 0;
        if (activePercent >= 80) voicePoints = 10;
        else if (activePercent >= 60) voicePoints = 6;
        else voicePoints = 2;
        results.activeVoice = { score: voicePoints, label: 'Voice (Active)', value: activePercent.toFixed(1) + '%', max: 10 };

        // 7. TOPIC WORD RELEVANCE (15 marks)
        let topicPoints = 0;
        const titleWords = analysis.titleText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const relatedWordHits = titleWords.filter(tw => allWords.filter(w => w === tw).length > 1).length;
        const relevanceRatio = titleWords.length > 0 ? relatedWordHits / titleWords.length : 0;

        if (relevanceRatio >= 0.6) topicPoints = 15;
        else if (relevanceRatio >= 0.3) topicPoints = 8;
        else topicPoints = 3;
        results.topicRelevance = { score: topicPoints, label: 'Topic Relevance', max: 15, value: (relevanceRatio * 100).toFixed(0) + '%' };

        // 8. BASIC SEO ELEMENTS (10 marks)
        let seoPoints = 0;
        let seoCount = 0;
        if (blockHighlights.hasMetaDescription) seoCount++;
        if (blockHighlights.hasInternalLink) seoCount++;
        if (blockHighlights.hasExternalLink) seoCount++;
        if (blockHighlights.hasImage && blockHighlights.imageDescriptions.length > 0) seoCount++;

        if (seoCount >= 4) seoPoints = 10;
        else if (seoCount >= 2) seoPoints = 6;
        else seoPoints = 2;
        results.seoElements = {
            score: seoPoints,
            label: 'SEO Elements',
            value: `${seoCount}/4 found`,
            max: 10
        };

        const totalScore = Object.values(results).reduce((sum, r) => sum + r.score, 0);

        let category = 'RED';
        let categoryLabel = 'Poor content';
        if (totalScore >= 90) { category = 'GREEN'; categoryLabel = 'Excellent content'; }
        else if (totalScore >= 75) { category = 'GREEN'; categoryLabel = 'Good content'; }
        else if (totalScore >= 60) { category = 'ORANGE'; categoryLabel = 'Average content'; }

        return {
            totalScore,
            category,
            categoryLabel,
            rules: results
        };
    }
}
