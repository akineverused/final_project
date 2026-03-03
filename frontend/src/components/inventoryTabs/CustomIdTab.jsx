import React, {useState, useEffect, useContext} from "react";
import { Button, Select, Input } from "antd";
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
import {LanguageContext} from "../../context/LanguageContext.jsx";

const ELEMENT_TYPES = [
    "TEXT",
    "SEQUENCE",
    "RANDOM_6",
    "RANDOM_9",
    "RANDOM_20BIT",
    "RANDOM_32BIT",
    "GUID",
    "DATE"
];

const CustomIdTab = ({ inventory, refresh }) => {
    const [config, setConfig] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const {t} = useContext(LanguageContext)

    useEffect(() => {
        setConfig(
            (inventory.customIdConfig || []).map(el => ({
                _id: crypto.randomUUID(),
                ...el
            }))
        );
    }, [inventory]);

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleDeleteSelected = () => {
        setConfig(prev =>
            prev.filter(el => !selectedIds.includes(el._id))
        );

        setSelectedIds([]);
        setHasChanges(true);
    };

    const handleAdd = () => {
        setConfig(prev => [
            ...prev,
            {
                _id: crypto.randomUUID(),
                type: "TEXT",
                value: ""
            }
        ]);
        setHasChanges(true);
    };

    const updateElement = (index, key, value) => {
        const updated = [...config];
        updated[index][key] = value;
        setConfig(updated);
        setHasChanges(true);
    };

    const handleSave = async () => {
        const cleanConfig = config.map(({ _id, ...rest }) => rest);

        await api.put(`/inventories/${inventory.id}/custom-id`, {
            customIdConfig: cleanConfig,
            version: inventory.version
        });

        setHasChanges(false);
        refresh();
    };

    const generatePreview = () => {
        return config.map(el => {
            switch (el.type) {

                case "TEXT":
                    return el.value || "";
                case "SEQUENCE":
                    return "1";
                case "RANDOM_6":
                    return String(
                        Math.floor(Math.random() * 1_000_000)
                    ).padStart(6, "0");
                case "RANDOM_9":
                    return String(
                        Math.floor(Math.random() * 1_000_000_000)
                    ).padStart(9, "0");
                case "RANDOM_20BIT":
                    return Math.floor(
                        Math.random() * (2 ** 20)
                    ).toString();
                case "RANDOM_32BIT":
                    return Math.floor(
                        Math.random() * (2 ** 32)
                    ).toString();
                case "GUID":
                    return crypto.randomUUID();
                case "DATE":
                    return new Date().toISOString().slice(0, 10);
                default:
                    return "";
            }
        }).join("");
    };

    return (
        <>
            <div style={{ marginTop: 20, fontWeight: "bold" }}>
                {t.preview}: {generatePreview()}
            </div>
            <div style={{display: "flex", gap: 10, marginTop: 20}}>
                <Button type="primary" onClick={handleAdd}>
                    {t.addElement}
                </Button>
                <Button
                    danger
                    disabled={!selectedIds.length}
                    onClick={handleDeleteSelected}
                >
                    {t.deleteSelected}
                </Button>
                <Button
                    type="primary"
                    disabled={!hasChanges}
                    onClick={handleSave}
                >
                    {t.save}
                </Button>
            </div>
            <div style={{ marginTop: 20 }}>
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => {
                        const { active, over } = event;

                        if (active.id !== over?.id) {
                            setConfig((items) => {
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
                        items={config.map(i => i._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {config.map((element, index) => (
                            <SortableItem
                                key={element._id}
                                id={element._id}
                                element={element}
                                index={index}
                                updateElement={updateElement}
                                selectedIds={selectedIds}
                                toggleSelect={toggleSelect}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        </>
    );
};

const SortableItem = ({ id, element, index, updateElement, selectedIds, toggleSelect }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition
    } = useSortable({ id });

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
                style={{
                    cursor: "grab",
                    padding: "4px 8px",
                    background: "#eee",
                    borderRadius: 4
                }}
            >
                ☰
            </div>

            <Select
                value={element.type}
                onChange={(value) =>
                    updateElement(index, "type", value)
                }
                options={ELEMENT_TYPES.map(t => ({ value: t }))}
                style={{ width: 150 }}
            />

            {element.type === "TEXT" && (
                <Input
                    placeholder="Enter text"
                    value={element.value}
                    onChange={(e) =>
                        updateElement(index, "value", e.target.value)
                    }
                    style={{ width: 200 }}
                />
            )}
        </div>
    );
};

export default CustomIdTab;