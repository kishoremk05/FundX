import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Repayments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Repayments</h1>
        <p className="text-muted-foreground mt-1">Track and manage loan repayments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repayment Records</CardTitle>
          <CardDescription>View all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-12">
            Repayment tracking and recording interface will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
