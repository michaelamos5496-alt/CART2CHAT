"use client";

import * as React from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createProductOption,
  createProductOptionValue,
  deleteProductOption,
  deleteProductOptionValue,
} from "@/features/products/lib/mutations";
import type { ProductOptionWithValues } from "@/types/catalog";
import type { BusinessCategory } from "@/types/business";

// Light, non-blocking nudge toward common option names for the business's
// own category — never enforced, just a placeholder hint. Any business can
// add whatever option groups suit their own catalog regardless of category.
const CATEGORY_SUGGESTIONS: Record<BusinessCategory, string> = {
  fashion_apparel: "e.g. Size, Color",
  food_beverage: "e.g. Flavor, Spice level",
  beauty_cosmetics: "e.g. Shade, Scent",
  electronics: "e.g. Storage, Color",
  home_living: "e.g. Size, Material",
  jewelry_accessories: "e.g. Size, Metal",
  health_wellness: "e.g. Strength, Size",
  other: "e.g. Size, Color",
};

function OptionValueChip({
  value,
  onRemove,
}: {
  value: string;
  onRemove: () => Promise<void>;
}) {
  const [isRemoving, setIsRemoving] = React.useState(false);

  async function handleRemove() {
    setIsRemoving(true);
    try {
      await onRemove();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove value",
      );
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <span className="bg-muted flex items-center gap-1 rounded-full py-1 pr-1 pl-2.5 text-sm">
      {value}
      <button
        type="button"
        onClick={handleRemove}
        disabled={isRemoving}
        className="hover:bg-background flex size-5 items-center justify-center rounded-full disabled:opacity-50"
        aria-label={`Remove ${value}`}
      >
        {isRemoving ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <X className="size-3" />
        )}
      </button>
    </span>
  );
}

function OptionGroup({
  option,
  onRemoveOption,
  onValuesChange,
}: {
  option: ProductOptionWithValues;
  onRemoveOption: () => Promise<void>;
  onValuesChange: (values: ProductOptionWithValues["values"]) => void;
}) {
  const [newValue, setNewValue] = React.useState("");
  const [isAddingValue, setIsAddingValue] = React.useState(false);
  const [isRemovingOption, setIsRemovingOption] = React.useState(false);

  async function handleAddValue(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = newValue.trim();
    if (!trimmed) return;

    setIsAddingValue(true);
    try {
      const created = await createProductOptionValue(
        option.id,
        option.business_id,
        trimmed,
        option.values.length,
      );
      onValuesChange([...option.values, created]);
      setNewValue("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add value",
      );
    } finally {
      setIsAddingValue(false);
    }
  }

  async function handleRemoveOption() {
    setIsRemovingOption(true);
    try {
      await onRemoveOption();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove option",
      );
      setIsRemovingOption(false);
    }
  }

  return (
    <div className="grid gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{option.name}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemoveOption}
          disabled={isRemovingOption}
        >
          {isRemovingOption ? "Removing..." : "Remove option"}
        </Button>
      </div>

      {option.values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {option.values.map((value) => (
            <OptionValueChip
              key={value.id}
              value={value.value}
              onRemove={async () => {
                await deleteProductOptionValue(value.id);
                onValuesChange(
                  option.values.filter((v) => v.id !== value.id),
                );
              }}
            />
          ))}
        </div>
      )}

      <form onSubmit={handleAddValue} className="flex gap-2">
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={`Add a ${option.name.toLowerCase()} value`}
          disabled={isAddingValue}
          className="h-8"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={isAddingValue || !newValue.trim()}
        >
          {isAddingValue ? <Loader2 className="animate-spin" /> : <Plus />}
          Add
        </Button>
      </form>
    </div>
  );
}

export function ProductOptionsManager({
  businessId,
  productId,
  initialOptions,
  businessCategory = "other",
}: {
  businessId: string;
  productId: string;
  initialOptions: ProductOptionWithValues[];
  businessCategory?: BusinessCategory;
}) {
  const [options, setOptions] = React.useState(initialOptions);
  const [newOptionName, setNewOptionName] = React.useState("");
  const [isAddingOption, setIsAddingOption] = React.useState(false);

  async function handleAddOption(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = newOptionName.trim();
    if (!trimmed) return;

    setIsAddingOption(true);
    try {
      const created = await createProductOption(
        businessId,
        productId,
        trimmed,
        options.length,
      );
      setOptions([...options, { ...created, values: [] }]);
      setNewOptionName("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add option",
      );
    } finally {
      setIsAddingOption(false);
    }
  }

  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <OptionGroup
          key={option.id}
          option={option}
          onRemoveOption={async () => {
            await deleteProductOption(option.id);
            setOptions((prev) => prev.filter((o) => o.id !== option.id));
          }}
          onValuesChange={(values) =>
            setOptions((prev) =>
              prev.map((o) => (o.id === option.id ? { ...o, values } : o)),
            )
          }
        />
      ))}

      <form onSubmit={handleAddOption} className="flex gap-2">
        <Input
          value={newOptionName}
          onChange={(e) => setNewOptionName(e.target.value)}
          placeholder={CATEGORY_SUGGESTIONS[businessCategory]}
          disabled={isAddingOption}
        />
        <Button
          type="submit"
          variant="outline"
          disabled={isAddingOption || !newOptionName.trim()}
        >
          {isAddingOption ? <Loader2 className="animate-spin" /> : <Plus />}
          Add option
        </Button>
      </form>
      <p className="text-muted-foreground text-xs">
        Customers will need to pick a value for every option before adding
        this product to their cart. Leave empty if this product doesn&apos;t
        need any.
      </p>
    </div>
  );
}
