import React, { useMemo, useRef, useState } from 'react';
import { Check, Plus, Search, X } from 'lucide-react';
import type { SupplierCategory } from '../../hooks/useSupplierCategoryAPI';

export interface SupplierCategorySelectProps {
  /** Full list of known supplier categories (from the master). */
  categories: SupplierCategory[];
  /** Currently selected category ids. */
  value: number[];
  /** Called with the new selection whenever it changes. */
  onChange: (ids: number[]) => void;
  /**
   * Creates a brand-new category. Should resolve to the created record so it can be
   * auto-selected. Errors are surfaced inline; the promise may reject.
   */
  onCreate: (name: string) => Promise<SupplierCategory>;
  isCreating?: boolean;
  disabled?: boolean;
}

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Searchable, multi-select category picker with inline "create if missing".
 *
 * Guardrail: the create affordance only appears when the typed text has no
 * case-insensitive match among existing categories — search-first de-duplication
 * so users pick "Logistics" instead of minting "logistics" / "Logistics ".
 */
const SupplierCategorySelect: React.FC<SupplierCategorySelectProps> = ({
  categories,
  value,
  onChange,
  onCreate,
  isCreating = false,
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Categories created in this session, kept locally so chips render immediately
  // (before the master list refetch lands).
  const [localExtras, setLocalExtras] = useState<SupplierCategory[]>([]);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allCategories = useMemo(() => {
    const byId = new Map<number, SupplierCategory>();
    [...categories, ...localExtras].forEach(c => byId.set(c.id, c));
    return Array.from(byId.values());
  }, [categories, localExtras]);

  const normalizedQuery = normalize(query);

  const filtered = useMemo(() => {
    if (!normalizedQuery) return allCategories;
    return allCategories.filter(c =>
      normalize(c.name).includes(normalizedQuery)
    );
  }, [allCategories, normalizedQuery]);

  const hasExactMatch = useMemo(
    () => allCategories.some(c => normalize(c.name) === normalizedQuery),
    [allCategories, normalizedQuery]
  );

  const showCreate = normalizedQuery.length > 0 && !hasExactMatch;

  const selected = useMemo(
    () => allCategories.filter(c => value.includes(c.id)),
    [allCategories, value]
  );

  const toggle = (id: number) => {
    if (disabled) return;
    setError(null);
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);
  };

  const remove = (id: number) => {
    if (disabled) return;
    onChange(value.filter(v => v !== id));
  };

  const handleCreate = async () => {
    const name = query.trim().replace(/\s+/g, ' ');
    if (!name || isCreating || disabled) return;
    setError(null);
    try {
      const created = await onCreate(name);
      if (created && typeof created.id === 'number') {
        setLocalExtras(prev =>
          prev.some(c => c.id === created.id) ? prev : [...prev, created]
        );
        if (!value.includes(created.id)) {
          onChange([...value, created.id]);
        }
      }
      setQuery('');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not create the category'
      );
    }
  };

  const handleOpen = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setOpen(true);
  };

  const handleBlur = () => {
    // Delay so a click on an option/create row is registered before closing.
    blurTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className='space-y-3'>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {selected.map(cat => (
            <span
              key={cat.id}
              className='inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700'
            >
              {cat.name}
              <button
                type='button'
                aria-label={`Remove ${cat.name}`}
                onClick={() => remove(cat.id)}
                disabled={disabled}
                className='rounded-full p-0.5 text-violet-500 hover:bg-violet-200 hover:text-violet-800 disabled:opacity-50'
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search + dropdown */}
      <div className='relative'>
        <div className='relative'>
          <Search
            size={16}
            className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
          />
          <input
            type='text'
            role='combobox'
            aria-expanded={open}
            aria-label='Search or add a supplier category'
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={handleOpen}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder='Search or add a category...'
            className='w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-50'
          />
        </div>

        {open && (
          <div className='absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg'>
            {filtered.length === 0 && !showCreate && (
              <p className='px-3 py-2 text-sm text-gray-500'>
                No categories found
              </p>
            )}

            {filtered.map(cat => {
              const isSelected = value.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type='button'
                  role='option'
                  aria-selected={isSelected}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => toggle(cat.id)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                    isSelected ? 'text-violet-700' : 'text-gray-700'
                  }`}
                >
                  <span>
                    {cat.name}
                    {cat.code && (
                      <span className='ml-2 text-xs text-gray-400'>
                        {cat.code}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <Check size={15} className='text-violet-600' />
                  )}
                </button>
              );
            })}

            {showCreate && (
              <button
                type='button'
                onMouseDown={e => e.preventDefault()}
                onClick={handleCreate}
                disabled={isCreating}
                className='flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm font-medium text-violet-600 transition-colors hover:bg-violet-50 disabled:opacity-60'
              >
                <Plus size={15} />
                {isCreating ? 'Creating...' : `Create "${query.trim()}"`}
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className='text-sm text-red-500'>{error}</p>}

      <p className='text-xs text-gray-500'>
        {selected.length} {selected.length === 1 ? 'category' : 'categories'}{' '}
        selected
      </p>
    </div>
  );
};

export default SupplierCategorySelect;
