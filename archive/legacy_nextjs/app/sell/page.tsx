'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Smartphone, CheckCircle, AlertCircle, Sparkles, RefreshCw, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { searchPhones, getPhoneDetails } from '../../lib/api';

export interface Phone {
  id: string;
  brand: string;
  model: string;
  originalPrice?: number;
  currentMarketPrice?: number;
  image?: string;
  specs?: string;
}

type Condition = 'flawless' | 'good' | 'fair' | 'poor';

const CONDITION_MULTIPLIERS: Record<Condition, number> = {
  flawless: 0.85,
  good: 0.7,
  fair: 0.5,
  poor: 0.3,
};

const CONDITION_DESCRIPTIONS: Record<Condition, { label: string; tag: string; desc: string }> = {
  flawless: {
    label: 'Flawless',
    tag: '85% Value',
    desc: 'Like new. No scratches, dents, or signs of wear. Functions perfectly.',
  },
  good: {
    label: 'Good',
    tag: '70% Value',
    desc: 'Minor cosmetic wear or light scratches. Fully functional.',
  },
  fair: {
    label: 'Fair',
    tag: '50% Value',
    desc: 'Visible scratches or small dents. All core features work properly.',
  },
  poor: {
    label: 'Poor',
    tag: '30% Value',
    desc: 'Heavy wear, major scratches, or cracked body/glass. Power on guaranteed.',
  },
};

export default function SellPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Phone[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<Condition>('good');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 500ms Debounce search implementation
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const response = await searchPhones(query.trim());
        const phones = response.phones || [];
        setSearchResults(phones);
        setIsDropdownOpen(true);
        if (phones.length === 0) {
          setSearchError('No matching phones found. Please check your spelling or search another model.');
        }
      } catch (err) {
        console.error('Search failed:', err);
        setSearchError('Unable to connect to mobile database. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectPhone = async (phone: Phone) => {
    setIsDropdownOpen(false);
    setQuery(`${phone.brand} ${phone.model}`);
    setIsLoadingDetails(true);

    try {
      const detailsRes = await getPhoneDetails(phone.id);
      if (detailsRes && detailsRes.phone) {
        setSelectedPhone(detailsRes.phone);
      } else {
        setSelectedPhone(phone);
      }
    } catch {
      setSelectedPhone(phone);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Base price calculation
  const basePrice = selectedPhone
    ? selectedPhone.originalPrice || selectedPhone.currentMarketPrice || 25000
    : 0;

  // Valuation Quote calculation
  const calculatedQuote = Math.round(basePrice * CONDITION_MULTIPLIERS[selectedCondition]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 via-white to-gray-50 text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <Badge variant="teal" className="px-3 py-1 text-sm font-semibold uppercase tracking-wider">
            Instant Phone Valuation
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Sell Your Phone For <span className="text-teal-600">Top Cash</span>
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto text-base">
            Search for your phone model, choose its condition, and receive an instant guaranteed buyback quote backed by MobileAPI.
          </p>
        </div>

        {/* Search Section */}
        <Card className="shadow-lg border-teal-100">
          <CardHeader className="bg-teal-600 text-white rounded-t-xl">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
              <Search className="w-5 h-5" />
              1. Search Your Device
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 relative" ref={dropdownRef}>
            <div className="relative">
              <Input
                type="text"
                placeholder="Type brand or model (e.g. iPhone 15, Galaxy S24, OnePlus 12)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-11 pr-10 py-3 text-base border-gray-300 focus:border-teal-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              {isSearching && (
                <Loader2 className="w-5 h-5 text-teal-600 animate-spin absolute right-3.5 top-3.5" />
              )}
            </div>

            {/* Dropdown Search Results */}
            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute z-50 left-6 right-6 top-[80px] bg-white border border-teal-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto divide-y divide-gray-100">
                {searchResults.map((item) => {
                  const itemPrice = item.currentMarketPrice || item.originalPrice || 0;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectPhone(item)}
                      className="p-3.5 hover:bg-teal-50/80 cursor-pointer transition-colors flex items-center gap-4"
                    >
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=150&auto=format&fit=crop&q=80'}
                        alt={item.model}
                        className="w-12 h-12 object-contain bg-white p-1 rounded-lg border border-gray-100 flex-shrink-0"
                      />
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                            {item.brand}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {item.model}
                          </span>
                        </div>
                        {item.specs && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{item.specs}</p>
                        )}
                      </div>
                      {itemPrice > 0 && (
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs text-gray-400 block">Market MRP</span>
                          <span className="text-sm font-bold text-gray-800">₹{itemPrice.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error Message */}
            {searchError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                <span>{searchError}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Phone Details & Valuation */}
        {isLoadingDetails ? (
          <Card className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Fetching device valuation details...</p>
          </Card>
        ) : selectedPhone ? (
          <div className="space-y-8">
            
            {/* Selected Device Preview Card */}
            <Card className="border-teal-200 bg-gradient-to-r from-teal-50/30 to-white">
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-28 h-28 bg-white rounded-xl p-2 border border-teal-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <img
                    src={selectedPhone.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80'}
                    alt={selectedPhone.model}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-grow text-center md:text-left space-y-1">
                  <Badge variant="teal" className="mb-1">
                    {selectedPhone.brand}
                  </Badge>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPhone.model}</h2>
                  {selectedPhone.specs && (
                    <p className="text-sm text-gray-600">{selectedPhone.specs}</p>
                  )}
                  <div className="text-xs text-gray-500 pt-1">
                    Base Reference Price: <span className="font-semibold text-gray-700">₹{basePrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPhone(null);
                    setQuery('');
                  }}
                  className="flex items-center gap-1 text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Change Device
                </Button>
              </CardContent>
            </Card>

            {/* Condition Selector */}
            <Card>
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                  <Smartphone className="w-5 h-5 text-teal-600" />
                  2. Select Overall Phone Condition
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(Object.keys(CONDITION_MULTIPLIERS) as Condition[]).map((condKey) => {
                    const info = CONDITION_DESCRIPTIONS[condKey];
                    const isSelected = selectedCondition === condKey;

                    return (
                      <div
                        key={condKey}
                        onClick={() => setSelectedCondition(condKey)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-gray-900 flex items-center gap-2">
                            {info.label}
                            {isSelected && <CheckCircle className="w-4 h-4 text-teal-600" />}
                          </span>
                          <Badge variant={isSelected ? 'teal' : 'gray'}>
                            {info.tag}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{info.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Final Quote Display */}
            <Card className="bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 text-white shadow-xl">
              <CardContent className="p-8 text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-100">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Instant Buyback Quote
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-teal-100">Estimated Instant Cash Value</p>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    ₹{calculatedQuote.toLocaleString('en-IN')}
                  </div>
                </div>

                <p className="text-xs text-teal-100/90 max-w-md mx-auto">
                  Includes free doorstep pickup in your city, instant UPI payment upon evaluation, and secure data wipe guarantee.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto bg-amber-400 text-gray-900 hover:bg-amber-300 font-bold px-8 shadow-md"
                    onClick={() => alert(`Quote confirmed for ₹${calculatedQuote.toLocaleString('en-IN')}! Our agent will contact you for doorstep pickup.`)}
                  >
                    Sell Now for ₹{calculatedQuote.toLocaleString('en-IN')}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        ) : (
          /* Placeholder when no phone is selected */
          <div className="p-10 border-2 border-dashed border-gray-200 rounded-2xl text-center bg-white">
            <Smartphone className="w-12 h-12 text-teal-500/40 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No Phone Selected Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Use the search bar above to look up your phone model and get your buyback valuation quote.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
