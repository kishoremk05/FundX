import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Loans() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Active Loans</h1>
        <p className="text-muted-foreground mt-1">Manage all active loans</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loans List</CardTitle>
          <CardDescription>View and manage active customer loans</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-12">
            Active loans list and management will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
