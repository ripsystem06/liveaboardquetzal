import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, fireEvent } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { GuestSelector } from './guest-selector'

describe('GuestSelector', () => {
  it('renders current value', () => {
    const onChange = vi.fn()
    renderWithProviders(<GuestSelector value={5} onChange={onChange} />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders decrement and increment buttons', () => {
    const onChange = vi.fn()
    renderWithProviders(<GuestSelector value={5} onChange={onChange} />)

    expect(screen.getByRole('button', { name: /remove guest/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add guest/i })).toBeInTheDocument()
  })

  it('calls onChange with value-1 when decrement is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<GuestSelector value={5} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /remove guest/i }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('calls onChange with value+1 when increment is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<GuestSelector value={5} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /add guest/i }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('decrement is disabled at value 1', () => {
    const onChange = vi.fn()
    renderWithProviders(<GuestSelector value={1} onChange={onChange} />)

    const decrementButton = screen.getByRole('button', { name: /remove guest/i })
    expect(decrementButton).toBeDisabled()
  })

  it('increment is disabled at value 18', () => {
    const onChange = vi.fn()
    renderWithProviders(<GuestSelector value={18} onChange={onChange} />)

    const incrementButton = screen.getByRole('button', { name: /add guest/i })
    expect(incrementButton).toBeDisabled()
  })

  it('default value is 1', () => {
    const onChange = vi.fn()
    renderWithProviders(<GuestSelector value={1} onChange={onChange} />)

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('does not call onChange when decrement is disabled and clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<GuestSelector value={1} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /remove guest/i }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not call onChange when increment is disabled and clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<GuestSelector value={18} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /add guest/i }))

    expect(onChange).not.toHaveBeenCalled()
  })
})