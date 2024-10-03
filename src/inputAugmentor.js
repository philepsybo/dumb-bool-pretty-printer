import {simpleTokenize} from "tokenizer";
import {conditionalIf, conditionalThen, conjunction, disjunction} from "language";

export function augmentInput(input) {
    const tokens = simpleTokenize(input);
    const augmentedTokens = [];
    for (const token of tokens) {
        if (
            conjunction.includes(token.value)
            || disjunction.includes(token.value)
            || conditionalIf.includes(token.value)
            || conditionalThen.includes(token.value)
        ) {
            augmentedTokens.push({type: token.type, value: `<span class="overlay_keyword">${token.value}</span>`});
        } else if (token.type === 'whitespace') {
            augmentedTokens.push({type: token.type, value: `<span class="overlay_whitespace">${token.value}</span>`});
        } else if (token.type === 'openParenthesis' || token.type === 'closeParenthesis') {
            augmentedTokens.push({type: token.type, value: `<span class="overlay_parenthesis">${token.value}</span>`});
        } else if (token.type === 'openBracket' || token.type === 'closeBracket') {
            augmentedTokens.push({type: token.type, value: `<span class="overlay_bracket">${token.value}</span>`});
        } else if (token.type === 'openCurlyBrace' || token.type === 'closeCurlyBrace') {
            augmentedTokens.push({type: token.type, value: `<span class="overlay_curlyBrace">${token.value}</span>`});
        } else {
            augmentedTokens.push({type: token.type, value: `<span class="overlay_literal">${token.value}</span>`});
        }
    }

    return augmentedTokens.map((token) => token.value).join('');
}
