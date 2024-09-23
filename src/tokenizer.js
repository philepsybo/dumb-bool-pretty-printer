import { conjunction, disjunction, conditionalIf, conditionalThen } from 'language';

export function tokenize(expression) {
    const regex = /(\s+|[(){}\[\]])/;
    const tokens = expression.split(regex).filter((token) => token.trim() !== '');

    let result = [];
    let currentLiteral = '';
    for (const token of tokens) {
        const type = determineTokenType(token);

        if (type === 'literal') {
            currentLiteral += `${token} `;
        } else {
            if (currentLiteral) {
                result.push({ type: 'literal', value: currentLiteral.trim() });
                currentLiteral = '';
            }
            result.push({ type, value: token });
        }
    }
    if (currentLiteral) {
        result.push({ type: 'literal', value: currentLiteral.trim() });
    }

    //repeat the filtering until no changes are made anymore
    let previousLength = -1;
    while (result.length !== previousLength) {
        previousLength = result.length;
        result = filterOutEmptyParentheses(result);
        result = filterOutParenthesesWithOnlyLiterals(result);
    }

    return result;
}

function filterOutEmptyParentheses(tokens) {
    const filteredTokens = [];

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'openParenthesis' && tokens[i + 1]?.type === 'closeParenthesis') {
            i++;
            continue;
        }

        filteredTokens.push(tokens[i]);
    }

    return filteredTokens;
}

function filterOutParenthesesWithOnlyLiterals(tokens) {
    const filteredTokens = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'openParenthesis' && tokens[i + 1]?.type === 'literal' && tokens[i + 2]?.type === 'closeParenthesis') {
            filteredTokens.push(tokens[i + 1]);
            i += 2;
        } else {
            filteredTokens.push(token);
        }
    }

    return filteredTokens;
}

function determineTokenType(token) {
    if (conjunction.includes(token)) {
        return 'conjunction';
    }
    if (disjunction.includes(token)) {
        return 'disjunction';
    }
    if (conditionalIf.includes(token)) {
        return 'conditionalIf';
    }
    if (conditionalThen.includes(token)) {
        return 'conditionalThen';
    }
    if (token === '(') {
        return 'openParenthesis';
    }
    if (token === ')') {
        return 'closeParenthesis';
    }
    if (token === '[') {
        return 'openBracket';
    }
    if (token === ']') {
        return 'closeBracket';
    }
    if (token === '{') {
        return 'openCurlyBrace';
    }
    if (token === '}') {
        return 'closeCurlyBrace';
    }
    return 'literal';
}
