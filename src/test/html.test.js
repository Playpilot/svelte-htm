import { describe, expect, vi, it } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'

import { html } from '../lib/html'
import Counter from './Counter.svelte'
import List from './List.svelte'

describe('html tagged templates', () => {
  it('supports nested html', () => {
    const { getByRole } = render(html`<h1 class="large">Hello <strong>World</strong>!</h1>`)
    const heading = getByRole('heading')

    expect(heading.outerHTML).toMatch('<h1 class="large">Hello <strong>World</strong>!</h1>')
  })

  it('supports multiple root elements (fragments)', () => {
    const { container } = render(html`<span>a</span><span>b</span>`)

    expect(container.innerHTML).toMatch('<div><span>a</span><span>b</span></div>')
  })

  it('supports click listener', async () => {
    const handleClick = vi.fn()

    const { getByRole } = render(
      html`<button on:click=${handleClick}>Hello <strong>World</strong>!</button>`,
    )
    const button = getByRole('button')

    // Using await when firing events is unique to the svelte testing library because
    // we have to wait for the next `tick` so that Svelte flushes all pending state changes.
    await fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('increments count when button is clicked', async () => {
    const { getByText } = render(html`<${Counter} />`)
    const button = getByText('Count is 0')

    await fireEvent.click(button)
    expect(button.innerHTML).toBe('Count is 1')

    await fireEvent.click(button)
    expect(button.innerHTML).toBe('Count is 2')
  })

  it('increments count when button is clicked (initialized)', async () => {
    const { getByText } = render(html`<${Counter} initialCount=${5} />`)
    const button = getByText('Count is 5')

    await fireEvent.click(button)
    expect(button.innerHTML).toBe('Count is 6')
  })

  it('forwards click event', async () => {
    const handleClick = vi.fn()

    const { getByRole } = render(html`<${Counter} on:click=${handleClick} />`)

    const button = getByRole('button')

    await fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(button.innerHTML).toBe('Count is 1')
  })

  it('allows to provide default slot content', () => {
    const { getByRole } = render(html`<${Counter}>New default slot content<//>`)

    const button = getByRole('button')

    expect(button.innerHTML).toBe('New default slot content')
  })

  it('allows to access default slot values', async () => {
    const countSetter = vi.fn()
    const { getByRole } = render(html`<${Counter} let:count=${countSetter}>slot content<//>`)
    const button = getByRole('button')

    await fireEvent.click(button)
    expect(countSetter).toHaveBeenCalledWith(0, 'count')

    await fireEvent.click(button)
    expect(countSetter).toHaveBeenCalledWith(1, 'count')
  })

  it('allows to provide named slot content', () => {
    const itemSetter = vi.fn()
    const itemsSetter = vi.fn()
    const items = ['a', 'b', 'c']

    const { container } = render(html`
      <${List} items=${items} let:item=${itemSetter}>
        <div>each item</div>
        <p slot="footer" let:items=${itemsSetter}>That's all...</p>
      <//>
    `)

    expect(container.innerHTML).toMatch(
      `<div> <ul><li><div>each item</div> </li><li><div>each item</div> </li><li><div>each item</div> </li></ul> <p>That's all...</p></div>`,
    )

    expect(itemSetter.mock.calls).toMatchObject([
      ['a', 'item'],
      ['b', 'item'],
      ['c', 'item'],
    ])

    expect(itemsSetter).toHaveBeenCalledTimes(1)
    expect(itemsSetter).toHaveBeenCalledWith(items, 'items')
  })
})
