import { createContext, useState, useEffect } from "react";

export const LanguageContext = createContext();

const translations = {
    en: {
        search: "Search inventories...",
        dashboard: "Home",
        create: "Create Inventory",
        profile: "Profile",
        logout: "Logout",
        language: "Language",
        theme: "Theme",
        latest: "Latest Inventories",
        popular: "Top 5 Popular",
        items: "Items",
        discussion: "Discussion",
        generalSettings: "General Settings",
        customId: "Custom ID",
        accessSettings: "Access Settings",
        fields: "Fields",
        statistics: "Statistics",
        addItem: "Add Item",
        delete: "Delete",
        writeComment: "Write a comment (Markdown supported)",
        post: "Post",
        title: "Title",
        description: "Description (Markdown supported)",
        category: "Category",
        imageUrl: "Image URL",
        equipment: "Equipment",
        furniture: "Furniture",
        book: "Book",
        other: "Other",
        tags: "Tags",
        pasteImageUrl: "Paste image URL",
        publicInventory: "Public inventory",
        saveChanges: "Save changes",
        deleteInventory: "Delete inventory",
        preview: "Preview",
        addElement: "Add Element",
        deleteSelected: "Delete Selected",
        save: "Save",
        publicAccessDesc: "Public inventory (all authenticated users have access)",
        addField: "Add Field",
    },
    ru: {
        search: "Поиск инвентарей...",
        dashboard: "Главная",
        create: "Создать инвентарь",
        profile: "Профиль",
        logout: "Выйти",
        language: "Язык",
        theme: "Тема",
        latest: "Последние инвентари",
        popular: "Топ-5 популярных",
        items: "Предметы",
        discussion: "Обсуждение",
        generalSettings: "Общие настройки",
        customId: "Кастомный ID",
        accessSettings: "Настройки доступа",
        fields: "Поля",
        statistics: "Статистика",
        addItem: "Добавить предмет",
        delete: "Удалить",
        writeComment: "Написать комментарий (поддержка Markdown)",
        post: "Опубликовать",
        title: "Название",
        description: "Описание (поддержка Markdown)",
        category: "Категория",
        imageUrl: "URL изображения",
        equipment: "Снаряжение",
        furniture: "Мебель",
        book: "Книга",
        other: "Другое",
        tags: "Теги",
        pasteImageUrl: "Вставьте ссылку на изображение",
        publicInventory: "Публичный инвентарь",
        saveChanges: "Сохранить изменения",
        deleteInventory: "Удалить инвентарь",
        preview: "Предпросмотр",
        addElement: "Добавить элемент",
        deleteSelected: "Удалить выбранные",
        save: "Сохранить",
        publicAccessDesc: "Публичный инвентарь (доступен всем авторизованным пользователям)",
        addField: "Добавить поле",
    }
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(
        localStorage.getItem("lang") || "en"
    );

    useEffect(() => {
        localStorage.setItem("lang", lang);
    }, [lang]);

    return (
        <LanguageContext.Provider
            value={{
                lang,
                setLang,
                t: translations[lang]
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};