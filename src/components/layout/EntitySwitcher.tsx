import React, { useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useEntityStore } from '@/store/entityStore';
import { RbacService } from '@/services/rbac.service';

/**
 * Entity (plant) switcher in the header. Hidden while the user has access to
 * at most one entity — which keeps the UI unchanged for single-plant clients.
 * The selection is sent as X-Entity-Id on every API request (see lib/api.ts)
 * so new documents are stamped with the chosen entity.
 */
const EntitySwitcher: React.FC = () => {
  const { entities, selectedEntityId, selectEntity, setScope } =
    useEntityStore();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Refresh scope on mount (Header mounts once per login)
  useEffect(() => {
    let cancelled = false;
    RbacService.getMyScope()
      .then(scope => {
        if (!cancelled) {
          setScope(scope.entities ?? [], scope.defaultEntityId ?? null);
        }
      })
      .catch(() => {
        /* endpoint unavailable (old backend) — switcher stays hidden */
      });
    return () => {
      cancelled = true;
    };
  }, [setScope]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (entities.length <= 1) {
    return null;
  }

  const selected = entities.find(e => e.id === selectedEntityId);

  return (
    <div className='relative' ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent border border-white/20 text-white/90 text-sm hover:bg-white/10 transition-colors'
        title='Switch entity'
      >
        <Building2 className='w-4 h-4' />
        <span className='hidden md:inline max-w-[140px] truncate'>
          {selected ? selected.name : 'Select entity'}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50'>
          <div className='px-4 py-2.5 bg-gray-50 border-b border-gray-100'>
            <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
              Working entity
            </span>
          </div>
          <div className='py-1 max-h-[300px] overflow-y-auto'>
            {entities.map(entity => (
              <button
                key={entity.id}
                onClick={() => {
                  selectEntity(entity.id);
                  setIsOpen(false);
                }}
                className='w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors'
              >
                <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500'>
                  <Building2 className='w-4 h-4' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='text-sm font-medium text-gray-900 truncate'>
                    {entity.name}
                  </div>
                  <div className='text-xs text-gray-400'>
                    {entity.code} · {entity.type}
                  </div>
                </div>
                {entity.id === selectedEntityId && (
                  <Check className='w-4 h-4 text-violet-600 flex-shrink-0' />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EntitySwitcher;
