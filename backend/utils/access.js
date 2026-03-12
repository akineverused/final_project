export const canViewInventory = (user, inventory) => {
    if (!inventory) return false;
    return !!user;
};

export const canEditInventory = (user, inventory) => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return inventory.ownerId === user.id;
};

export const canCreateItem = (user, inventory) => {
    if (!user) return false;

    if (user.role === "ADMIN") return true;

    if (inventory.ownerId === user.id) return true;

    if (inventory.isPublic) return true;

    const hasAccess = inventory.accessList?.some(
        (a) => a.userId === user.id
    );

    return !!hasAccess;
};

export const canManageInventory = (user, inventory) => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return inventory.ownerId === user.id;
};