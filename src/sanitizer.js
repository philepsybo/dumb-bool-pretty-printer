import { logError } from 'logger';

export function checkSanity(tokens) {
    const openParentheses = tokens.filter((token) => token.type === 'openParenthesis').length;
    const closeParentheses = tokens.filter((token) => token.type === 'closeParenthesis').length;

    const openBrackets = tokens.filter((token) => token.type === 'openBracket').length;
    const closeBrackets = tokens.filter((token) => token.type === 'closeBracket').length;

    const openCurlyBraces = tokens.filter((token) => token.type === 'openCurlyBrace').length;
    const closeCurlyBraces = tokens.filter((token) => token.type === 'closeCurlyBrace').length;

    const conditionalIfCount = tokens.filter((token) => token.type === 'conditionalIf').length;
    const conditionalThenCount = tokens.filter((token) => token.type === 'conditionalThen').length;

    if (openParentheses !== closeParentheses) {
        logError('Mismatched parentheses ()');
        if (openParentheses > closeParentheses) {
            logError(`Missing ${openParentheses - closeParentheses} closing parenthesis(es)`);
        }
        if (closeParentheses > openParentheses) {
            logError(`Extra ${closeParentheses - openParentheses} closing parenthesis(es)`);
        }
        return false;
    }

    if (openBrackets !== closeBrackets) {
        logError('Mismatched brackets []');
        if (openBrackets > closeBrackets) {
            logError(`Missing ${openBrackets - closeBrackets} closing bracket(s)`);
        }
        if (closeBrackets > openBrackets) {
            logError(`Extra ${closeBrackets - openBrackets} closing bracket(s)`);
        }
        return false;
    }

    if (openCurlyBraces !== closeCurlyBraces) {
        logError('Mismatched curly braces {}');
        if (openCurlyBraces > closeCurlyBraces) {
            logError(`Missing ${openCurlyBraces - closeCurlyBraces} closing curly brace(s)`);
        }
        if (closeCurlyBraces > openCurlyBraces) {
            logError(`Extra ${closeCurlyBraces - openCurlyBraces} closing curly brace(s)`);
        }
        return false;
    }

    if (conditionalIfCount !== conditionalThenCount) {
        logError('Mismatched conditional statements (if/then)');
        if (conditionalIfCount > conditionalThenCount) {
            logError(`Missing ${conditionalIfCount - conditionalThenCount} 'then' statement(s)`);
        }
        if (conditionalThenCount > conditionalIfCount) {
            logError(`Extra ${conditionalThenCount - conditionalIfCount} 'then' statement(s)`);
        }
        return false;
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
                return false;
            }
        } else if (stack.length > 0 && token.type !== 'literal') {
            logError(`Only literals are allowed between curly braces, found: ${token.type}`);
            logError(`...${tokens.slice(i - 2, i + 3).map((t) => t.value).join(' ')}...`);
            return false;
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
                return false;
            }
        } else if (stack.length > 0 && token.type !== 'literal') {
            logError(`Only literals are allowed between brackets, found: ${token.type}`);
            logError(`...${tokens.slice(i - 2, i + 3).map((t) => t.value).join(' ')}...`);
            return false;
        }
    }

    return true;
}
