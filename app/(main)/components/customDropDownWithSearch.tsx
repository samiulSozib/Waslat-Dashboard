// components/CustomDropdownWithSearch.tsx
import React, { useState, useRef, useEffect } from 'react';

// Define a type that can be indexed with a string
type Indexable = {
    [key: string]: any;
};

interface CustomDropdownWithSearchProps<T extends Indexable = any> {
    value: T | any;
    options: T[];
    onChange: (value: any) => void;
    optionLabel?: string;
    optionValue?: string;
    placeholder?: string;
    filterPlaceholder?: string;
    className?: string;
    panelClassName?: string;
    required?: boolean;
    disabled?: boolean;
    itemTemplate?: (option: T) => React.ReactNode;
    valueTemplate?: (option: T) => React.ReactNode;
    label?: string;
    error?: boolean;
    errorMessage?: string;
    id?: string;
    name?: string;
    showClear?: boolean;
    onSearch?: (searchTerm: string) => void;
    searchButtonText?: string;
    emptyMessage?: string;
    noResultsMessage?: string;
    returnFullObject?: boolean;
    isLoading?: boolean;
    searchPlaceholder?: string;
    noDataMessage?: string;
}

function CustomDropdownWithSearch<T extends Indexable = any>({
    value,
    options = [],
    onChange,
    optionLabel = 'label',
    optionValue = 'value',
    placeholder = 'Select...',
    filterPlaceholder = 'Search...',
    className = '',
    panelClassName = '',
    required = false,
    disabled = false,
    itemTemplate,
    valueTemplate,
    label,
    error = false,
    errorMessage = 'This field is required',
    id,
    name,
    showClear = false,
    onSearch,
    searchButtonText = 'Search',
    emptyMessage = 'No results found',
    noResultsMessage = 'Try a different search term',
    returnFullObject = true,
    isLoading = false,
    searchPlaceholder = 'Type to search...',
    noDataMessage = 'No data available'
}: CustomDropdownWithSearchProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<T[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchResults, setSearchResults] = useState<T[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('.custom-dropdown-panel')) return;
            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update filtered options when options prop changes (API response)
    useEffect(() => {
        console.log('Options updated:', options.length);
        if (hasSearched) {
            // If we have searched, update the filtered options
            setFilteredOptions(options);
            setSearchResults(options);

            // If there are results, keep dropdown open
            if (options.length > 0) {
                setIsOpen(true);
            }
        }
    }, [options, hasSearched]);

    const getOptionLabel = (option: T): string => {
        if (!option) return '';
        if (typeof option === 'string') return option;
        if (typeof option === 'number') return String(option);

        if (optionLabel && option[optionLabel] !== undefined) {
            return String(option[optionLabel]);
        }
        if (option.label !== undefined) return String(option.label);
        if (option.name !== undefined) return String(option.name);
        if (option.reseller_name !== undefined) return String(option.reseller_name);
        if (option.method_name !== undefined) return String(option.method_name);
        if (option.contact_name !== undefined) return String(option.contact_name);

        return String(option);
    };

    const getOptionValue = (option: T): any => {
        if (!option) return null;
        if (typeof option === 'string' || typeof option === 'number') return option;

        if (optionValue && option[optionValue] !== undefined) {
            return option[optionValue];
        }
        if (option.value !== undefined) return option.value;
        if (option.id !== undefined) return option.id;

        return option;
    };

    const getSelectedDisplayValue = (): string => {
        if (!value) return '';

        if (typeof value === 'object' && value !== null) {
            return getOptionLabel(value);
        }

        const selectedOption = options.find(opt => getOptionValue(opt) === value);
        if (selectedOption) {
            return getOptionLabel(selectedOption);
        }

        return String(value);
    };

    const handleSearch = () => {
        const searchTerm = searchValue.trim();

        // If search term is empty, show all options or clear
        if (!searchTerm) {
            setHasSearched(false);
            setFilteredOptions([]);
            setSearchResults([]);
            setIsOpen(false);
            return;
        }

        // First, filter locally for immediate feedback
        const localResults = options.filter((option: T) => {
            if (!option) return false;
            const displayText = getOptionLabel(option)?.toLowerCase() || '';
            return displayText.includes(searchTerm.toLowerCase().trim());
        });

        // Set local results immediately
        setSearchResults(localResults);
        setFilteredOptions(localResults);
        setHasSearched(true);
        setIsOpen(true);

        // Then call the parent's onSearch callback for API call
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    const handleSelect = (option: T) => {
        const selectedValue = returnFullObject ? option : getOptionValue(option);
        onChange(selectedValue);
        setIsOpen(false);
        setSearchValue('');
        setHasSearched(false);
        setSearchResults([]);
        setFilteredOptions([]);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setIsOpen(false);
        setSearchValue('');
        setHasSearched(false);
        setSearchResults([]);
        setFilteredOptions([]);
    };

    const clearAll = () => {
        setSearchValue('');
        setHasSearched(false);
        setSearchResults([]);
        setFilteredOptions([]);
        setIsOpen(false);
    };

    const renderDefaultItem = (option: T) => {
        if (itemTemplate) {
            return itemTemplate(option);
        }
        return <span>{getOptionLabel(option)}</span>;
    };

    const renderDefaultValue = () => {
        if (!value) {
            return <span style={{ color: '#adb5bd' }}>{placeholder}</span>;
        }

        if (typeof value === 'object' && value !== null) {
            if (valueTemplate) {
                return valueTemplate(value);
            }
            return <span style={{ fontWeight: 'bold' }}>{getOptionLabel(value)}</span>;
        }

        const selectedOption = options.find(opt => getOptionValue(opt) === value);
        if (selectedOption) {
            if (valueTemplate) {
                return valueTemplate(selectedOption);
            }
            return <span style={{ fontWeight: 'bold' }}>{getOptionLabel(selectedOption)}</span>;
        }

        return <span style={{ fontWeight: 'bold' }}>{String(value)}</span>;
    };

    // Determine which options to display
    const displayOptions = hasSearched ? filteredOptions : [];

    return (
        <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
            {label && (
                <label htmlFor={id} style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                    {label}
                </label>
            )}

            {/* Search Box */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={searchPlaceholder}
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: `2px solid ${error ? '#f44336' : '#e0e0e0'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#5C6AC4'}
                    onBlur={(e) => e.target.style.borderColor = error ? '#f44336' : '#e0e0e0'}
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isLoading ? '#a0a0a0' : '#5C6AC4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        transition: 'background-color 0.2s',
                        opacity: isLoading ? 0.7 : 1,
                        minWidth: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                        if (!isLoading) {
                            e.currentTarget.style.backgroundColor = '#4a56a8';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isLoading) {
                            e.currentTarget.style.backgroundColor = '#5C6AC4';
                        }
                    }}
                >
                    {isLoading ? (
                        <>
                            <span className="pi pi-spin pi-spinner" style={{ marginRight: '6px' }}></span>
                            Loading...
                        </>
                    ) : (
                        searchButtonText
                    )}
                </button>
            </div>

            {/* Results Info */}
            {hasSearched && (
                <div
                    style={{
                        fontSize: '13px',
                        color: '#6c757d',
                        marginBottom: '12px',
                        padding: '6px 12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <span>
                        {isLoading ? 'Searching...' : `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
                    </span>
                    {!isLoading && searchResults.length > 0 && (
                        <button
                            onClick={clearAll}
                            style={{
                                color: '#5C6AC4',
                                cursor: 'pointer',
                                background: 'none',
                                border: 'none',
                                fontSize: '13px',
                                textDecoration: 'underline'
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}

            {/* Selected Value */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: `2px solid ${error ? '#f44336' : '#e9ecef'}`,
                    marginBottom: '12px',
                    cursor: disabled ? 'not-allowed' : 'default',
                    opacity: disabled ? 0.6 : 1,
                    transition: 'border-color 0.2s'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <span style={{ color: '#6c757d', fontSize: '14px' }}>Selected:</span>
                    {renderDefaultValue()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {showClear && value && (
                        <span
                            onClick={handleClear}
                            style={{
                                cursor: 'pointer',
                                color: '#999',
                                fontSize: '14px',
                                padding: '2px 4px'
                            }}
                        >
                            ✕
                        </span>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && errorMessage && (
                <small style={{ color: '#f44336', display: 'block', marginTop: '4px' }}>
                    {errorMessage}
                </small>
            )}

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div
                    className={`custom-dropdown-panel ${panelClassName}`}
                    style={{
                        position: 'relative',
                        marginBottom: '16px'
                    }}
                >
                    <div
                        style={{
                            padding: '10px 16px',
                            backgroundColor: '#f8f9fa',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <span style={{ color: '#6c757d', fontSize: '14px' }}>
                            {isLoading ? 'Searching...' : `${displayOptions.length} ${displayOptions.length === 1 ? 'result' : 'results'}`}
                        </span>
                        <span>▼</span>
                    </div>
                    <div
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            maxHeight: '250px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        {isLoading ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                <div className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem', marginBottom: '8px' }}></div>
                                <div>Loading results...</div>
                            </div>
                        ) : displayOptions.length > 0 ? (
                            displayOptions.map((option, index) => (
                                <div
                                    key={option.id || index}
                                    style={{
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        borderBottom: index < displayOptions.length - 1 ? '1px solid #f1f3f5' : 'none',
                                        transition: 'background-color 0.15s'
                                    }}
                                    onClick={() => handleSelect(option)}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    {renderDefaultItem(option)}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                <div>😕 {emptyMessage}</div>
                                <div style={{ fontSize: '13px', marginTop: '4px' }}>
                                    {noResultsMessage}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-dropdown {
                    position: relative;
                    width: 100%;
                }
                .custom-dropdown-panel::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-dropdown-panel::-webkit-scrollbar-track {
                    background: #f1f3f5;
                    border-radius: 4px;
                }
                .custom-dropdown-panel::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 4px;
                }
                .custom-dropdown-panel::-webkit-scrollbar-thumb:hover {
                    background: #b0b3b8;
                }
            `}</style>
        </div>
    );
}

export default CustomDropdownWithSearch;
