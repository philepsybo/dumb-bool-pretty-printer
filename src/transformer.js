export function asContentForHtmlPreElement(tree) {
    let lines = getRawLinesWithIndentationWithoutParentheses(tree);
    lines = wrapLineValuesWithHtmlSpans(lines);

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

function getRawLinesWithIndentationWithoutParentheses(tree) {
    const lines = [];

    const walk = (node) => {
        switch (node.type) {
            case 'group':
                node.children.forEach(walk);
                break;
            case 'conditional':
                lines.push({
                    indentation: node.subjectiveDepth, value: 'IF', type: node.type
                });
                walk(node.condition);
                lines.push({
                    indentation: node.subjectiveDepth, value: 'THEN', type: node.type
                });
                walk(node.consequence);
                break;
            case 'conjunction':
                lines.push({
                    indentation: node.subjectiveDepth, value: 'AND', type: node.type
                });
                break;
            case 'disjunction':
                lines.push({
                    indentation: node.subjectiveDepth, value: 'OR', type: node.type
                });
                break;
            case 'openCurlyBrace':
                lines.push({
                    indentation: node.subjectiveDepth, value: '{', type: node.type
                });
                break;
            case 'closeCurlyBrace':
                lines.push({
                    indentation: node.subjectiveDepth, value: '}', type: node.type
                });
                break;
            case 'openBracket':
                lines.push({
                    indentation: node.subjectiveDepth, value: '[', type: node.type
                });
                break;
            case 'closeBracket':
                lines.push({
                    indentation: node.subjectiveDepth, value: ']', type: node.type
                });
                break;
            default:
                lines.push({
                    indentation: node.subjectiveDepth, value: node.value, type: node.type
                });
                break;
        }
    };

    walk(tree);

    return lines;
}

function wrapLineValuesWithHtmlSpans(lines) {
    for(const element of lines) {
        const line = element;
        switch (line.type) {
            case 'conditional':
            case 'conjunction':
            case 'disjunction':
                element.value = `<span class="keyword">${line.value}</span>`;
                break;
            case 'openCurlyBrace':
            case 'closeCurlyBrace':
                element.value = `<span class="curlyBrace">${line.value}</span>`;
                break;
            case 'openBracket':
            case 'closeBracket':
                element.value = `<span class="bracket">${line.value}</span>`;
                break;
            default:
                break;
        }
    }

    return lines;
}
