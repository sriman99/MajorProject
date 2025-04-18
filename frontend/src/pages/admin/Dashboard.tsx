import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

// Mock data
const stats = [
  { title: "Total Doctors", value: "45", change: "+5" },
  { title: "Total Patients", value: "1,234", change: "+89" },
  { title: "Active Appointments", value: "156", change: "+12" },
  { title: "System Health", value: "100%", change: "Stable" },
]

const recentActivities = [
  { action: "New doctor registration", time: "10 minutes ago" },
  { action: "Appointment scheduled", time: "30 minutes ago" },
  { action: "System update completed", time: "1 hour ago" },
]

const systemAlerts = [
  { type: "warning", message: "Backup scheduled in 2 hours" },
  { type: "info", message: "New features available for review" },
  { type: "success", message: "System performance optimal" },
]

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button>System Settings</Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600">
                  {stat.change} from last week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      alert.type === "warning"
                        ? "bg-yellow-50 text-yellow-800"
                        : alert.type === "info"
                        ? "bg-blue-50 text-blue-800"
                        : "bg-green-50 text-green-800"
                    }`}
                  >
                    <p className="text-sm">{alert.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <p className="text-sm">{activity.action}</p>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 