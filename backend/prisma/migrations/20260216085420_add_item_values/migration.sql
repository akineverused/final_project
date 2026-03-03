-- CreateTable
CREATE TABLE "ItemFieldValue" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "customFieldId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ItemFieldValue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemFieldValue" ADD CONSTRAINT "ItemFieldValue_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemFieldValue" ADD CONSTRAINT "ItemFieldValue_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "CustomField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
