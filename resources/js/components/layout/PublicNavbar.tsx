import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { ArkoraLogo } from '@/components/ArkoraLogo';
import { Button } from '@/components/ui/button';
import type { PageProps } from '@/types';

const navLinks = [
    { href: route('home'), label: 'الرئيسية' },
    { href: route('search'), label: 'البحث عن عقار' },
    { href: route('agents.index'), label: 'الوكلاء' },
];

export function PublicNavbar() {
    const { auth } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
            <nav className="container flex h-20 items-center justify-between">
                <Link href={route('home')}>
                    <ArkoraLogo />
                </Link>

                <div className="hidden items-center gap-10 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-foreground/80 transition-colors hover:text-bronze-600"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    {auth.user ? (
                        <Button asChild variant="default" className="rounded-none">
                            <Link href={route('dashboard')}>لوحة التحكم</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" className="rounded-none">
                                <Link href={route('login')}>تسجيل الدخول</Link>
                            </Button>
                            <Button asChild variant="default" className="rounded-none bg-onyx-900 text-alabaster hover:bg-onyx-800">
                                <Link href={route('register')}>إنشاء حساب</Link>
                            </Button>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    className="md:hidden"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="القائمة"
                >
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </nav>

            {open && (
                <div className="border-t border-border bg-background md:hidden">
                    <div className="container flex flex-col gap-4 py-6">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="text-sm font-medium">
                                {link.label}
                            </Link>
                        ))}
                        <div className="mt-2 flex flex-col gap-3">
                            {auth.user ? (
                                <Button asChild className="rounded-none">
                                    <Link href={route('dashboard')}>لوحة التحكم</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="outline" className="rounded-none">
                                        <Link href={route('login')}>تسجيل الدخول</Link>
                                    </Button>
                                    <Button asChild className="rounded-none">
                                        <Link href={route('register')}>إنشاء حساب</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
