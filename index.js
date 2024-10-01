import { logError, logInfo, logSuccess, logBasicInfo, clearLog } from "logger";
import { tokenize } from "tokenizer";
import { buildAbstractSyntaxTree } from "parser";
import { checkSanity } from "sanitizer";
import { asContentForHtmlPreElement, asIndentedMarkdown } from "transformer";

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
        throw new Error("Sanity check failed. Invalid expression.");
        
        return "";
    }

    logInfo('Sanity check passed. Attempt building abstract syntax tree...');

    const tree = buildAbstractSyntaxTree(tokens);

    logInfo('Abstract syntax tree built successfully. Attempt pretty printing...');

    return asContentForHtmlPreElement(tree);
}

function downloadMarkdown() {
    const inputArea = document.getElementById('inputArea');
    const expression = inputArea.value;
    const prettyPrinted = prettyPrint(expression);
    if (prettyPrinted === "") {
        logError('Failed to download. Invalid or empty expression.');
        return;
    }
    const blob = new Blob([asIndentedMarkdown(buildAbstractSyntaxTree(tokenize(expression)))]);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = document.getElementById('downloadFilename').value;
    a.download = filename === "" ? 'pretty-print-bool.md' : `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
}

function loadExample() {
    const example = "buy a cow and if that is not possible then (buy a goat or buy [1..3] chickens) and tell either one of {curly, larry, moe} about your adventure";
    document.getElementById('inputArea').value = example;
    document.getElementById('inputArea').dispatchEvent(new Event('input'));
}

function logMessageToOutputArea(message) {
    const outputArea = document.getElementById('outputArea');
    outputArea.innerHTML = message;
}

function updatePrettyPrintArea(textArea) {
    return () => {
        clearLog();
        const expression = textArea.value;
        let result = "";
        try {
            result = prettyPrint(expression);
            logSuccess('Pretty printed successfully.');
        } catch (error) {
            logError(error.message);
            logMessageToOutputArea("Could not pretty print. Please refer to the log for trouble-shooting.");
            return;
        }
        if (result === "") {
            logBasicInfo();
        }
        const outputArea = document.getElementById('outputArea');
        outputArea.innerHTML = result;
    };
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('downloadAsMarkdownButton').addEventListener('click', (downloadMarkdown));

    const textArea = document.getElementById('inputArea');
    textArea.focus();
    textArea.select();
    textArea.addEventListener('input', updatePrettyPrintArea(textArea));
    loadExample();
    clearLog();
    logBasicInfo();
});
