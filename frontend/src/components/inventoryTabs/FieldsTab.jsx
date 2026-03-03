import React, { useContext, useEffect, useState } from "react";
import { Button, Select, Input, message } from "antd";
import api from "../../api/axios";

import {
    DndContext,
    closestCenter
} from "@dnd-kit/core";

import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { LanguageContext } from "../../context/LanguageContext.jsx";

const FIELD_TYPES = ["STRING", "NUMBER", "BOOLEAN"];

const FieldsTab = ({ inventoryId }) => {
    const [fields, setFields] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const { t } = useContext(LanguageContext);

    useEffect(() => {
        loadFields();
    }, [inventoryId]);

    const loadFields = async () => {
        const res = await api.get(`/custom-fields/${inventoryId}`);
        setFields(res.data.map(f => ({ ...f, _id: crypto.randomUUID() })));
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleDeleteSelected = () => {
        setFields(prev =>
            prev.filter(field => !selectedIds.includes(field._id))
        );
        setSelectedIds([]);
        setHasChanges(true);
    };

    const handleAdd = () => {
        // Проверяем, есть ли тип, который можно добавить
        const typeCount = fields.reduce((acc, f) => {
            acc[f.type] = (acc[f.type] || 0) + 1;
            return acc;
        }, {});

        const availableType = FIELD_TYPES.find(t => (typeCount[t] || 0) < 3);

        if (!availableType) {
            message.error("You cannot add more fields of any type (max 3 per type).");
            return;
        }

        setFields(prev => [
            ...prev,
            {
                _id: crypto.randomUUID(),
                title: "",
                type: availableType,
                showInTable: true,
                isNew: true
            }
        ]);
        setHasChanges(true);
    };

    const updateField = (index, key, value) => {
        if (key === "type") {
            // Проверяем лимит по типу
            const typeCount = fields.reduce((acc, f, i) => {
                if (i !== index) acc[f.type] = (acc[f.type] || 0) + 1;
                return acc;
            }, {});

            if ((typeCount[value] || 0) >= 3) {
                message.error(`Maximum 3 fields of type ${value} allowed`);
                return;
            }
        }

        const updated = [...fields];
        updated[index][key] = value;
        setFields(updated);
        setHasChanges(true);
    };

    const handleSave = async () => {
        const cleanFields = fields.map(({ _id, isNew, ...rest }) => rest);
        await api.put(`/custom-fields/${inventoryId}`, { fields: cleanFields });
        setHasChanges(false);
        loadFields();
    };

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={handleAdd}>{t.addField}</Button>

                <Button
                    danger
                    disabled={!selectedIds.length}
                    onClick={handleDeleteSelected}
                    style={{ marginLeft: 8 }}
                >
                    {t.deleteSelected}
                </Button>

                <Button
                    type="primary"
                    disabled={!hasChanges}
                    onClick={handleSave}
                    style={{ marginLeft: 8 }}
                >
                    {t.save}
                </Button>
            </div>

            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={(event) => {
                    const { active, over } = event;
                    if (active.id !== over?.id) {
                        setFields((items) => {
                            const oldIndex = items.findIndex(i => i._id === active.id);
                            const newIndex = items.findIndex(i => i._id === over.id);
                            const newItems = arrayMove(items, oldIndex, newIndex);
                            setHasChanges(true);
                            return newItems;
                        });
                    }
                }}
            >
                <SortableContext
                    items={fields.map(f => f._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {fields.map((field, index) => (
                        <SortableItem
                            key={field._id}
                            id={field._id}
                            field={field}
                            index={index}
                            updateField={updateField}
                            selectedIds={selectedIds}
                            toggleSelect={toggleSelect}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </>
    );
};

const SortableItem = ({ id, field, index, updateField, selectedIds, toggleSelect }) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        display: "flex",
        gap: 12,
        marginBottom: 10,
        alignItems: "center"
    };

    return (
        <div ref={setNodeRef} style={style}>
            <input
                type="checkbox"
                checked={selectedIds.includes(id)}
                onChange={() => toggleSelect(id)}
            />

            <div
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                style={{ cursor: "grab", padding: "4px 8px", background: "#eee", borderRadius: 4 }}
            >
                ☰
            </div>

            <Input
                value={field.title}
                onChange={(e) => updateField(index, "title", e.target.value)}
                style={{ width: 200 }}
            />

            <Select
                value={field.type}
                onChange={(value) => updateField(index, "type", value)}
                options={FIELD_TYPES.map(t => ({ value: t }))}
                style={{ width: 150 }}
            />
        </div>
    );
};

export default FieldsTab;