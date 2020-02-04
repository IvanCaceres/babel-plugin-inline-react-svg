/* eslint-disable no-param-reassign */
//
// These visitors normalize the SVG into something React understands:
//

import { namespaceToCamel, hyphenToCamel } from './camelize';
import cssToObj from './cssToObj';

export default (t, state) => ({
  JSXAttribute({ node, parent }) {
    const { name: originalName } = node;
    if (t.isJSXNamespacedName(originalName)) {
      // converts
      // <svg xmlns:xlink="asdf">
      // to
      // <svg xmlnsXlink="asdf">
      node.name = t.jSXIdentifier(namespaceToCamel(
        originalName.namespace.name,
        originalName.name.name,
      ));
    } else if (t.isJSXIdentifier(originalName)) {
      // converts
      // <tag class="blah blah1"/>
      // to
      // <tag className="blah blah1"/>
      if (originalName.name === 'class') {
        originalName.name = 'className';
      }

      // converts
      // <tag style="text-align: center; width: 50px">
      // to
      // <tag style={{textAlign: 'center', width: '50px'}}>
      if (originalName.name === 'style') {
        const csso = cssToObj(node.value.value);
        const properties = Object.keys(csso).map(prop => t.objectProperty(
          t.identifier(hyphenToCamel(prop)),
          t.stringLiteral(csso[prop]),
        ));
        node.value = t.jSXExpressionContainer(t.objectExpression(properties));
      }

      if (originalName.name === 'id') {
        const isSvgId = Boolean(parent && parent.type === 'JSXOpeningElement' && parent.name.name.toLowerCase() === 'svg');
        if (!isSvgId) {
          const idToRewrite = node.value.value;
          let index = state.ids.get(idToRewrite);
          if (index == null) {
            index = state.ids.size;
            state.ids.set(idToRewrite, index);
          }
          node.value = t.jSXExpressionContainer(
            t.memberExpression(t.identifier('ids'), t.numericLiteral(index), true),
          );
        }
      } else {
        const idRefMatch = /^url\(#([^)]+)\)$/.exec(node.value.value);
        if (idRefMatch) {
          const idToRewrite = idRefMatch[1];
          let index = state.ids.get(idToRewrite);
          if (index == null) {
            index = state.ids.size;
            state.ids.set(idToRewrite, index);
          }
          node.value = t.jSXExpressionContainer(
            t.binaryExpression('+',
              t.binaryExpression('+',
                t.stringLiteral('url(#'),
                t.memberExpression(t.identifier('ids'), t.numericLiteral(index), true)),
              t.stringLiteral(')')),
          );
        }
      }

      // converts
      // <svg stroke-width="5">
      // to
      // <svg strokeWidth="5">
      // don't convert any custom data-* or aria-* attributes just wrap in quotes
      if (/^data-|^aria-/.test(originalName.name)) {
        originalName.name = `'${originalName.name}'`;
      } else {
        originalName.name = hyphenToCamel(originalName.name);
      }
    }
  },

  // converts
  // <svg>
  // to
  // <svg {...props}>
  // after passing through attributes visitors
  JSXOpeningElement({ node: { name, attributes } }) {
    if (name.name.toLowerCase() === 'svg') {
      // add spread props
      attributes.push(t.jSXSpreadAttribute(t.identifier('props')));
    }
  },
});
