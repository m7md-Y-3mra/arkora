import { useCallback, useState, type DragEvent } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertyImage } from '@/types/models';

export interface ImageItem {
    key: string;
    kind: 'existing' | 'new';
    id?: number;
    file?: File;
    url: string;
    isCover: boolean;
}

export function imagesFromExisting(images: PropertyImage[]): ImageItem[] {
    return images.map((img) => ({
        key: `existing:${img.id}`,
        kind: 'existing',
        id: img.id,
        url: img.url,
        isCover: img.is_cover,
    }));
}

function SortableImage({
    item,
    onRemove,
    onSetCover,
}: {
    item: ImageItem;
    onRemove: () => void;
    onSetCover: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.key });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn(
                'group relative aspect-square cursor-grab overflow-hidden border border-border bg-onyx-50',
                isDragging && 'z-10 opacity-70',
            )}
            {...attributes}
            {...listeners}
        >
            <img src={item.url} alt="" className="h-full w-full object-cover" />

            {item.isCover && (
                <span className="absolute start-2 top-2 bg-bronze-500 px-2 py-0.5 text-xs font-medium text-onyx-900">
                    الصورة الرئيسية
                </span>
            )}

            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-onyx-950/0 opacity-0 transition-opacity group-hover:bg-onyx-950/40 group-hover:opacity-100">
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSetCover();
                    }}
                    className="rounded-full bg-background p-2"
                    title="تعيين كصورة رئيسية"
                >
                    <Star className={cn('h-4 w-4', item.isCover && 'fill-bronze-500 text-bronze-500')} />
                </button>
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="rounded-full bg-background p-2"
                    title="حذف"
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </button>
            </div>
        </div>
    );
}

export function ImageManager({ items, onChange }: { items: ImageItem[]; onChange: (items: ImageItem[]) => void }) {
    const [dragOver, setDragOver] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const addFiles = useCallback(
        (files: FileList | null) => {
            if (!files) return;
            const newItems: ImageItem[] = Array.from(files)
                .filter((f) => f.type.startsWith('image/'))
                .map((file) => ({
                    key: `new:${crypto.randomUUID()}`,
                    kind: 'new' as const,
                    file,
                    url: URL.createObjectURL(file),
                    isCover: false,
                }));

            const merged = [...items, ...newItems];
            if (!merged.some((i) => i.isCover) && merged.length > 0) {
                merged[0].isCover = true;
            }
            onChange(merged);
        },
        [items, onChange],
    );

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((i) => i.key === active.id);
        const newIndex = items.findIndex((i) => i.key === over.id);
        onChange(arrayMove(items, oldIndex, newIndex));
    };

    const removeItem = (key: string) => {
        const filtered = items.filter((i) => i.key !== key);
        if (filtered.length > 0 && !filtered.some((i) => i.isCover)) {
            filtered[0].isCover = true;
        }
        onChange(filtered);
    };

    const setCover = (key: string) => {
        onChange(items.map((i) => ({ ...i, isCover: i.key === key })));
    };

    return (
        <div className="space-y-4">
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                    'flex flex-col items-center justify-center border-2 border-dashed border-border p-10 text-center transition-colors',
                    dragOver && 'border-bronze-500 bg-bronze-50',
                )}
            >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                    اسحب الصور وأفلتها هنا، أو
                    <label className="mx-1 cursor-pointer text-bronze-600 hover:underline">
                        تصفح الملفات
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => addFiles(e.target.files)}
                        />
                    </label>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">PNG أو JPG، حتى 8 ميجابايت للصورة</p>
            </div>

            {items.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items.map((i) => i.key)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                            {items.map((item) => (
                                <SortableImage
                                    key={item.key}
                                    item={item}
                                    onRemove={() => removeItem(item.key)}
                                    onSetCover={() => setCover(item.key)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
