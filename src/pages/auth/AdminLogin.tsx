import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error: signInError } = await signIn(email, password);
            if (signInError) {
                // Map common firebase errors to user-friendly messages
                setError('Invalid credentials');
            } else {
                navigate('/admin');
            }
        } catch (err: any) {
            setError('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Admin Badge */}
                <div className="flex justify-center mb-6">
                    <div className="bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="text-primary font-medium">Admin Portal</span>
                    </div>
                </div>

                <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-lg shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary to-primary/50 rounded-xl flex items-center justify-center">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
                        <CardDescription className="text-slate-400">
                            Secure access to the administration panel
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Admin Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@kepmic.co.tz"
                                    required
                                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign In to Admin'}
                            </Button>

                            <div className="text-center text-sm text-slate-400">
                                <Link to="/forgot-password" className="hover:text-primary">
                                    Forgot password?
                                </Link>
                            </div>

                            <div className="text-center text-sm text-slate-500 pt-2 border-t border-slate-700">
                                <Link to="/" className="hover:text-slate-300">
                                    ← Back to main site
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-slate-500 text-xs mt-6">
                    Protected area. Unauthorized access is prohibited.
                </p>
            </div>
        </div>
    );
}
