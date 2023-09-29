import htm from 'htm'
import h from '@playpilot/svelte-hyperscript'
import Fragment from '@playpilot/svelte-fragment-component'

const html$ = htm.bind(h)

export function html(...args) {
  const component = html$(...args)

  // Multiple root elements (fragments): <div /><div />
  if (Array.isArray(component)) {
    // Wrap in a fragment: `component´ are its children
    return h(Fragment, null, ...component)
  }

  return component
}
