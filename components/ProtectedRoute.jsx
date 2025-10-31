export default function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) return <Redirect href="/login" />
  if (!allowedRoles.includes(user.role)) return <Redirect href="/elections" />
  return children
}
