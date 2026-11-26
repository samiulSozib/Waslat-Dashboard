'use client';

/**
 * Compatibility wrapper — old CustomDropdownWithSearch API,
 * new elegant SearchSelect UI (no indigo / inline styles).
 */
import SearchSelect, { type SearchSelectProps } from '@/components/admin/search-select';

type Indexable = { [key: string]: any };

interface CustomDropdownWithSearchProps<T extends Indexable = any> extends Omit<SearchSelectProps<T>, 'liveSearch'> {
    filterPlaceholder?: string;
    panelClassName?: string;
    required?: boolean;
    label?: string;
    errorMessage?: string;
    id?: string;
    name?: string;
    searchButtonText?: string;
    noDataMessage?: string;
}

function CustomDropdownWithSearch<T extends Indexable = any>({
    filterPlaceholder,
    searchPlaceholder,
    panelClassName: _panel,
    required: _req,
    label: _label,
    errorMessage: _errMsg,
    id: _id,
    name: _name,
    searchButtonText: _btn,
    noDataMessage: _noData,
    ...rest
}: CustomDropdownWithSearchProps<T>) {
    return (
        <SearchSelect
            {...rest}
            searchPlaceholder={searchPlaceholder || filterPlaceholder || 'جستجو…'}
            liveSearch
        />
    );
}

export default CustomDropdownWithSearch;
