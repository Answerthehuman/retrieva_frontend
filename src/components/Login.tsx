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
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription>
            Please enter your credentials to continue.
            <br />
            <span className="text-xs text-muted-foreground italic">(Hint: admin / password)</span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                className="h-11"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                className="h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01]">
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
