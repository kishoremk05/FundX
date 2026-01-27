import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
    const { resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await resetPassword(email);

            if (error) {
                setError(error.message || 'Failed to send reset email');
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <Mail className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-center font-heading">Check Your Email</CardTitle>
                        <CardDescription className="text-center">
                            We've sent password reset instructions to <strong>{email}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button asChild className="w-full">
                            <Link to="/login">
                                Return to Login
                            </Link>
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Didn't receive the email?{' '}
                            <button
                                onClick={() => setSuccess(false)}
                                className="text-primary hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                            >
                                Try again
                            </button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <div className="flex items-center justify-center mb-4">
                        <img src="/kep-logo-new.png" alt="KEP Microcredit" className="h-24 object-contain bg-white/90 dark:bg-white rounded-xl p-2" />
                    </div>
                    <CardTitle className="text-2xl text-center font-heading">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address and we'll send you a link to reset your password
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Reset Link
                        </Button>

                        <div className="text-center text-sm">
                            <Link
                                to="/login"
                                className="flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
