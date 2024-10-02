import { logError } from 'logger';

export function checkSanity(tokens) {
    const parentheses = tokens.filter((token) => token.type === 'openParenthesis' || token.type === 'closeParenthesis');
    const brackets = tokens.filter((token) => token.type === 'openBracket' || token.type === 'closeBracket');
    const curlyBraces = tokens.filter((token) => token.type === 'openCurlyBrace' || token.type === 'closeCurlyBrace');

    const conditionalTokens = tokens.filter((token) => token.type === 'conditionalIf' || token.type === 'conditionalThen');

    const parenthesesCountMatches = checkParenthesesCountMatches(parentheses);
    let parenthesesOrderingIsOk = true;
    if (parenthesesCountMatches) {
        parenthesesOrderingIsOk = checkParenthesesOrdering(parentheses);
    }

    const bracketCountMatches = checkBracketCountMatches(brackets);
    let bracketOrderingIsOk = true;
    if (bracketCountMatches) {
        bracketOrderingIsOk = checkBracketOrdering(brackets);
    }

    const curlyBraceCountMatches = checkCurlyBraceCountMatches(curlyBraces);
    let curlyBraceOrderingIsOk = true;
    if (curlyBraceCountMatches) {
        curlyBraceOrderingIsOk = checkCurlyBraceOrdering(curlyBraces);
    }

    const conditionalCountMatches = checkConditionalCountMatches(conditionalTokens);
    const onlyLiteralsBetweenCurlyBraces = checkOnlyLiteralsBetweenCurlyBraces(tokens);
    const onlyLiteralsBetweenBrackets = checkOnlyLiteralsBetweenBrackets(tokens);

    return (
        parenthesesCountMatches
        && parenthesesOrderingIsOk
        && bracketCountMatches
        && bracketOrderingIsOk
        && curlyBraceCountMatches
        && curlyBraceOrderingIsOk
        && conditionalCountMatches
        && onlyLiteralsBetweenCurlyBraces
        && onlyLiteralsBetweenBrackets
    );
}

function checkParenthesesCountMatches(parentheses) {
    const openParenthesesCount = parentheses.filter((token) => token.type === 'openParenthesis').length;
    const closeParenthesesCount = parentheses.filter((token) => token.type === 'closeParenthesis').length;

    if (openParenthesesCount !== closeParenthesesCount) {
        logError('Mismatched parentheses ()');
        if (openParenthesesCount > closeParenthesesCount) {
            logError(`Missing ${openParenthesesCount - closeParenthesesCount} closing parenthesis(es)`);
        }
        if (closeParenthesesCount > openParenthesesCount) {
            logError(`Extra ${closeParenthesesCount - openParenthesesCount} closing parenthesis(es)`);
        }
        return false;
    }

    return true;
}

function checkParenthesesOrdering(parentheses) {
    let parenthesesStack = [];
    for (const token of parentheses) {
        if (token.type === 'openParenthesis') {
            parenthesesStack.push(token);
            continue;
        }

        if (token.type === 'closeParenthesis') {
            const lastOpen = parenthesesStack.pop();
            if (!lastOpen) {
                logError('Parenthesis-ordering is incorrect. At least one closing parenthesis is found without a corresponding opening parenthesis.');
                return false;
            }
        }
    }

    return true;
}

function checkBracketCountMatches(brackets) {
    const openBracketCount = brackets.filter((token) => token.type === 'openBracket').length;
    const closeBracketCount = brackets.filter((token) => token.type === 'closeBracket').length;

    if (openBracketCount !== closeBracketCount) {
        logError('Mismatched brackets []');
        if (openBracketCount > closeBracketCount) {
            logError(`Missing ${openBracketCount - closeBracketCount} closing bracket(s)`);
        }
        if (closeBracketCount > openBracketCount) {
            logError(`Extra ${closeBracketCount - openBracketCount} closing bracket(s)`);
        }
        return false;
    }

    return true;
}

function checkBracketOrdering(brackets) {
    let bracketStack = [];
    for (const token of brackets) {
        if (token.type === 'openBracket') {
            bracketStack.push(token);
            continue;
        }

        if (token.type === 'closeBracket') {
            const lastOpen = bracketStack.pop();
            if (!lastOpen) {
                logError('Bracket-ordering is incorrect. At least one closing bracket is found without a corresponding opening bracket.');
                return false;
            }
        }
    }

    return true;
}

function checkCurlyBraceCountMatches(curlyBraces) {
    const openCurlyBraceCount = curlyBraces.filter((token) => token.type === 'openCurlyBrace').length;
    const closeCurlyBracesCount = curlyBraces.filter((token) => token.type === 'closeCurlyBrace').length;

    if (openCurlyBraceCount !== closeCurlyBracesCount) {
        logError('Mismatched curly braces {}');
        if (openCurlyBraceCount > closeCurlyBracesCount) {
            logError(`Missing ${openCurlyBraceCount - closeCurlyBracesCount} closing curly brace(s)`);
        }
        if (closeCurlyBracesCount > openCurlyBraceCount) {
            logError(`Extra ${closeCurlyBracesCount - openCurlyBraceCount} closing curly brace(s)`);
        }
        return false;
    }

    return true;
}

function checkCurlyBraceOrdering(curlyBraces) {
    let curlyBraceStack = [];
    for (const token of curlyBraces) {
        if (token.type === 'openCurlyBrace') {
            curlyBraceStack.push(token);
            continue;
        }

        if (token.type === 'closeCurlyBrace') {
            const lastOpen = curlyBraceStack.pop();
            if (!lastOpen) {
                logError('Curly-brace-ordering is incorrect. At least one closing curly brace is found without a corresponding opening curly brace.');
                return false;
            }
        }
    }

    return true;
}

function checkConditionalCountMatches(tokens) {
    const conditionalIfCount = tokens.filter((token) => token.type === 'conditionalIf').length;
    const conditionalThenCount = tokens.filter((token) => token.type === 'conditionalThen').length;

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

    return true;
}

function checkOnlyLiteralsBetweenCurlyBraces(tokens) {
    let stack = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'openCurlyBrace') {
            stack.push(token);
        } else if (token.type === 'closeCurlyBrace') {
            const lastOpen = stack.pop();
            if (!lastOpen) {
                return false;
            }
        } else if (stack.length > 0 && token.type !== 'literal') {
            logError(`Only literals are allowed between curly braces, found: ${token.type}`);
            logError(`...${tokens.slice(i - 2, i + 3).map((t) => t.value).join(' ')}...`);
            return false;
        }
    }

    return true;
}

function checkOnlyLiteralsBetweenBrackets(tokens) {
    let stack = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'openBracket') {
            stack.push(token);
        } else if (token.type === 'closeBracket') {
            const lastOpen = stack.pop();
            if (!lastOpen) {
                return false;
            }
        } else if (stack.length > 0 && token.type !== 'literal') {
            logError(`Only literals are allowed between brackets, found: ${token.type}`);
            logError(`...${tokens.slice(i - 2, i + 3).map((t) => t.value).join(' ')}...`);
            return false;
        }

        return true;
    }
}
