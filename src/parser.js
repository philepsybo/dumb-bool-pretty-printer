export function buildAbstractSyntaxTree(tokens) {
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
