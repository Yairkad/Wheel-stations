import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { userEvent, within } from 'storybook/test'
import StationPage from '@/app/[stationId]/page'
import { withSession } from '../mocks/utils'
import { STATION_ID, mockStation, mockDeletedWheels, mockDistricts, mockBorrows, STATION_MANAGER_SESSION, VISITOR_SESSION } from '../mocks/data'

const handlers = [
  { pattern: `/api/wheel-stations/${STATION_ID}/deleted-wheels`, response: mockDeletedWheels },
  { pattern: `/api/wheel-stations/${STATION_ID}/borrows`, response: mockBorrows },
  { pattern: `/api/wheel-stations/${STATION_ID}`, response: mockStation },
  { pattern: '/api/districts', response: mockDistricts },
]

const managerStorage = { [`station_session_${STATION_ID}`]: STATION_MANAGER_SESSION }

const meta: Meta<typeof StationPage> = {
  title: 'Pages/Station',
  component: StationPage,
  parameters: {
    nextjs: { appDirectory: true },
    layout: 'fullscreen',
  },
  args: {
    params: Promise.resolve({ stationId: STATION_ID }),
  },
}

export default meta
type Story = StoryObj<typeof StationPage>

export const Visitor: Story = {
  name: 'מבקר — גלגלים',
  decorators: [withSession(VISITOR_SESSION, handlers)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: /תחנת גלגלים/ }, { timeout: 10000 })
  },
}

export const ManagerWheels: Story = {
  name: 'מנהל — גלגלים',
  decorators: [withSession(managerStorage, handlers)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: /תחנת גלגלים/ }, { timeout: 10000 })
  },
}

export const ManagerTracking: Story = {
  name: 'מנהל — מעקב',
  decorators: [withSession(managerStorage, handlers)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const btn = await canvas.findByRole('button', { name: /מעקב/ }, { timeout: 8000 })
    await userEvent.click(btn)
  },
}

export const ManagerAlerts: Story = {
  name: 'מנהל — התראות',
  decorators: [withSession(managerStorage, handlers)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const btn = await canvas.findByRole('button', { name: /^התראות$/ }, { timeout: 8000 })
    await userEvent.click(btn)
  },
}

export const ManagerReports: Story = {
  name: 'מנהל — דוחות',
  decorators: [withSession(managerStorage, handlers)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const btn = await canvas.findByRole('button', { name: /דוחות/ }, { timeout: 8000 })
    await userEvent.click(btn)
  },
}
