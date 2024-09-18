const conjunction = [
    'and',
    '&&',
    '∧',
    'AND',
    'und',
    'UND',
];

const disjunction = [
    'or',
    '||',
    '∨',
    'OR',
    'oder',
    'ODER',
];

const conditionalIf = [
    'if',
    'IF',
    'falls',
    'FALLS',
    'wenn',
    'WENN',
];

const conditionalThen = [
    'then',
    'THEN',
    'dann',
    'DANN',
    '=>',
];

function tokenize(expression) {
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
            continue;
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

function checkSanity(tokens) {
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

function buildAbstractSyntaxTree(tokens) {
    const treeWithGroups = {
        type: 'group',
        children: [],
    };

    // first do only resolve things within parentheses into groups
    const stack = [];
    let currentNode = treeWithGroups;

    for (const token of tokens) {
        if (token.type === 'openParenthesis') {
            const newNode = {
                type: 'group',
                children: [],
            };
            currentNode.children.push(newNode);
            stack.push(currentNode);
            currentNode = newNode;
        } else if (token.type === 'closeParenthesis') {
            currentNode = stack.pop();
        } else {
            currentNode.children.push(token);
        }
    }

    const resolveConditionals = (node) => {
        if (node.type === 'group') {
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];

                if (child.type === 'conditionalIf') {
                    const condition = node.children[i + 1];
                    if (node.children[i + 2]?.type !== 'conditionalThen') {
                        logError('Expected conditionalThen after conditionalIf');
                        logError('Error occured near: ' + node.children.slice(i - 1, i + 4).map((t) => t.value).join(' '));
                        throw new Error("Invalid syntax");
                        
                    }
                    const consequence = node.children[i + 3];

                    const conditionalNode = {
                        type: 'conditional',
                        condition: resolveConditionals(condition),
                        consequence: resolveConditionals(consequence),
                    };

                    node.children.splice(i, 4, conditionalNode);
                } else {
                    resolveConditionals(child);
                }
            }
        }

        return node;
    };

    const assignDepth = (node, subjectiveDepth = 0) => {
        node.subjectiveDepth = subjectiveDepth;
        if (node.type === 'group') {
            node.children.forEach((child) => {
                if (child.type === 'group') {
                    assignDepth(child, subjectiveDepth + 1);
                } else {
                    assignDepth(child, subjectiveDepth);
                }
            });
        }

        if (node.type === 'conditional') {
            assignDepth(node.condition, subjectiveDepth + 1);
            assignDepth(node.consequence, subjectiveDepth + 1);
        }

        return node;
    };

    return assignDepth(resolveConditionals(treeWithGroups));
}

function increasesIndentation(token) {
    return token.type === 'openParenthesis' || token.type === 'openBracket';
}

function decreasesIndentation(token) {
    return token.type === 'closeParenthesis' || token.type === 'closeBracket';
}

function logError(message) {
    const logArea = document.getElementById('logArea');
    if (logArea) {
        logArea.innerHTML += `<p class="logMessage errorMessage">${message}</p>`;
    }
}

function logInfo(message) {
    const logArea = document.getElementById('logArea');
    if (logArea) {
        logArea.innerHTML += `<p class="logMessage infoMessage">${message}</p>`;
    }
}

function logWarning(message) {
    const logArea = document.getElementById('logArea');
    if (logArea) {
        logArea.innerHTML += `<p class="logMessage warningMessage">${message}</p>`;
    }
}

function prettyPrintTree(tree) {
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

function prettyPrint(booleanExpression) {
    logInfo('Attempt tokenization of input...');
    const tokens = tokenize(booleanExpression);
    if (tokens.length === 0) {
        logInfo('No meaningful tokens found.');
        return "";
    }

    logInfo(`Found ${tokens.length} meaningful tokens. Checking for sanity of input...`);

    const isValid = checkSanity(tokens);
    if (!isValid) {
        logError('Sanity check failed. Invalid expression.');
        return "";
    }
    logInfo('Sanity check passed. Attempt building abstract syntax tree...');
    const tree = buildAbstractSyntaxTree(tokens);
    logInfo('Abstract syntax tree built successfully. Attempt pretty printing...');
    return prettyPrintTree(tree);
}

function logBasicInfo() {
    logInfo('Please enter a boolean expression in the input area.');
    logInfo('Use parentheses () for grouping, brackets [] for ranges or curly braces {} for sets.');
    logInfo('Supported keywords: ' + conjunction.join(', ') + ', ' + disjunction.join(', ') + ', ' + conditionalIf.join(', ') + ', ' + conditionalThen.join(', '));
    logWarning('The tool does not yet understand that conjunction {and, AND, und, ...} binds stronger than disjunction {or, OR, oder, ...}. Use parentheses to clarify.');
}

function clearLog() {
    const logArea = document.getElementById('logArea');
    logArea.innerHTML = '';
}

function loadExample() {
    const example = "buy a cow and if that is not possible then (buy a goat or buy [1..3] chickens) and tell either one of {curly, larry, moe} about your adventure";
    document.getElementById('inputArea').value = example;
    document.getElementById('inputArea').dispatchEvent(new Event('input'));
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('inputArea').focus();
    const textArea = document.getElementById('inputArea');
    textArea.addEventListener('input', () => {
        clearLog();
        const expression = textArea.value;
        let result = "";
        try {
            result = prettyPrint(expression);            
        } catch (error) {
            logError(error.message);
        }
        if (result === "") {
            logBasicInfo();
        }
        const outputArea = document.getElementById('outputArea');
        outputArea.innerHTML = result;
    });
    loadExample();
    clearLog();
    logBasicInfo();
});