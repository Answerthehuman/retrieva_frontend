import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useChatStore((state) => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <Card className="w-full max-w-sm shadow-lg border-primary/10">
        <CardHeader className="space-y-1 text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>
            Sign in to continue to Retrieva.
            <br />
            <span className="text-xs text-muted-foreground">(Hint: admin / password)</span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="font-medium text-sm">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                className="h-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-medium text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                className="h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-10 text-sm font-semibold transition-all hover:scale-[1.01]">
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
