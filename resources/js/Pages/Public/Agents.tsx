import { Head, Link } from '@inertiajs/react';
import { Phone, Briefcase } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property, User } from '@/types/models';

interface AgentWithStats extends User {
    properties_count: number;
    properties: Property[];
}

export default function Agents({ agents }: { agents: AgentWithStats[] }) {
    return (
        <PublicLayout>
            <Head title="دليل الوكلاء العقاريين" />

            <div className="container py-16">
                <p className="font-heading text-bronze-600">شبكة أركورا</p>
                <h1 className="mt-2 font-heading text-4xl text-foreground">دليل الوكلاء العقاريين</h1>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                    تعرف على وكلائنا المعتمدين وتصفح أحدث العقارات المدرجة من
                    كل وكيل.
                </p>

                <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {agents.map((agent) => (
                        <Card key={agent.id} className="rounded-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-onyx-900 font-heading text-xl text-alabaster">
                                        {agent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-lg text-foreground">{agent.name}</h3>
                                        {agent.agent_profile?.agency_name && (
                                            <p className="text-sm text-muted-foreground">
                                                {agent.agent_profile.agency_name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {agent.agent_profile?.years_experience ?? 0} سنوات خبرة
                                    </span>
                                    {agent.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-4 w-4" />
                                            {agent.phone}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <Badge variant="outline" className="rounded-none">
                                        {agent.properties_count} عقار منشور
                                    </Badge>
                                </div>

                                {agent.properties.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        {agent.properties.map((property) => {
                                            const cover = property.images?.find((img) => img.is_cover) ?? property.images?.[0];
                                            return (
                                                <Link
                                                    key={property.id}
                                                    href={route('properties.show', property.slug)}
                                                    className="aspect-square overflow-hidden bg-onyx-100"
                                                >
                                                    {cover && (
                                                        <img src={cover.url} alt={property.title} className="h-full w-full object-cover" />
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {agents.length === 0 && (
                    <p className="mt-10 text-center text-muted-foreground">لا يوجد وكلاء متاحون حالياً.</p>
                )}
            </div>
        </PublicLayout>
    );
}
