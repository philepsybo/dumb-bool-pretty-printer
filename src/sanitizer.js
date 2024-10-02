import { logError } from 'logger';

export function checkSanity(tokens) {
    let isSane = true;
    const parentheses = tokens.filter((token) => token.type === 'openParenthesis' || token.type === 'closeParenthesis');
    const openParenthesesCount = parentheses.filter((token) => token.type === 'openParenthesis').length;
    const closeParenthesesCount = parentheses.filter((token) => token.type === 'closeParenthesis').length;

    const brackets = tokens.filter((token) => token.type === 'openBracket' || token.type === 'closeBracket');
    const openBracketCount = brackets.filter((token) => token.type === 'openBracket').length;
    const closeBracketCount = brackets.filter((token) => token.type === 'closeBracket').length;

    const curlyBraces = tokens.filter((token) => token.type === 'openCurlyBrace' || token.type === 'closeCurlyBrace');
    const openCurlyBraceCount = curlyBraces.filter((token) => token.type === 'openCurlyBrace').length;
    const closeCurlyBracesCount = curlyBraces.filter((token) => token.type === 'closeCurlyBrace').length;

    const conditionalIfCount = tokens.filter((token) => token.type === 'conditionalIf').length;
    const conditionalThenCount = tokens.filter((token) => token.type === 'conditionalThen').length;

    if (openParenthesesCount !== closeParenthesesCount) {
        logError('Mismatched parentheses ()');
        if (openParenthesesCount > closeParenthesesCount) {
            logError(`Missing ${openParenthesesCount - closeParenthesesCount} closing parenthesis(es)`);
        }
        if (closeParenthesesCount > openParenthesesCount) {
            logError(`Extra ${closeParenthesesCount - openParenthesesCount} closing parenthesis(es)`);
        }
        isSane = false;
    }

    if (openBracketCount !== closeBracketCount) {
        logError('Mismatched brackets []');
        if (openBracketCount > closeBracketCount) {
            logError(`Missing ${openBracketCount - closeBracketCount} closing bracket(s)`);
        }
        if (closeBracketCount > openBracketCount) {
            logError(`Extra ${closeBracketCount - openBracketCount} closing bracket(s)`);
        }
        isSane = false;
    }

    if (openCurlyBraceCount !== closeCurlyBracesCount) {
        logError('Mismatched curly braces {}');
        if (openCurlyBraceCount > closeCurlyBracesCount) {
            logError(`Missing ${openCurlyBraceCount - closeCurlyBracesCount} closing curly brace(s)`);
        }
        if (closeCurlyBracesCount > openCurlyBraceCount) {
            logError(`Extra ${closeCurlyBracesCount - openCurlyBraceCount} closing curly brace(s)`);
        }
        isSane = false;
    }

    if (conditionalIfCount !== conditionalThenCount) {
        logError('Mismatched conditional statements (if/then)');
        if (conditionalIfCount > conditionalThenCount) {
            logError(`Missing ${conditionalIfCount - conditionalThenCount} 'then' statement(s)`);
        }
        if (conditionalThenCount > conditionalIfCount) {
            logError(`Extra ${conditionalThenCount - conditionalIfCount} 'then' statement(s)`);
        }
        isSane = false;
    }

    let stack = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'openCurlyBrace') {
            stack.push(token);
        } else if (token.type === 'closeCurlyBrace') {
            const lastOpen = stack.pop();
            if (!lastOpen) {
                logError('Extra closing curly brace found');
                isSane = false;
            }
        } else if (stack.length > 0 && token.type !== 'literal') {
            logError(`Only literals are allowed between curly braces, found: ${token.type}`);
            logError(`...${tokens.slice(i - 2, i + 3).map((t) => t.value).join(' ')}...`);
            isSane = false;
        }
    }

    stack = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'openBracket') {
            stack.push(token);
        } else if (token.type === 'closeBracket') {
            const lastOpen = stack.pop();
            if (!lastOpen) {
                logError('Extra closing bracket found');
                isSane = false;
            }
        } else if (stack.length > 0 && token.type !== 'literal') {
            logError(`Only literals are allowed between brackets, found: ${token.type}`);
            logError(`...${tokens.slice(i - 2, i + 3).map((t) => t.value).join(' ')}...`);
            isSane = false;
        }
    }

    return isSane;
}
