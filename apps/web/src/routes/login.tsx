import { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { api } from '../lib/api';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Command, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
})

export function Login() {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setError('');
        setIsLoading(true);
        try {
            const { data } = await api.post<{ data: { token: string; user: any } }>('/auth/login', {
                email: values.email,
                password: values.password,
            });
            login(data.token, data.user);
            navigate({ to: '/' });
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Command className="mr-2 h-6 w-6" /> RecheDraw
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;This tool has revolutionized the way I create and share diagrams. It's intuitive, fast, and simply beautiful.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8 h-full flex items-center justify-center">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
                        <p className="text-sm text-muted-foreground">Enter your email and password below</p>
                    </div>

                    <div className={cn("grid gap-6")}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="name@example.com"
                                                    type="email"
                                                    autoCapitalize="none"
                                                    autoComplete="email"
                                                    autoCorrect="off"
                                                    disabled={isLoading}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Password"
                                                    type="password"
                                                    autoCapitalize="none"
                                                    autoComplete="current-password"
                                                    disabled={isLoading}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {error && (
                                    <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                        {error}
                                    </div>
                                )}

                                <Button disabled={isLoading} type="submit" className="w-full">
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Sign In with Email
                                </Button>
                            </form>
                        </Form>
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        <Link to="/register" className="underline underline-offset-4 hover:text-primary">
                            Don&apos;t have an account? Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
