import { useLocation, Link } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Fragment } from "react"

const routeLabels: Record<string, string> = {
  "": "Home",
  "patient": "Patient",
  "doctor": "Doctor",
  "admin": "Admin",
  "dashboard": "Dashboard",
  "settings": "Settings",
  "appointments": "Appointments",
  "manage": "Manage",
  "analysis": "Analysis",
  "hospitals": "Hospitals",
  "payments": "Payments",
  "history": "History",
  "payment": "Payment",
  "features": "Features",
  "how-it-works": "How It Works",
}

export function PageBreadcrumb() {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)

  // Don't show breadcrumb on home or login pages
  if (segments.length === 0 || ["login", "signup", "forgot-password", "reset-password"].includes(segments[0])) {
    return null
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const path = "/" + segments.slice(0, index + 1).join("/")
          const isLast = index === segments.length - 1
          const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

          return (
            <Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
