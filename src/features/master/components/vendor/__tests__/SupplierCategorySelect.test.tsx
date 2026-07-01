import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';

import SupplierCategorySelect from '../SupplierCategorySelect';
import type { SupplierCategory } from '../../../hooks/useSupplierCategoryAPI';

const CATEGORIES: SupplierCategory[] = [
  { id: 1, name: 'Logistics' },
  { id: 2, name: 'IT Services', code: 'ITS' },
  { id: 3, name: 'Raw Materials' },
];

/**
 * Controlled harness so onChange-driven selection is reflected back into the
 * component (mirrors how VendorForm wires it).
 */
const Harness: React.FC<{
  initial?: number[];
  categories?: SupplierCategory[];
  onCreate?: (name: string) => Promise<SupplierCategory>;
  isCreating?: boolean;
  disabled?: boolean;
}> = ({
  initial = [],
  categories = CATEGORIES,
  onCreate = async name => ({ id: 99, name }),
  isCreating = false,
  disabled = false,
}) => {
  const [value, setValue] = useState<number[]>(initial);
  return (
    <SupplierCategorySelect
      categories={categories}
      value={value}
      onChange={setValue}
      onCreate={onCreate}
      isCreating={isCreating}
      disabled={disabled}
    />
  );
};

const openDropdown = () => {
  const input = screen.getByRole('combobox');
  fireEvent.focus(input);
  return input;
};

const type = (input: HTMLElement, text: string) => {
  fireEvent.change(input, { target: { value: text } });
};

describe('SupplierCategorySelect', () => {
  it('lists existing categories when opened', () => {
    render(<Harness />);
    openDropdown();

    expect(screen.getByText('Logistics')).toBeInTheDocument();
    expect(screen.getByText('IT Services')).toBeInTheDocument();
    expect(screen.getByText('Raw Materials')).toBeInTheDocument();
  });

  it('filters the list as the user types', () => {
    render(<Harness />);
    const input = openDropdown();
    type(input, 'raw');

    expect(screen.getByText('Raw Materials')).toBeInTheDocument();
    expect(screen.queryByText('Logistics')).not.toBeInTheDocument();
    expect(screen.queryByText('IT Services')).not.toBeInTheDocument();
  });

  it('offers "Create" only when the typed text has no existing match', () => {
    render(<Harness />);
    const input = openDropdown();
    type(input, 'Marketing');

    expect(screen.getByText('Create "Marketing"')).toBeInTheDocument();
  });

  it('does NOT offer "Create" when an exact (case-insensitive) match exists', () => {
    render(<Harness />);
    const input = openDropdown();
    type(input, 'logistics'); // existing "Logistics"

    expect(screen.getByText('Logistics')).toBeInTheDocument();
    expect(screen.queryByText(/^Create/)).not.toBeInTheDocument();
  });

  it('treats whitespace-padded text as a match (no duplicate create)', () => {
    render(<Harness />);
    const input = openDropdown();
    type(input, '  Logistics  ');

    expect(screen.queryByText(/^Create/)).not.toBeInTheDocument();
  });

  it('does not offer create for whitespace-only input', () => {
    render(<Harness />);
    const input = openDropdown();
    type(input, '   ');

    expect(screen.queryByText(/^Create/)).not.toBeInTheDocument();
  });

  it('selects a category on click and shows a removable chip', () => {
    render(<Harness />);
    openDropdown();

    fireEvent.click(screen.getByText('Logistics'));

    expect(
      screen.getByRole('button', { name: 'Remove Logistics' })
    ).toBeInTheDocument();
    expect(screen.getByText('1 category selected')).toBeInTheDocument();
  });

  it('supports selecting multiple categories', () => {
    render(<Harness />);
    openDropdown();

    fireEvent.click(screen.getByText('Logistics'));
    fireEvent.click(screen.getByText('IT Services'));

    expect(screen.getByText('2 categories selected')).toBeInTheDocument();
  });

  it('removes a selected category via its chip', () => {
    render(<Harness initial={[1]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Logistics' }));

    expect(
      screen.queryByRole('button', { name: 'Remove Logistics' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('0 categories selected')).toBeInTheDocument();
  });

  it('creates a new category, auto-selects it, and clears the search', async () => {
    const onCreate = jest.fn().mockResolvedValue({ id: 42, name: 'Marketing' });
    render(<Harness onCreate={onCreate} />);

    const input = openDropdown();
    type(input, 'Marketing');
    fireEvent.click(screen.getByText('Create "Marketing"'));

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith('Marketing'));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Remove Marketing' })
      ).toBeInTheDocument()
    );
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('trims and collapses whitespace before creating', async () => {
    const onCreate = jest
      .fn()
      .mockResolvedValue({ id: 43, name: 'Office Supplies' });
    render(<Harness onCreate={onCreate} />);

    const input = openDropdown();
    type(input, '  Office   Supplies  ');
    fireEvent.click(screen.getByText('Create "Office   Supplies"'));

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith('Office Supplies')
    );
  });

  it('surfaces an error message when creation fails', async () => {
    const onCreate = jest
      .fn()
      .mockRejectedValue(new Error('Category already exists'));
    render(<Harness onCreate={onCreate} />);

    const input = openDropdown();
    type(input, 'Dupe');
    fireEvent.click(screen.getByText('Create "Dupe"'));

    await waitFor(() =>
      expect(screen.getByText('Category already exists')).toBeInTheDocument()
    );
  });

  it('disables interaction when disabled', () => {
    render(<Harness initial={[1]} disabled />);

    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Remove Logistics' })
    ).toBeDisabled();
  });
});
