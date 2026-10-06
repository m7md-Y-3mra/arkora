import { Link } from '@inertiajs/react';
import { ArkoraLogo } from '@/components/ArkoraLogo';

export function PublicFooter() {
    return (
        <footer className="border-t border-border bg-onyx-900 text-alabaster">
            <div className="container grid gap-10 py-16 md:grid-cols-4">
                <div>
                    <ArkoraLogo className="text-alabaster" />
                    <p className="mt-4 max-w-xs text-sm leading-7 text-onyx-200">
                        أركورا منصة عقارية رقمية متكاملة تجمع بين الفخامة والدقة
                        لتقديم تجربة بحث واستثمار عقاري استثنائية.
                    </p>
                </div>

                <div>
                    <h3 className="mb-4 font-heading text-lg">روابط سريعة</h3>
                    <ul className="space-y-3 text-sm text-onyx-200">
                        <li><Link href={route('home')} className="hover:text-bronze-400">الرئيسية</Link></li>
                        <li><Link href={route('search')} className="hover:text-bronze-400">البحث عن عقار</Link></li>
                        <li><Link href={route('agents.index')} className="hover:text-bronze-400">دليل الوكلاء</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 font-heading text-lg">الحساب</h3>
                    <ul className="space-y-3 text-sm text-onyx-200">
                        <li><Link href={route('login')} className="hover:text-bronze-400">تسجيل الدخول</Link></li>
                        <li><Link href={route('register')} className="hover:text-bronze-400">إنشاء حساب</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="mb-4 font-heading text-lg">تواصل معنا</h3>
                    <ul className="space-y-3 text-sm text-onyx-200">
                        <li>info@arkora.sa</li>
                        <li>+966 11 234 5678</li>
                        <li>الرياض، المملكة العربية السعودية</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-onyx-700 py-6 text-center text-xs text-onyx-300">
                © {new Date().getFullYear()} أركورا. جميع الحقوق محفوظة.
            </div>
        </footer>
    );
}
