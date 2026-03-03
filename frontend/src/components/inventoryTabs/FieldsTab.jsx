import React, {useContext, useEffect, useState} from 'react';
import api from "../../api/axios.js";
import {Button, Input, List, message, Select} from "antd";
import {LanguageContext} from "../../context/LanguageContext.jsx";

const FieldsTab = ({ inventoryId }) => {
    const [fields, setFields] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const {t} = useContext(LanguageContext);

    useEffect(()=> {
        loadFields();
    },[inventoryId])

    const loadFields = async () => {
        const res = await api.get(`/custom-fields/${inventoryId}`);
        setFields(res.data);
    };

    const handleAdd = () => {
        const newField = {
            tempId: Date.now(),
            title: "",
            type: "STRING",
            showInTable: true,
            isNew: true
        };

        setFields(prev => [newField, ...prev]);
        setHasChanges(true);
    };

    const updateField = (index, key, value) => {
        const updated = [...fields];
        updated[index][key] = value;
        setFields(updated);
        setHasChanges(true);
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
            prev.filter(field =>
                !selectedIds.includes(field.id) &&
                !selectedIds.includes(field.tempId)
            )
        );

        setSelectedIds([]);
        setHasChanges(true);
    };

    const handleSave = async () => {
        await api.put(`/custom-fields/${inventoryId}`, {
            fields
        });

        setHasChanges(false);
        loadFields();
    };

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={handleAdd}>
                    {t.addField}
                </Button>

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

            {fields.map((field, index) => (
                <div
                    key={field.id || field.tempId}
                    style={{
                        display: "flex",
                        gap: 12,
                        marginBottom: 8,
                        alignItems: "center"
                    }}
                >
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(field.id || field.tempId)}
                        onChange={() =>
                            toggleSelect(field.id || field.tempId)
                        }
                    />

                    <Input
                        value={field.title}
                        onChange={(e) =>
                            updateField(index, "title", e.target.value)
                        }
                    />

                    <Select
                        value={field.type}
                        onChange={(value) =>
                            updateField(index, "type", value)
                        }
                        options={[
                            { value: "STRING" },
                            { value: "NUMBER" },
                            { value: "BOOLEAN" },
                            { value: "DATE" },
                            { value: "TEXT" },
                        ]}
                        style={{ width: 150 }}
                    />
                </div>
            ))}
        </>
    );
};

export default FieldsTab;