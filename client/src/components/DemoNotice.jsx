import { USING_MOCK_API } from '../api'

export default function DemoNotice() {
  if (!USING_MOCK_API) return null
  return (
    <aside className="demo-notice" aria-label="Demo mode">
      <strong>Demo mode.</strong> Explore our Filipino recipe collection using
      sample data included with the app. This version is not connected to the
      live database. Your ingredient selection resets when you refresh.
    </aside>
  )
}
