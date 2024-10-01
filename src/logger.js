import { conjunction, disjunction, conditionalIf, conditionalThen } from 'language';

export function logError(message) {
    const logArea = document.getElementById('logArea');
    if (logArea) {
        logArea.innerHTML += `<p class="logMessage errorMessage">${message}</p>`;
    }
}

export function logInfo(message) {
    const logArea = document.getElementById('logArea');
    if (logArea) {
        logArea.innerHTML += `<p class="logMessage infoMessage">${message}</p>`;
    }
}

export function logWarning(message) {
    const logArea = document.getElementById('logArea');
    if (logArea) {
        logArea.innerHTML += `<p class="logMessage warningMessage">${message}</p>`;
    }
}

export function logSuccess(message) {
    const logArea = document.getElementById('logArea');
    if (logArea) {
        logArea.innerHTML += `<p class="logMessage successMessage">${message}</p>`;
    }
}

export function logBasicInfo() {
    logInfo('Please enter a boolean expression in the input area.');
    logInfo('Use parentheses () for grouping, brackets [] for ranges or curly braces {} for sets.');
    logInfo('Supported keywords: ' + conjunction.join(', ') + ', ' + disjunction.join(', ') + ', ' + conditionalIf.join(', ') + ', ' + conditionalThen.join(', '));
    logWarning('The tool does not yet understand that conjunction {and, AND, und, ...} binds stronger than disjunction {or, OR, oder, ...}. Use parentheses to clarify.');
}

export function clearLog() {
    const logArea = document.getElementById('logArea');
    logArea.innerHTML = '';
}
