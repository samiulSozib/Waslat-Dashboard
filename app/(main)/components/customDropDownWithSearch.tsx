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
    returnFullObject?: boolean; // New prop to control return type
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
    returnFullObject = true // Default to returning the full object
}: CustomDropdownWithSearchProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<T[]>(options);
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
                setSearchValue('');
                setHasSearched(false);
                setSearchResults([]);
                setFilteredOptions(options);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [options]);

    const getOptionLabel = (option: T): string => {
        if (!option) return '';
        if (typeof option === 'string') return option;
        if (typeof option === 'number') return String(option);

        // Safely access properties using the optionLabel or common keys
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

        // Safely access properties using the optionValue or common keys
        if (optionValue && option[optionValue] !== undefined) {
            return option[optionValue];
        }
        if (option.value !== undefined) return option.value;
        if (option.id !== undefined) return option.id;

        return option;
    };

    const getSelectedDisplayValue = (): string => {
        if (!value) return '';

        // If value is an object, try to get its label
        if (typeof value === 'object' && value !== null) {
            return getOptionLabel(value);
        }

        // Find the option that matches the selected value
        const selectedOption = options.find(opt => getOptionValue(opt) === value);
        if (selectedOption) {
            return getOptionLabel(selectedOption);
        }

        return String(value);
    };

    // Get the full object from the value (for display purposes)
    const getSelectedObject = (): T | null => {
        if (!value) return null;

        // If value is already an object, return it
        if (typeof value === 'object' && value !== null) {
            return value;
        }

        // Find the option that matches the selected value
        const selectedOption = options.find(opt => getOptionValue(opt) === value);
        return selectedOption || null;
    };

    const handleSearch = () => {
        if (!searchValue.trim()) {
            return;
        }

        const searchTerm = searchValue.toLowerCase().trim();
        const results = options.filter((option: T) => {
            if (!option) return false;
            const displayText = getOptionLabel(option)?.toLowerCase() || '';
            return displayText.includes(searchTerm);
        });

        setSearchResults(results);
        setFilteredOptions(results);
        setHasSearched(true);
        setIsOpen(true);

        if (onSearch) {
            onSearch(searchValue);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSelect = (option: T) => {
        // Return either the full object or just the value based on prop
        const selectedValue = returnFullObject ? option : getOptionValue(option);
        onChange(selectedValue);
        setIsOpen(false);
        setSearchValue('');
        setHasSearched(false);
        setSearchResults([]);
        setFilteredOptions(options);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setIsOpen(false);
        setSearchValue('');
        setHasSearched(false);
        setSearchResults([]);
        setFilteredOptions(options);
    };

    const clearAll = () => {
        setSearchValue('');
        setHasSearched(false);
        setSearchResults([]);
        setFilteredOptions(options);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                // When opening, reset search state
                setSearchValue('');
                setHasSearched(false);
                setSearchResults([]);
                setFilteredOptions(options);
                // Focus search input after dropdown opens
                setTimeout(() => {
                    if (searchInputRef.current) {
                        searchInputRef.current.focus();
                    }
                }, 100);
            }
        }
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

        // If value is an object, use it directly
        if (typeof value === 'object' && value !== null) {
            if (valueTemplate) {
                return valueTemplate(value);
            }
            return <span style={{ fontWeight: 'bold' }}>{getOptionLabel(value)}</span>;
        }

        // If value is a primitive, find the option
        const selectedOption = options.find(opt => getOptionValue(opt) === value);
        if (selectedOption) {
            if (valueTemplate) {
                return valueTemplate(selectedOption);
            }
            return <span style={{ fontWeight: 'bold' }}>{getOptionLabel(selectedOption)}</span>;
        }

        return <span style={{ fontWeight: 'bold' }}>{String(value)}</span>;
    };

    const displayOptions = hasSearched ? filteredOptions : options;

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
                    placeholder={filterPlaceholder}
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
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#5C6AC4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a56a8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5C6AC4'}
                >
                    {searchButtonText}
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
                        Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </span>
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
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.6 : 1,
                    transition: 'border-color 0.2s'
                }}
                onClick={toggleDropdown}
                onMouseEnter={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.borderColor = '#5C6AC4';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.borderColor = error ? '#f44336' : '#e9ecef';
                    }
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
                    <button
                        style={{
                            padding: '4px 14px',
                            backgroundColor: 'transparent',
                            color: '#5C6AC4',
                            border: '2px solid #5C6AC4',
                            borderRadius: '6px',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown();
                        }}
                        onMouseEnter={(e) => {
                            if (!disabled) {
                                e.currentTarget.style.backgroundColor = '#5C6AC4';
                                e.currentTarget.style.color = 'white';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!disabled) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#5C6AC4';
                            }
                        }}
                    >
                        {isOpen ? 'Close' : 'Change'}
                    </button>
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
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <span style={{ color: '#6c757d', fontSize: '14px' }}>
                            {displayOptions.length} {displayOptions.length === 1 ? 'result' : 'results'}
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
                        {displayOptions.length > 0 ? (
                            displayOptions.map((option, index) => (
                                <div
                                    key={index}
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
                                <div>{emptyMessage}</div>
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
