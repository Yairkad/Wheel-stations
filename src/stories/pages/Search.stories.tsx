import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import SearchPage from '@/app/search/page'
import { withSession } from '../mocks/utils'
import { STATION_ID, mockStations, mockDistricts } from '../mocks/data'

const sessionStorage = {
  [`station_session_${STATION_ID}`]: { manager: { id: 'mgr-1' }, stationId: STATION_ID, timestamp: Date.now(), version: 4 },
}

const handlers = [
  { pattern: '/api/wheel-stations/filter-options', response: { rimSizes: ['15', '16', '17', '18'], boltCounts: [4, 5], boltSpacings: [100, 108, 112, 114.3, 120] } },
  { pattern: '/api/wheel-stations/search', response: { results: [] } },
  { pattern: '/api/wheel-stations', response: mockStations },
  { pattern: '/api/districts', response: mockDistricts },
]

const meta: Meta<typeof SearchPage> = {
  title: 'Pages/Search',
  component: SearchPage,
  parameters: {
    nextjs: { appDirectory: true },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof SearchPage>

export const StationList: Story = {
  name: 'רשימת תחנות',
  decorators: [withSession(sessionStorage, handlers)],
}

export const NoResults: Story = {
  name: 'אין תוצאות חיפוש',
  decorators: [withSession(sessionStorage, handlers)],
}
