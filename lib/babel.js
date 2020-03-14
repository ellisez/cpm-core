module.exports=function ({ types: t }) {
    return {
        visitor: {
            ImportDeclaration(nodepath, source) {
                const node=nodepath.node;
                if (nodepath.get('source.value').node==='vue') {
                    nodepath.remove();
                }
            }
        }
    }
}