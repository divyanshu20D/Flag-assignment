import AppShell from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const users = [
  { name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { name: "Bob Smith", email: "bob@example.com", role: "ReadOnly" },
]

export default function WorkspacePage() {
  return (
    <AppShell title="Workspace">
      <div className="mx-auto max-w-4xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Workspace: Cognitute Demo</CardTitle>
          </CardHeader>
          <CardContent>This is a demo workspace used to showcase FlipSwitch.</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.email}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
