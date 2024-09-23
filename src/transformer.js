export function asContentForHtmlPreElement(tree) {
    const lines = [];

    const walk = (node) => {
        if (node.type === 'group') {
            node.children.forEach(walk);
        } else if (node.type === 'conditional') {
            lines.push({
                indentation: node.subjectiveDepth, value: '<span class="keyword">IF</span>', type: node.type
            });
            walk(node.condition);
            lines.push({
                indentation: node.subjectiveDepth, value: '<span class="keyword">THEN</span>', type: node.type
            });
            walk(node.consequence);
        } else if (node.type === 'conjunction') {
            lines.push({
                indentation: node.subjectiveDepth, value: '<span class="keyword">AND</span>', type: node.type
            });
        } else if (node.type === 'disjunction') {
            lines.push({
                indentation: node.subjectiveDepth, value: '<span class="keyword">OR</span>', type: node.type
            });
        } else if (node.type === 'openCurlyBrace') {
            lines.push({
                indentation: node.subjectiveDepth, value: '<span class="curlyBrace">{</span>', type: node.type
            });
        } else if (node.type === 'closeCurlyBrace') {
            lines.push({
                indentation: node.subjectiveDepth, value: '<span class="curlyBrace">}</span>', type: node.type
            });
        } else if (node.type === 'openBracket') {
            lines.push({
                indentation: node.subjectiveDepth, value: '<span class="bracket">[</span>', type: node.type
            });
        } else if (node.type === 'closeBracket') {
            lines.push({
                indentation: node.subjectiveDepth, value: '<span class="bracket">]</span>', type: node.type
            });
        } else {
            lines.push({
                indentation: node.subjectiveDepth, value: node.value, type: node.type
            });
        }
    };

    walk(tree);

    const linesWithConsolidatedCurlies = [];
    linesWithConsolidatedCurlies[0] = lines[0];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].type === 'openCurlyBrace' || lines[i].type === 'openBracket') {
            linesWithConsolidatedCurlies.pop();
            let value = `${lines[i - 1].value} ${lines[i].value} ${lines[i + 1].value} ${lines[i + 2].value}`
            let jump = 2;
            if (lines[i + 3]?.type === 'literal') {
                value += ` ${lines[i + 3].value}`;
                jump++;
            }
            linesWithConsolidatedCurlies.push({
                indentation: lines[i - 1].indentation,
                value,
                type: 'mixedLiteral'
            });
            i += jump;
        } else {
            linesWithConsolidatedCurlies.push(lines[i]);
        }
    }

    if (linesWithConsolidatedCurlies.length === 0) {
        return '';
    }

    return linesWithConsolidatedCurlies.map((line) => ' '.repeat(line.indentation * 4) + line.value).join('\n');
}
