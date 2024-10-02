import {tokenize} from "tokenizer";
import {conjunction, disjunction, conditionalIf, conditionalThen} from "language";

export function augmentInput(input) {
    const tokens = tokenize(input);
    const augmentedTokens = [];
    //wrap all keyword-tokens in span-elements with class keyword
    for (const token of tokens) {
        if (
            conjunction.includes(token.value)
            || disjunction.includes(token.value)
            || conditionalIf.includes(token.value)
            || conditionalThen.includes(token.value)
        ) {
            augmentedTokens.push({type: token.type, value: token.value});
        } else {
            augmentedTokens.push(token);
        }
    }

    return augmentedTokens.join(' ');
}
