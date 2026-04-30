import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { userEvent, within } from 'storybook/test'
import CallCenterPage from '@/app/call-center/page'
import { withSession } from '../mocks/utils'
import { OPERATOR_SESSION, mockOperators, mockCallCenterManagers, mockHistory } from '../mocks/data'

const sessionStorage = { operator_session: OPERATOR_SESSION }

const handlers = [
  { pattern: '/api/call-center/operators', response: mockOperators },
  { pattern: '/api/call-center/managers', response: mockCallCenterManagers },
  { pattern: '/api/call-center/history', response: mockHistory },
]

const meta: Meta<typeof CallCenterPage> = {
  title: 'Pages/CallCenter',
  component: CallCenterPage,
  parameters: {
    nextjs: { appDirectory: true },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof CallCenterPage>

export const Operators: Story = {
  name: 'מפעילים',
  decorators: [withSession(sessionStorage, handlers)],
}

export const Managers: Story = {
  name: 'מנהלים',
  decorators: [withSession(sessionStorage, handlers)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const btn = await canvas.findByRole('button', { name: /מנהלים/ }, { timeout: 8000 })
    await userEvent.click(btn)
  },
}

export const History: Story = {
  name: 'היסטוריה',
  decorators: [withSession(sessionStorage, handlers)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const btn = await canvas.findByRole('button', { name: /היסטוריה/ }, { timeout: 8000 })
    await userEvent.click(btn)
  },
}
