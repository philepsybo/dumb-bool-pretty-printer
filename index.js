import { logError, logInfo, logBasicInfo, clearLog } from "logger";
import { tokenize } from "tokenizer";
import { buildAbstractSyntaxTree } from "parser";
import { checkSanity } from "sanitizer";
import { asContentForHtmlPreElement } from "transformer";

function prettyPrint(booleanExpression) {
    if (booleanExpression.trim() === "") {
        return "";
    }

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

    return asContentForHtmlPreElement(tree);
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
