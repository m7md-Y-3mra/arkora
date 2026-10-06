import { Head, router } from '@inertiajs/react';
import { Briefcase, Phone, MessageCircle, Award } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Badge } from '@/components/ui/badge';
import type { PaginatedResponse, Property, User } from '@/types/models';

interface AgentWithStats extends User {
    properties_count: number;
}

export default function AgentProfile({
    agent,
    properties,
}: {
    agent: AgentWithStats;
    properties: PaginatedResponse<Property>;
}) {
    return (
        <PublicLayout>
            <Head title={agent.name} />

            <div className="bg-onyx-900 py-16 text-alabaster">
                <div className="container flex flex-wrap items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bronze-500 font-heading text-3xl text-onyx-900">
                        {agent.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="font-heading text-3xl">{agent.name}</h1>
                        {agent.agent_profile?.agency_name && (
                            <p className="mt-1 text-onyx-200">{agent.agent_profile.agency_name}</p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-onyx-200">
                            <span className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {agent.agent_profile?.years_experience ?? 0} سنوات خبرة
                            </span>
                            {agent.agent_profile?.license_number && (
                                <span className="flex items-center gap-1">
                                    <Award className="h-4 w-4" />
                                    رخصة رقم {agent.agent_profile.license_number}
                                </span>
                            )}
                            {agent.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    {agent.phone}
                                </span>
                            )}
                            {agent.agent_profile?.whatsapp && (
                                <a
                                    href={`https://wa.me/${agent.agent_profile.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-bronze-400 hover:underline"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    واتساب
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-12">
                {agent.agent_profile?.bio && (
                    <p className="max-w-2xl leading-7 text-muted-foreground">{agent.agent_profile.bio}</p>
                )}

                <div className="mt-8 flex items-center justify-between border-b border-border pb-4">
                    <h2 className="font-heading text-2xl text-foreground">العقارات المنشورة</h2>
                    <Badge variant="outline" className="rounded-none">{agent.properties_count} عقار</Badge>
                </div>

                {properties.data.length === 0 ? (
                    <p className="py-16 text-center text-muted-foreground">لا توجد عقارات منشورة حالياً.</p>
                ) : (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {properties.data.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                )}

                {properties.last_page > 1 && (
                    <div className="mt-10 flex flex-wrap justify-center gap-2">
                        {properties.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url, { preserveState: true, preserveScroll: true })}
                                className={`min-w-10 border px-3 py-2 text-sm ${
                                    link.active ? 'border-onyx-900 bg-onyx-900 text-alabaster' : 'border-border hover:border-onyx-400'
                                } ${!link.url ? 'cursor-not-allowed opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
