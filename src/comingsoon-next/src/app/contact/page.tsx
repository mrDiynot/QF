'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageProvider } from "@/contexts/PageContext";
import { Mail, MessageSquare, MapPin, Phone, Share2, Search, ChevronDown } from "lucide-react";
import Script from 'next/script';

const COUNTRIES = [
  { code: '+1', flag: '\u{1F1FA}\u{1F1F8}', name: 'United States' },
  { code: '+1', flag: '\u{1F1E8}\u{1F1E6}', name: 'Canada' },
  { code: '+44', flag: '\u{1F1EC}\u{1F1E7}', name: 'United Kingdom' },
  { code: '+33', flag: '\u{1F1EB}\u{1F1F7}', name: 'France' },
  { code: '+49', flag: '\u{1F1E9}\u{1F1EA}', name: 'Germany' },
  { code: '+61', flag: '\u{1F1E6}\u{1F1FA}', name: 'Australia' },
  { code: '+91', flag: '\u{1F1EE}\u{1F1F3}', name: 'India' },
  { code: '+81', flag: '\u{1F1EF}\u{1F1F5}', name: 'Japan' },
  { code: '+86', flag: '\u{1F1E8}\u{1F1F3}', name: 'China' },
  { code: '+55', flag: '\u{1F1E7}\u{1F1F7}', name: 'Brazil' },
  { code: '+52', flag: '\u{1F1F2}\u{1F1FD}', name: 'Mexico' },
  { code: '+93', flag: '\u{1F1E6}\u{1F1EB}', name: 'Afghanistan' },
  { code: '+355', flag: '\u{1F1E6}\u{1F1F1}', name: 'Albania' },
  { code: '+213', flag: '\u{1F1E9}\u{1F1FF}', name: 'Algeria' },
  { code: '+244', flag: '\u{1F1E6}\u{1F1F4}', name: 'Angola' },
  { code: '+54', flag: '\u{1F1E6}\u{1F1F7}', name: 'Argentina' },
  { code: '+374', flag: '\u{1F1E6}\u{1F1F2}', name: 'Armenia' },
  { code: '+43', flag: '\u{1F1E6}\u{1F1F9}', name: 'Austria' },
  { code: '+994', flag: '\u{1F1E6}\u{1F1FF}', name: 'Azerbaijan' },
  { code: '+973', flag: '\u{1F1E7}\u{1F1ED}', name: 'Bahrain' },
  { code: '+880', flag: '\u{1F1E7}\u{1F1E9}', name: 'Bangladesh' },
  { code: '+32', flag: '\u{1F1E7}\u{1F1EA}', name: 'Belgium' },
  { code: '+591', flag: '\u{1F1E7}\u{1F1F4}', name: 'Bolivia' },
  { code: '+387', flag: '\u{1F1E7}\u{1F1E6}', name: 'Bosnia & Herzegovina' },
  { code: '+267', flag: '\u{1F1E7}\u{1F1FC}', name: 'Botswana' },
  { code: '+359', flag: '\u{1F1E7}\u{1F1EC}', name: 'Bulgaria' },
  { code: '+855', flag: '\u{1F1F0}\u{1F1ED}', name: 'Cambodia' },
  { code: '+237', flag: '\u{1F1E8}\u{1F1F2}', name: 'Cameroon' },
  { code: '+56', flag: '\u{1F1E8}\u{1F1F1}', name: 'Chile' },
  { code: '+57', flag: '\u{1F1E8}\u{1F1F4}', name: 'Colombia' },
  { code: '+506', flag: '\u{1F1E8}\u{1F1F7}', name: 'Costa Rica' },
  { code: '+385', flag: '\u{1F1ED}\u{1F1F7}', name: 'Croatia' },
  { code: '+53', flag: '\u{1F1E8}\u{1F1FA}', name: 'Cuba' },
  { code: '+357', flag: '\u{1F1E8}\u{1F1FE}', name: 'Cyprus' },
  { code: '+420', flag: '\u{1F1E8}\u{1F1FF}', name: 'Czech Republic' },
  { code: '+243', flag: '\u{1F1E8}\u{1F1E9}', name: 'DR Congo' },
  { code: '+45', flag: '\u{1F1E9}\u{1F1F0}', name: 'Denmark' },
  { code: '+1', flag: '\u{1F1E9}\u{1F1F4}', name: 'Dominican Republic' },
  { code: '+593', flag: '\u{1F1EA}\u{1F1E8}', name: 'Ecuador' },
  { code: '+20', flag: '\u{1F1EA}\u{1F1EC}', name: 'Egypt' },
  { code: '+503', flag: '\u{1F1F8}\u{1F1FB}', name: 'El Salvador' },
  { code: '+372', flag: '\u{1F1EA}\u{1F1EA}', name: 'Estonia' },
  { code: '+251', flag: '\u{1F1EA}\u{1F1F9}', name: 'Ethiopia' },
  { code: '+358', flag: '\u{1F1EB}\u{1F1EE}', name: 'Finland' },
  { code: '+995', flag: '\u{1F1EC}\u{1F1EA}', name: 'Georgia' },
  { code: '+233', flag: '\u{1F1EC}\u{1F1ED}', name: 'Ghana' },
  { code: '+30', flag: '\u{1F1EC}\u{1F1F7}', name: 'Greece' },
  { code: '+502', flag: '\u{1F1EC}\u{1F1F9}', name: 'Guatemala' },
  { code: '+509', flag: '\u{1F1ED}\u{1F1F9}', name: 'Haiti' },
  { code: '+504', flag: '\u{1F1ED}\u{1F1F3}', name: 'Honduras' },
  { code: '+852', flag: '\u{1F1ED}\u{1F1F0}', name: 'Hong Kong' },
  { code: '+36', flag: '\u{1F1ED}\u{1F1FA}', name: 'Hungary' },
  { code: '+354', flag: '\u{1F1EE}\u{1F1F8}', name: 'Iceland' },
  { code: '+62', flag: '\u{1F1EE}\u{1F1E9}', name: 'Indonesia' },
  { code: '+98', flag: '\u{1F1EE}\u{1F1F7}', name: 'Iran' },
  { code: '+964', flag: '\u{1F1EE}\u{1F1F6}', name: 'Iraq' },
  { code: '+353', flag: '\u{1F1EE}\u{1F1EA}', name: 'Ireland' },
  { code: '+972', flag: '\u{1F1EE}\u{1F1F1}', name: 'Israel' },
  { code: '+39', flag: '\u{1F1EE}\u{1F1F9}', name: 'Italy' },
  { code: '+225', flag: '\u{1F1E8}\u{1F1EE}', name: 'Ivory Coast' },
  { code: '+1', flag: '\u{1F1EF}\u{1F1F2}', name: 'Jamaica' },
  { code: '+962', flag: '\u{1F1EF}\u{1F1F4}', name: 'Jordan' },
  { code: '+7', flag: '\u{1F1F0}\u{1F1FF}', name: 'Kazakhstan' },
  { code: '+254', flag: '\u{1F1F0}\u{1F1EA}', name: 'Kenya' },
  { code: '+965', flag: '\u{1F1F0}\u{1F1FC}', name: 'Kuwait' },
  { code: '+371', flag: '\u{1F1F1}\u{1F1FB}', name: 'Latvia' },
  { code: '+961', flag: '\u{1F1F1}\u{1F1E7}', name: 'Lebanon' },
  { code: '+370', flag: '\u{1F1F1}\u{1F1F9}', name: 'Lithuania' },
  { code: '+352', flag: '\u{1F1F1}\u{1F1FA}', name: 'Luxembourg' },
  { code: '+60', flag: '\u{1F1F2}\u{1F1FE}', name: 'Malaysia' },
  { code: '+356', flag: '\u{1F1F2}\u{1F1F9}', name: 'Malta' },
  { code: '+212', flag: '\u{1F1F2}\u{1F1E6}', name: 'Morocco' },
  { code: '+258', flag: '\u{1F1F2}\u{1F1FF}', name: 'Mozambique' },
  { code: '+95', flag: '\u{1F1F2}\u{1F1F2}', name: 'Myanmar' },
  { code: '+264', flag: '\u{1F1F3}\u{1F1E6}', name: 'Namibia' },
  { code: '+977', flag: '\u{1F1F3}\u{1F1F5}', name: 'Nepal' },
  { code: '+31', flag: '\u{1F1F3}\u{1F1F1}', name: 'Netherlands' },
  { code: '+64', flag: '\u{1F1F3}\u{1F1FF}', name: 'New Zealand' },
  { code: '+505', flag: '\u{1F1F3}\u{1F1EE}', name: 'Nicaragua' },
  { code: '+234', flag: '\u{1F1F3}\u{1F1EC}', name: 'Nigeria' },
  { code: '+47', flag: '\u{1F1F3}\u{1F1F4}', name: 'Norway' },
  { code: '+968', flag: '\u{1F1F4}\u{1F1F2}', name: 'Oman' },
  { code: '+92', flag: '\u{1F1F5}\u{1F1F0}', name: 'Pakistan' },
  { code: '+507', flag: '\u{1F1F5}\u{1F1E6}', name: 'Panama' },
  { code: '+595', flag: '\u{1F1F5}\u{1F1FE}', name: 'Paraguay' },
  { code: '+51', flag: '\u{1F1F5}\u{1F1EA}', name: 'Peru' },
  { code: '+63', flag: '\u{1F1F5}\u{1F1ED}', name: 'Philippines' },
  { code: '+48', flag: '\u{1F1F5}\u{1F1F1}', name: 'Poland' },
  { code: '+351', flag: '\u{1F1F5}\u{1F1F9}', name: 'Portugal' },
  { code: '+974', flag: '\u{1F1F6}\u{1F1E6}', name: 'Qatar' },
  { code: '+40', flag: '\u{1F1F7}\u{1F1F4}', name: 'Romania' },
  { code: '+7', flag: '\u{1F1F7}\u{1F1FA}', name: 'Russia' },
  { code: '+250', flag: '\u{1F1F7}\u{1F1FC}', name: 'Rwanda' },
  { code: '+966', flag: '\u{1F1F8}\u{1F1E6}', name: 'Saudi Arabia' },
  { code: '+221', flag: '\u{1F1F8}\u{1F1F3}', name: 'Senegal' },
  { code: '+381', flag: '\u{1F1F7}\u{1F1F8}', name: 'Serbia' },
  { code: '+65', flag: '\u{1F1F8}\u{1F1EC}', name: 'Singapore' },
  { code: '+421', flag: '\u{1F1F8}\u{1F1F0}', name: 'Slovakia' },
  { code: '+386', flag: '\u{1F1F8}\u{1F1EE}', name: 'Slovenia' },
  { code: '+27', flag: '\u{1F1FF}\u{1F1E6}', name: 'South Africa' },
  { code: '+82', flag: '\u{1F1F0}\u{1F1F7}', name: 'South Korea' },
  { code: '+34', flag: '\u{1F1EA}\u{1F1F8}', name: 'Spain' },
  { code: '+94', flag: '\u{1F1F1}\u{1F1F0}', name: 'Sri Lanka' },
  { code: '+46', flag: '\u{1F1F8}\u{1F1EA}', name: 'Sweden' },
  { code: '+41', flag: '\u{1F1E8}\u{1F1ED}', name: 'Switzerland' },
  { code: '+886', flag: '\u{1F1F9}\u{1F1FC}', name: 'Taiwan' },
  { code: '+255', flag: '\u{1F1F9}\u{1F1FF}', name: 'Tanzania' },
  { code: '+66', flag: '\u{1F1F9}\u{1F1ED}', name: 'Thailand' },
  { code: '+1', flag: '\u{1F1F9}\u{1F1F9}', name: 'Trinidad & Tobago' },
  { code: '+216', flag: '\u{1F1F9}\u{1F1F3}', name: 'Tunisia' },
  { code: '+90', flag: '\u{1F1F9}\u{1F1F7}', name: 'Turkey' },
  { code: '+256', flag: '\u{1F1FA}\u{1F1EC}', name: 'Uganda' },
  { code: '+380', flag: '\u{1F1FA}\u{1F1E6}', name: 'Ukraine' },
  { code: '+971', flag: '\u{1F1E6}\u{1F1EA}', name: 'United Arab Emirates' },
  { code: '+598', flag: '\u{1F1FA}\u{1F1FE}', name: 'Uruguay' },
  { code: '+998', flag: '\u{1F1FA}\u{1F1FF}', name: 'Uzbekistan' },
  { code: '+58', flag: '\u{1F1FB}\u{1F1EA}', name: 'Venezuela' },
  { code: '+84', flag: '\u{1F1FB}\u{1F1F3}', name: 'Vietnam' },
  { code: '+260', flag: '\u{1F1FF}\u{1F1F2}', name: 'Zambia' },
  { code: '+263', flag: '\u{1F1FF}\u{1F1FC}', name: 'Zimbabwe' },
];

// Extend Window interface for Brevo form properties
declare global {
  interface Window {
    REQUIRED_CODE_ERROR_MESSAGE: string;
    LOCALE: string;
    EMAIL_INVALID_MESSAGE: string;
    SMS_INVALID_MESSAGE: string;
    REQUIRED_ERROR_MESSAGE: string;
    GENERIC_INVALID_MESSAGE: string;
    translation: {
      common: {
        selectedList: string;
        selectedLists: string;
        selectedOption: string;
        selectedOptions: string;
      };
    };
    AUTOHIDE: boolean;
  }
}

export default function ContactPage() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countrySearchInputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = COUNTRIES.filter((c) => {
    const q = countrySearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.includes(q);
  });

  const handleSelectCountry = useCallback((country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setIsCountryDropdownOpen(false);
    setCountrySearch('');
  }, []);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
        setCountrySearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isCountryDropdownOpen && countrySearchInputRef.current) {
      countrySearchInputRef.current.focus();
    }
  }, [isCountryDropdownOpen]);

  useEffect(() => {
    // Track intervals/timeouts for cleanup on unmount
    let flagUpdateIntervalId: ReturnType<typeof setInterval> | null = null;
    let brevoCheckIntervalId: ReturnType<typeof setInterval> | null = null;
    let brevoCheckTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let savedOriginalXHR: typeof XMLHttpRequest | null = null;
    const pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

    // Set up Brevo form configuration
    if (typeof window !== 'undefined') {
      window.REQUIRED_CODE_ERROR_MESSAGE = 'Please choose a country code';
      window.LOCALE = 'en';
      window.EMAIL_INVALID_MESSAGE = window.SMS_INVALID_MESSAGE = "The information provided is invalid. Please review the field format and try again.";
      window.REQUIRED_ERROR_MESSAGE = "This field cannot be left blank.";
      window.GENERIC_INVALID_MESSAGE = "The information provided is invalid. Please review the field format and try again.";
      window.translation = {
        common: {
          selectedList: '{quantity} list selected',
          selectedLists: '{quantity} lists selected',
          selectedOption: '{quantity} selected',
          selectedOptions: '{quantity} selected',
        }
      };
      window.AUTOHIDE = Boolean(0);

      // Country code to flag emoji mapping
      const countryFlags: Record<string, string> = {
        '+1': '🇺🇸',
        '+93': '🇦🇫',
        '+355': '🇦🇱',
        '+213': '🇩🇿',
        '+54': '🇦🇷',
        '+61': '🇦🇺',
        '+43': '🇦🇹',
        '+32': '🇧🇪',
        '+55': '🇧🇷',
        '+86': '🇨🇳',
        '+45': '🇩🇰',
        '+20': '🇪🇬',
        '+33': '🇫🇷',
        '+49': '🇩🇪',
        '+91': '🇮🇳',
        '+353': '🇮🇪',
        '+972': '🇮🇱',
        '+39': '🇮🇹',
        '+81': '🇯🇵',
        '+52': '🇲🇽',
        '+31': '🇳🇱',
        '+64': '🇳🇿',
        '+47': '🇳🇴',
        '+48': '🇵🇱',
        '+351': '🇵🇹',
        '+7': '🇷🇺',
        '+966': '🇸🇦',
        '+65': '🇸🇬',
        '+27': '🇿🇦',
        '+82': '🇰🇷',
        '+34': '🇪🇸',
        '+46': '🇸🇪',
        '+41': '🇨🇭',
        '+90': '🇹🇷',
        '+44': '🇬🇧'
      };

      // Country code to flag image mapping (using flagcdn.com)
      const countryFlagImages: Record<string, string> = {
        '+1': 'https://flagcdn.com/w40/us.png',
        '+93': 'https://flagcdn.com/w40/af.png',
        '+355': 'https://flagcdn.com/w40/al.png',
        '+213': 'https://flagcdn.com/w40/dz.png',
        '+54': 'https://flagcdn.com/w40/ar.png',
        '+61': 'https://flagcdn.com/w40/au.png',
        '+43': 'https://flagcdn.com/w40/at.png',
        '+32': 'https://flagcdn.com/w40/be.png',
        '+55': 'https://flagcdn.com/w40/br.png',
        '+86': 'https://flagcdn.com/w40/cn.png',
        '+45': 'https://flagcdn.com/w40/dk.png',
        '+20': 'https://flagcdn.com/w40/eg.png',
        '+33': 'https://flagcdn.com/w40/fr.png',
        '+49': 'https://flagcdn.com/w40/de.png',
        '+91': 'https://flagcdn.com/w40/in.png',
        '+353': 'https://flagcdn.com/w40/ie.png',
        '+972': 'https://flagcdn.com/w40/il.png',
        '+39': 'https://flagcdn.com/w40/it.png',
        '+81': 'https://flagcdn.com/w40/jp.png',
        '+52': 'https://flagcdn.com/w40/mx.png',
        '+31': 'https://flagcdn.com/w40/nl.png',
        '+64': 'https://flagcdn.com/w40/nz.png',
        '+47': 'https://flagcdn.com/w40/no.png',
        '+48': 'https://flagcdn.com/w40/pl.png',
        '+351': 'https://flagcdn.com/w40/pt.png',
        '+7': 'https://flagcdn.com/w40/ru.png',
        '+966': 'https://flagcdn.com/w40/sa.png',
        '+65': 'https://flagcdn.com/w40/sg.png',
        '+27': 'https://flagcdn.com/w40/za.png',
        '+82': 'https://flagcdn.com/w40/kr.png',
        '+34': 'https://flagcdn.com/w40/es.png',
        '+46': 'https://flagcdn.com/w40/se.png',
        '+41': 'https://flagcdn.com/w40/ch.png',
        '+90': 'https://flagcdn.com/w40/tr.png',
        '+44': 'https://flagcdn.com/w40/gb.png'
      };

      // Function to add flags to dropdown options
      const addFlagsToDropdown = () => {
        const selectElement = document.querySelector('select[name="SMS__COUNTRY_CODE"]') as HTMLSelectElement;
        if (selectElement) {
          const options = selectElement.querySelectorAll('option');
          options.forEach((option) => {
            const value = option.value;
            const flag = countryFlags[value];
            if (flag && !option.textContent?.startsWith(flag)) {
              option.textContent = `${flag} ${option.textContent}`;
            }
          });
        }

        // Also update the Brevo custom button with image
        const updateButton = () => {
          const button = document.querySelector('.sib-sms-select__title');
          if (button) {
            const buttonText = button.textContent || '';
            
            // Check if flag image already exists
            let flagImg = button.querySelector('img.country-flag-img') as HTMLImageElement | null;
            
            // Extract the country code from the button
            let countryCode = '+1'; // Default to US
            const codeMatch = buttonText.match(/\+\d+/);
            if (codeMatch) {
              countryCode = codeMatch[0];
            }
            
            // Get flag image URL
            const flagUrl = countryFlagImages[countryCode];
            
            if (flagUrl) {
              if (!flagImg) {
                // Create new flag image
                flagImg = document.createElement('img') as HTMLImageElement;
                flagImg.className = 'country-flag-img';
                flagImg.style.width = '24px';
                flagImg.style.height = '18px';
                flagImg.style.marginRight = '8px';
                flagImg.style.objectFit = 'cover';
                flagImg.style.borderRadius = '2px';
                flagImg.style.border = '1px solid #e5e7eb';
                flagImg.style.display = 'inline-block';
                flagImg.style.verticalAlign = 'middle';
                flagImg.src = flagUrl;
                flagImg.alt = 'Flag';
                
                // Remove emoji if present
                const cleanText = buttonText.replace(/🇺🇸|🇦🇫|🇦🇱|🇩🇿|🇦🇷|🇦🇺|🇦🇹|🇧🇪|🇧🇷|🇨🇳|🇩🇰|🇪🇬|🇫🇷|🇩🇪|🇮🇳|🇮🇪|🇮🇱|🇮🇹|🇯🇵|🇲🇽|🇳🇱|🇳🇿|🇳🇴|🇵🇱|🇵🇹|🇷🇺|🇸🇦|🇸🇬|🇿🇦|🇰🇷|🇪🇸|🇸🇪|🇨🇭|🇹🇷|🇬🇧/g, '').trim();
                
                // Clear button and add flag image + text
                button.innerHTML = '';
                button.appendChild(flagImg);
                button.appendChild(document.createTextNode(cleanText));
              } else {
                // Update existing flag image
                flagImg.src = flagUrl;
              }
            }
          }
        };

        updateButton();

        // Continuously update button to override Brevo's resets
        // Use setInterval instead of MutationObserver to avoid conflicts with Brevo
        flagUpdateIntervalId = setInterval(() => {
          const button = document.querySelector('.sib-sms-select__title');
          if (button) {
            // Only update if flag image doesn't exist
            const hasFlag = button.querySelector('img.country-flag-img');
            if (!hasFlag) {
              updateButton();
            }
          }
        }, 100); // Check every 100ms for faster flag appearance

        // Add flag images to dropdown options when opened
        const dropdown = document.querySelector('.sib-sms-select');
        if (dropdown) {
          dropdown.addEventListener('click', () => {
            setTimeout(() => {
              const dropdownOptions = document.querySelectorAll('.sib-sms-select__option');
              dropdownOptions.forEach((option) => {
                const text = option.textContent || '';
                const codeMatch = text.match(/\+\d+/);
                
                if (codeMatch && !option.querySelector('img.country-flag-img')) {
                  const code = codeMatch[0];
                  const flagUrl = countryFlagImages[code];
                  
                  if (flagUrl) {
                    // Create flag image
                    const flagImg = document.createElement('img') as HTMLImageElement;
                    flagImg.className = 'country-flag-img';
                    flagImg.style.width = '24px';
                    flagImg.style.height = '18px';
                    flagImg.style.marginRight = '8px';
                    flagImg.style.objectFit = 'cover';
                    flagImg.style.borderRadius = '2px';
                    flagImg.style.border = '1px solid #e5e7eb';
                    flagImg.style.display = 'inline-block';
                    flagImg.style.verticalAlign = 'middle';
                    flagImg.src = flagUrl;
                    flagImg.alt = 'Flag';
                    
                    // Remove emoji if present
                    const cleanText = text.replace(/🇺🇸|🇦🇫|🇦🇱|🇩🇿|🇦🇷|🇦🇺|🇦🇹|🇧🇪|🇧🇷|🇨🇳|🇩🇰|🇪🇬|🇫🇷|🇩🇪|🇮🇳|🇮🇪|🇮🇱|🇮🇹|🇯🇵|🇲🇽|🇳🇱|🇳🇿|🇳🇴|🇵🇱|🇵🇹|🇷🇺|🇸🇦|🇸🇬|🇿🇦|🇰🇷|🇪🇸|🇸🇪|🇨🇭|🇹🇷|🇬🇧/g, '').trim();
                    
                    // Clear and rebuild option
                    option.innerHTML = '';
                    option.appendChild(flagImg);
                    option.appendChild(document.createTextNode(cleanText));
                  }
                }
              });
            }, 100);
          });
        }
      };

      // Wait for Brevo script to load and create the custom dropdown
      brevoCheckIntervalId = setInterval(() => {
        const brevoButton = document.querySelector('.sib-sms-select__title');
        if (brevoButton) {
          if (brevoCheckIntervalId) clearInterval(brevoCheckIntervalId);
          addFlagsToDropdown();
          
          // Call updateButton multiple times immediately to ensure flag appears instantly
          setTimeout(() => {
            const button = document.querySelector('.sib-sms-select__title');
            if (button && !button.querySelector('img.country-flag-img')) {
              const updateButton = () => {
                const button = document.querySelector('.sib-sms-select__title');
                if (button) {
                  const buttonText = button.textContent || '';
                  let flagImg = button.querySelector('img.country-flag-img') as HTMLImageElement | null;
                  let countryCode = '+1';
                  const codeMatch = buttonText.match(/\+\d+/);
                  if (codeMatch) {
                    countryCode = codeMatch[0];
                  }
                  const flagUrl = countryFlagImages[countryCode];
                  if (flagUrl && !flagImg) {
                    flagImg = document.createElement('img') as HTMLImageElement;
                    flagImg.className = 'country-flag-img';
                    flagImg.style.width = '24px';
                    flagImg.style.height = '18px';
                    flagImg.style.marginRight = '8px';
                    flagImg.style.objectFit = 'cover';
                    flagImg.style.borderRadius = '2px';
                    flagImg.style.border = '1px solid #e5e7eb';
                    flagImg.style.display = 'inline-block';
                    flagImg.style.verticalAlign = 'middle';
                    flagImg.src = flagUrl;
                    flagImg.alt = 'Flag';
                    const cleanText = buttonText.replace(/🇺🇸|🇦🇫|🇦🇱|🇩🇿|🇦🇷|🇦🇺|🇦🇹|🇧🇪|🇧🇷|🇨🇳|🇩🇰|🇪🇬|🇫🇷|🇩🇪|🇮🇳|🇮🇪|🇮🇱|🇮🇹|🇯🇵|🇲🇽|🇳🇱|🇳🇿|🇳🇴|🇵🇱|🇵🇹|🇷🇺|🇸🇦|🇸🇬|🇿🇦|🇰🇷|🇪🇸|🇸🇪|🇨🇭|🇹🇷|🇬🇧/g, '').trim();
                    button.innerHTML = '';
                    button.appendChild(flagImg);
                    button.appendChild(document.createTextNode(cleanText));
                  }
                }
              };
              updateButton();
              pendingTimeouts.push(setTimeout(updateButton, 50));
              pendingTimeouts.push(setTimeout(updateButton, 100));
              pendingTimeouts.push(setTimeout(updateButton, 200));
            }
          }, 50);
        }
      }, 100); // Check every 100ms instead of 500ms for faster detection

      // Clear interval after 10 seconds if not found
      brevoCheckTimeoutId = setTimeout(() => {
        if (brevoCheckIntervalId) clearInterval(brevoCheckIntervalId);
      }, 10000);

      // Intercept XMLHttpRequest to detect form submission success/error (Brevo uses XHR, not fetch)
      const originalXHR = window.XMLHttpRequest;
      savedOriginalXHR = originalXHR;
      
      // @ts-expect-error - Overriding XMLHttpRequest constructor for Brevo form interception
      window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        const originalSend = xhr.send;

        let requestURL = '';

        // Intercept open to capture URL
        xhr.open = function(method: string, url: string | URL, async_flag?: boolean, username?: string | null, password?: string | null) {
          requestURL = url.toString();
          return originalOpen.call(this, method, url, async_flag ?? true, username, password);
        };

        // Intercept send to add load listener
        xhr.send = function(body?: XMLHttpRequestBodyInit | Document | null) {
          if (requestURL.includes('sibforms.com/serve')) {
            // This is a Brevo form submission
            xhr.addEventListener('load', function() {
              if (xhr.status === 200) {
                try {
                  const response = JSON.parse(xhr.responseText);
                  // Use our custom messages that are outside Brevo's container
                  const customSuccessMessage = document.getElementById('custom-success-message');
                  const customErrorMessage = document.getElementById('custom-error-message');
                  
                  if (customSuccessMessage && customErrorMessage) {
                    if (response.success === true) {
                      // Show custom success message
                      customSuccessMessage.style.display = 'block';
                      customErrorMessage.style.display = 'none';
                      
                      // Scroll to message
                      setTimeout(() => {
                        customSuccessMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                      
                      // Forward to backend API for email notification with CC support
                      const form = document.getElementById('sib-form') as HTMLFormElement;
                      if (form) {
                        const formData = new FormData(form);
                        const name = formData.get('FULL_NAME') as string || '';
                        const email = formData.get('EMAIL') as string || '';
                        const company = formData.get('COMPANY_NAME') as string || '';
                        const message = formData.get('MESSAGE') as string || '';
                        const countryCode = formData.get('SMS__COUNTRY_CODE') as string || '';
                        const phoneNumber = formData.get('SMS') as string || '';
                        const phone = phoneNumber ? `${countryCode}${phoneNumber}` : '';

                        // Call backend API for email notification (fire and forget)
                        const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.qualiflow.ai';
                        fetch(`${backendApiUrl}/api/v1/public/contact`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name,
                            email,
                            company: company || undefined,
                            phone: phone || undefined,
                            subject: company ? `Contact from ${company}` : undefined,
                            message,
                          }),
                        }).catch(err => console.error('[Contact] Backend API notification failed:', err));
                        
                        // Clear form fields
                        setTimeout(() => form.reset(), 500);
                      }
                    } else {
                      // Show custom error message
                      customErrorMessage.style.display = 'block';
                      customSuccessMessage.style.display = 'none';
                      
                      // Scroll to message
                      setTimeout(() => {
                        customErrorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }
                  }
                } catch (e) {
                  console.error('Error parsing Brevo response:', e);
                }
              }
            });
          }
          
          return originalSend.call(this, body);
        };
        
        return xhr;
      };
    }

    // Cleanup on unmount: clear intervals, restore XHR, remove Brevo DOM elements
    return () => {
      if (flagUpdateIntervalId) clearInterval(flagUpdateIntervalId);
      if (brevoCheckIntervalId) clearInterval(brevoCheckIntervalId);
      if (brevoCheckTimeoutId) clearTimeout(brevoCheckTimeoutId);
      pendingTimeouts.forEach(t => clearTimeout(t));

      // Restore original XMLHttpRequest
      if (savedOriginalXHR) {
        window.XMLHttpRequest = savedOriginalXHR;
      }

      // Remove only Brevo-INJECTED DOM elements that persist outside React.
      // IMPORTANT: Do NOT remove #sib-form or #sib-form-container — those are React-rendered.
      // The [id^="sib-"] selector was removing our own form element, breaking the submit button.
      document.querySelectorAll(
        '.sib-sms-select, .entry__field.sms'
      ).forEach(el => el.remove());

      // Note: Do NOT remove Brevo scripts here — the Script component with
      // strategy="lazyOnload" manages the lifecycle. Removing it breaks form
      // validation and submission on re-mount.
    };
  }, []);

  return (
    <PageProvider isWhiteBackground={true}>
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/20 to-white">
        {/* Brevo Form Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-display: block;
            font-family: Roboto;
            src: url(https://assets.brevo.com/font/Roboto/Latin/normal/normal/7529907e9eaf8ebb5220c5f9850e3811.woff2) format("woff2"),
              url(https://assets.brevo.com/font/Roboto/Latin/normal/normal/25c678feafdc175a70922a116c9be3e7.woff) format("woff")
          }

          @font-face {
            font-display: fallback;
            font-family: Roboto;
            font-weight: 600;
            src: url(https://assets.brevo.com/font/Roboto/Latin/medium/normal/6e9caeeafb1f3491be3e32744bc30440.woff2) format("woff2"),
              url(https://assets.brevo.com/font/Roboto/Latin/medium/normal/71501f0d8d5aa95960f6475d5487d4c2.woff) format("woff")
          }

          @font-face {
            font-display: fallback;
            font-family: Roboto;
            font-weight: 700;
            src: url(https://assets.brevo.com/font/Roboto/Latin/bold/normal/3ef7cf158f310cf752d5ad08cd0e7e60.woff2) format("woff2"),
              url(https://assets.brevo.com/font/Roboto/Latin/bold/normal/ece3a1d82f18b60bcce0211725c476aa.woff) format("woff")
          }

          /* Hide Brevo's default success/error messages - we use custom ones */
          #sib-form-container .sib-form-message-panel {
            display: none !important;
          }

          /* Force hide Brevo loading spinner icon inside submit button */
          .sib-hide-loader-icon,
          .progress-indicator__icon,
          .sib-form-block__button-with-loader svg,
          .sib-form-block__button svg.icon {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            visibility: hidden !important;
            opacity: 0 !important;
            position: absolute !important;
            overflow: hidden !important;
          }

          /* Unified validation error styling for Brevo form */
          #sib-container .entry__error {
            display: none !important;
            align-items: center !important;
            gap: 6px !important;
            margin-top: 8px !important;
            padding: 0 !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            color: #dc2626 !important;
            background-color: transparent !important;
            border: none !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
          }

          /* Only show error when it has content (after validation) */
          #sib-container .entry__error:not(:empty) {
            display: flex !important;
          }

          #sib-container .entry__error:not(:empty)::before {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23dc2626' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E");
            flex-shrink: 0;
          }

          /* Input field error state */
          #sib-container .input.sib-invalid,
          #sib-container .form__entry.has-error .input {
            border-color: #fca5a5 !important;
            background-color: rgba(254, 242, 242, 0.3) !important;
          }

          #sib-container .input.sib-invalid:focus,
          #sib-container .form__entry.has-error .input:focus {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
          }

          /* Modern SaaS Form Styling - !important to override Brevo injected styles */
          #sib-container .input,
          #sib-container .entry__field .input,
          #sib-container .entry__field input[type="text"],
          #sib-container .entry__field input[type="email"],
          #sib-container .entry__field input[type="tel"],
          #sib-container input.input {
            width: 100% !important;
            padding: 14px 18px !important;
            font-size: 15px !important;
            line-height: 1.6 !important;
            color: #1f2937 !important;
            background-color: #fafafa !important;
            border: 1.5px solid #e5e7eb !important;
            border-radius: 14px !important;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
            box-sizing: border-box !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
          }

          #sib-container .input:hover,
          #sib-container .entry__field .input:hover,
          #sib-container .entry__field input[type="text"]:hover,
          #sib-container .entry__field input[type="email"]:hover,
          #sib-container .entry__field input[type="tel"]:hover,
          #sib-container input.input:hover {
            border-color: #c4b5fd !important;
            background-color: #ffffff !important;
            box-shadow: 0 2px 6px rgba(107, 45, 158, 0.06) !important;
          }

          #sib-container .input:focus,
          #sib-container .entry__field .input:focus,
          #sib-container .entry__field input[type="text"]:focus,
          #sib-container .entry__field input[type="email"]:focus,
          #sib-container .entry__field input[type="tel"]:focus,
          #sib-container input.input:focus {
            outline: none !important;
            border-color: #6B2D9E !important;
            box-shadow: 0 0 0 4px rgba(107, 45, 158, 0.08), 0 2px 8px rgba(107, 45, 158, 0.1) !important;
            background-color: #ffffff !important;
          }

          #sib-container input:-ms-input-placeholder {
            color: #9ca3af;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          }

          #sib-container input::placeholder {
            color: #9ca3af;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          }

          #sib-container textarea,
          #sib-container .entry__field textarea {
            width: 100% !important;
            padding: 14px 18px !important;
            font-size: 15px !important;
            line-height: 1.6 !important;
            color: #1f2937 !important;
            background-color: #fafafa !important;
            border: 1.5px solid #e5e7eb !important;
            border-radius: 14px !important;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
            resize: vertical;
            min-height: 120px;
            box-sizing: border-box !important;
            -webkit-appearance: none !important;
            appearance: none !important;
          }

          #sib-container textarea:hover,
          #sib-container .entry__field textarea:hover {
            border-color: #c4b5fd !important;
            background-color: #ffffff !important;
            box-shadow: 0 2px 6px rgba(107, 45, 158, 0.06) !important;
          }

          #sib-container textarea:focus,
          #sib-container .entry__field textarea:focus {
            outline: none !important;
            border-color: #6B2D9E !important;
            box-shadow: 0 0 0 4px rgba(107, 45, 158, 0.08), 0 2px 8px rgba(107, 45, 158, 0.1) !important;
            background-color: #ffffff !important;
          }

          #sib-container textarea::placeholder {
            color: #9ca3af;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          }

          /* Custom Country Code Selector */
          .country-selector-btn {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 100%;
            padding: 14px 18px;
            font-size: 15px;
            line-height: 1.6;
            color: #1f2937;
            background-color: #fafafa;
            border: 1.5px solid #e5e7eb;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
            box-sizing: border-box;
            gap: 8px;
            min-width: 160px;
          }
          .country-selector-btn:hover {
            border-color: #c4b5fd;
            background-color: #ffffff;
            box-shadow: 0 2px 6px rgba(107, 45, 158, 0.06);
          }
          .country-selector-btn:focus {
            outline: none;
            border-color: #6B2D9E;
            box-shadow: 0 0 0 4px rgba(107, 45, 158, 0.08), 0 2px 8px rgba(107, 45, 158, 0.1);
            background-color: #ffffff;
          }
          .country-selector-value {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
          }
          .country-dropdown {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            right: 0;
            min-width: 280px;
            background: #ffffff;
            border: 1.5px solid #e5e7eb;
            border-radius: 14px;
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
            z-index: 50;
            overflow: hidden;
            animation: dropdownFadeIn 0.15s ease-out;
          }
          @keyframes dropdownFadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .country-search-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px;
            border-bottom: 1px solid #f3f4f6;
          }
          .country-search-input {
            width: 100%;
            border: none;
            outline: none;
            font-size: 14px;
            color: #1f2937;
            background: transparent;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          }
          .country-search-input::placeholder {
            color: #9ca3af;
          }
          .country-list {
            list-style: none;
            margin: 0;
            padding: 4px 0;
            max-height: 300px;
            overflow-y: auto;
          }
          .country-list::-webkit-scrollbar {
            width: 6px;
          }
          .country-list::-webkit-scrollbar-track {
            background: transparent;
          }
          .country-list::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
          }
          .country-option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 14px;
            cursor: pointer;
            transition: background-color 0.15s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          }
          .country-option:hover {
            background-color: #f5f3ff;
          }
          .country-option--selected {
            background-color: #ede9fe;
          }
          .country-option--selected:hover {
            background-color: #ddd6fe;
          }
          .country-option--empty {
            color: #9ca3af;
            font-size: 13px;
            justify-content: center;
            cursor: default;
            padding: 16px 14px;
          }
          .country-option-name {
            flex: 1;
            font-size: 14px;
            color: #1f2937;
          }
          .country-option-code {
            font-size: 13px;
            color: #6b7280;
            font-weight: 500;
          }

          #sib-container .entry__label {
            display: block;
            margin-bottom: 10px;
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            letter-spacing: -0.01em;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          }

          #sib-container .form__entry {
            margin-bottom: 4px;
          }

          /* CRITICAL: Strip Brevo's border from wrapper divs — the border belongs on the input only */
          #sib-container .entry__field,
          #sib-container .sib-input .entry__field,
          #sib-container .form__entry .entry__field,
          #sib-container .form__label-row .entry__field {
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          #sib-container .sib-form-block p {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          }

          /* Phone row layout */
          .phone-row {
            display: flex;
            gap: 10px;
            align-items: stretch;
            width: 100%;
            box-sizing: border-box;
          }
          .phone-row > div {
            display: flex;
            align-items: stretch;
          }
          .phone-row .country-selector-btn {
            height: auto !important;
          }
          .phone-row .phone-input-wrapper {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            display: flex;
            align-items: stretch;
          }
          .phone-row .phone-input-wrapper .input,
          .phone-row .phone-input-wrapper input[type="tel"] {
            width: 100% !important;
            box-sizing: border-box !important;
            height: auto !important;
          }

          .sib-sms-tooltip__icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #e5e7eb;
            color: #6b7280;
            border-radius: 50%;
            font-size: 12px;
            font-weight: 600;
            cursor: help;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          }

          .sib-sms-tooltip:hover .sib-sms-tooltip__box {
            display: block;
          }

          .sib-sms-tooltip__box {
            display: none;
            position: absolute;
            bottom: 100%;
            right: 0;
            margin-bottom: 8px;
            padding: 12px;
            background-color: #1f2937;
            color: #ffffff;
            font-size: 12px;
            line-height: 1.4;
            border-radius: 8px;
            width: 280px;
            z-index: 10;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          }

          .sib-sms-tooltip__box::after {
            content: '';
            position: absolute;
            top: 100%;
            right: 10px;
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #1f2937;
          }

          #sib-container a {
            color: #6B2D9E;
            text-decoration: none;
            font-weight: 500;
          }

          #sib-container a:hover {
            text-decoration: underline;
          }

          /* Phone Number Country Selector - Enhanced Flag Visibility */
          .sib-sms-select__title {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
            white-space: nowrap !important;
            min-width: auto !important;
            width: auto !important;
            overflow: visible !important;
          }

          .sib-sms-select__title img,
          .sib-sms-select__option img {
            width: 24px !important;
            height: 18px !important;
            min-width: 24px !important;
            object-fit: cover !important;
            border-radius: 2px !important;
            border: 1px solid #e5e7eb !important;
            display: inline-block !important;
            margin-right: 8px !important;
          }

          .sib-sms-select__option {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            padding: 10px 12px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
          }

          .sib-sms-select__option:hover {
            background-color: #f3f4f6 !important;
          }

          .sib-sms-select__dropdown {
            max-height: 300px !important;
            overflow-y: auto !important;
            border: 2px solid #e5e7eb !important;
            border-radius: 12px !important;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
          }

          /* Fix parent container width */
          .sib-sms-select {
            width: auto !important;
            min-width: 120px !important;
          }

          /* Ensure button text doesn't overflow */
          .sib-sms-select .sib-sms-select__title {
            min-width: 120px !important;
            max-width: none !important;
            flex-shrink: 0 !important;
          }

          /* Add Emoji Flags Using CSS - Always Visible */
          .sib-sms-select__title::before,
          .sib-sms-select__option::before {
            font-size: 20px !important;
            margin-right: 8px !important;
            line-height: 1 !important;
          }

          /* Country-specific flags for button and dropdown */
          .sib-sms-select__title:has([data-country="US"])::before,
          .sib-sms-select__option[data-country="US"]::before,
          .sib-sms-select__title:has([data-value="+1"])::before,
          .sib-sms-select__option[data-value="+1"]::before {
            content: "🇺🇸" !important;
          }

          .sib-sms-select__option[data-country="AF"]::before,
          .sib-sms-select__option[data-value="+93"]::before {
            content: "🇦🇫" !important;
          }

          .sib-sms-select__option[data-country="AL"]::before,
          .sib-sms-select__option[data-value="+355"]::before {
            content: "🇦🇱" !important;
          }

          .sib-sms-select__option[data-country="DZ"]::before,
          .sib-sms-select__option[data-value="+213"]::before {
            content: "🇩🇿" !important;
          }

          .sib-sms-select__option[data-country="AR"]::before,
          .sib-sms-select__option[data-value="+54"]::before {
            content: "🇦🇷" !important;
          }

          .sib-sms-select__option[data-country="AU"]::before,
          .sib-sms-select__option[data-value="+61"]::before {
            content: "🇦🇺" !important;
          }

          .sib-sms-select__option[data-country="AT"]::before,
          .sib-sms-select__option[data-value="+43"]::before {
            content: "🇦🇹" !important;
          }

          .sib-sms-select__option[data-country="BE"]::before,
          .sib-sms-select__option[data-value="+32"]::before {
            content: "🇧🇪" !important;
          }

          .sib-sms-select__option[data-country="BR"]::before,
          .sib-sms-select__option[data-value="+55"]::before {
            content: "🇧🇷" !important;
          }

          .sib-sms-select__option[data-country="CN"]::before,
          .sib-sms-select__option[data-value="+86"]::before {
            content: "🇨🇳" !important;
          }

          .sib-sms-select__option[data-country="DK"]::before,
          .sib-sms-select__option[data-value="+45"]::before {
            content: "🇩🇰" !important;
          }

          .sib-sms-select__option[data-country="EG"]::before,
          .sib-sms-select__option[data-value="+20"]::before {
            content: "🇪🇬" !important;
          }

          .sib-sms-select__option[data-country="FR"]::before,
          .sib-sms-select__option[data-value="+33"]::before {
            content: "🇫🇷" !important;
          }

          .sib-sms-select__option[data-country="DE"]::before,
          .sib-sms-select__option[data-value="+49"]::before {
            content: "🇩🇪" !important;
          }

          .sib-sms-select__option[data-country="IN"]::before,
          .sib-sms-select__option[data-value="+91"]::before {
            content: "🇮🇳" !important;
          }

          .sib-sms-select__option[data-country="IE"]::before,
          .sib-sms-select__option[data-value="+353"]::before {
            content: "🇮🇪" !important;
          }

          .sib-sms-select__option[data-country="IL"]::before,
          .sib-sms-select__option[data-value="+972"]::before {
            content: "🇮🇱" !important;
          }

          .sib-sms-select__option[data-country="IT"]::before,
          .sib-sms-select__option[data-value="+39"]::before {
            content: "🇮🇹" !important;
          }

          .sib-sms-select__option[data-country="JP"]::before,
          .sib-sms-select__option[data-value="+81"]::before {
            content: "🇯🇵" !important;
          }

          .sib-sms-select__option[data-country="MX"]::before,
          .sib-sms-select__option[data-value="+52"]::before {
            content: "🇲🇽" !important;
          }

          .sib-sms-select__option[data-country="NL"]::before,
          .sib-sms-select__option[data-value="+31"]::before {
            content: "🇳🇱" !important;
          }

          .sib-sms-select__option[data-country="NZ"]::before,
          .sib-sms-select__option[data-value="+64"]::before {
            content: "🇳🇿" !important;
          }

          .sib-sms-select__option[data-country="NO"]::before,
          .sib-sms-select__option[data-value="+47"]::before {
            content: "🇳🇴" !important;
          }

          .sib-sms-select__option[data-country="PL"]::before,
          .sib-sms-select__option[data-value="+48"]::before {
            content: "🇵🇱" !important;
          }

          .sib-sms-select__option[data-country="PT"]::before,
          .sib-sms-select__option[data-value="+351"]::before {
            content: "🇵🇹" !important;
          }

          .sib-sms-select__option[data-country="RU"]::before,
          .sib-sms-select__option[data-value="+7"]::before {
            content: "🇷🇺" !important;
          }

          .sib-sms-select__option[data-country="SA"]::before,
          .sib-sms-select__option[data-value="+966"]::before {
            content: "🇸🇦" !important;
          }

          .sib-sms-select__option[data-country="SG"]::before,
          .sib-sms-select__option[data-value="+65"]::before {
            content: "🇸🇬" !important;
          }

          .sib-sms-select__option[data-country="ZA"]::before,
          .sib-sms-select__option[data-value="+27"]::before {
            content: "🇿🇦" !important;
          }

          .sib-sms-select__option[data-country="KR"]::before,
          .sib-sms-select__option[data-value="+82"]::before {
            content: "🇰🇷" !important;
          }

          .sib-sms-select__option[data-country="ES"]::before,
          .sib-sms-select__option[data-value="+34"]::before {
            content: "🇪🇸" !important;
          }

          .sib-sms-select__option[data-country="SE"]::before,
          .sib-sms-select__option[data-value="+46"]::before {
            content: "🇸🇪" !important;
          }

          .sib-sms-select__option[data-country="CH"]::before,
          .sib-sms-select__option[data-value="+41"]::before {
            content: "🇨🇭" !important;
          }

          .sib-sms-select__option[data-country="TR"]::before,
          .sib-sms-select__option[data-value="+90"]::before {
            content: "🇹🇷" !important;
          }

          .sib-sms-select__option[data-country="GB"]::before,
          .sib-sms-select__option[data-value="+44"]::before {
            content: "🇬🇧" !important;
          }

          /* Fallback: Add US flag if title contains "United States" */
          .sib-sms-select__title:not(:has(::before))::before {
            content: "🇺🇸" !important;
          }

          /* CSS-only US flag for immediate display (before JS loads) */
          .sib-sms-select__title:not(:has(img.country-flag-img))::before {
            content: "" !important;
            display: inline-block !important;
            width: 24px !important;
            height: 18px !important;
            margin-right: 8px !important;
            background-image: url('https://flagcdn.com/w40/us.png') !important;
            background-size: cover !important;
            background-position: center !important;
            border-radius: 2px !important;
            border: 1px solid #e5e7eb !important;
            vertical-align: middle !important;
          }

          /* Hide the CSS flag once JS adds the real image */
          .sib-sms-select__title:has(img.country-flag-img)::before {
            display: none !important;
          }

          /* Animated Background Keyframes */
          @keyframes gradientShift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          @keyframes floatParticle {
            0%, 100% {
              transform: translateY(0) translateX(0) scale(1);
              opacity: 0.4;
            }
            25% {
              transform: translateY(-20px) translateX(10px) scale(1.1);
              opacity: 0.6;
            }
            50% {
              transform: translateY(-10px) translateX(-10px) scale(0.9);
              opacity: 0.5;
            }
            75% {
              transform: translateY(-30px) translateX(5px) scale(1.05);
              opacity: 0.7;
            }
          }
        ` }} />

        <Navigation />
        
        <main className="pt-22 pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
                <MessageSquare className="w-4 h-4 text-[#6B2D9E]" />
                <span className="text-sm font-semibold text-[#6B2D9E]">Contact Us</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Let&apos;s Talk About <br />
                <span className="bg-gradient-to-r from-[#6B2D9E] to-[#EC4899] bg-clip-text text-transparent">Your Lead Automation</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Questions about QualiflowAI? Contact us anytime.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-12"
            >
              {/* Contact Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-[#6B2D9E]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                  <a 
                    href="mailto:Info@qualiflow.ai" 
                    className="text-[#6B2D9E] font-semibold hover:underline"
                  >
                    Info@qualiflow.ai
                  </a>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-[#FF5722]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
                  <a 
                    href="tel:+15512129387" 
                    className="text-[#6B2D9E] font-semibold hover:underline"
                  >
                    (551) 212-9387
                  </a>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-[#6B2D9E]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Office</h3>
                  <p className="text-gray-600">
                    New York, New York<br />
                    United States
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center mb-4">
                    <Share2 className="w-6 h-6 text-[#FF5722]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Social Media</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Follow us for updates
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href="https://www.linkedin.com/company/qualiflowai/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 bg-white border border-[#0A66C2]/20 rounded-lg flex items-center justify-center text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5 transition-all cursor-pointer" 
                      aria-label="LinkedIn"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://www.instagram.com/qualiflowai?igsh=N2RldGg4bHh0dTli&utm_source=qr" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 bg-white border border-[#E4405F]/20 rounded-lg flex items-center justify-center text-[#E4405F] hover:border-[#E4405F]/40 hover:bg-[#E4405F]/5 transition-all cursor-pointer" 
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://www.facebook.com/share/14MeivjxWQf/?mibextid=wwXIfr" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 bg-white border border-[#1877F2]/20 rounded-lg flex items-center justify-center text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5 transition-all cursor-pointer" 
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://www.linkedin.com/company/qualiflowai/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 bg-white border border-[#FF0000]/20 rounded-lg flex items-center justify-center text-[#FF0000] hover:border-[#FF0000]/40 hover:bg-[#FF0000]/5 transition-all cursor-pointer" 
                      aria-label="YouTube"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://x.com/qualiflowai?s=11&t=cFLsckMj0nU-VeWma8dMRw" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer" 
                      aria-label="X (Twitter)"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Brevo Contact Form */}
              <div className="lg:col-span-3">
                <div className="relative bg-gradient-to-br from-white to-purple-50/30 p-10 rounded-3xl border-2 border-purple-100 shadow-lg shadow-purple-500/5 overflow-hidden">
                  {/* Animated Background */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(45deg, rgba(107, 45, 158, 0.03) 0%, rgba(236, 72, 153, 0.03) 25%, rgba(255, 87, 34, 0.03) 50%, rgba(236, 72, 153, 0.03) 75%, rgba(107, 45, 158, 0.03) 100%)',
                      backgroundSize: '400% 400%',
                      animation: 'gradientShift 15s ease infinite',
                      zIndex: 0
                    }}
                  />
                  
                  {/* Floating Particles */}
                  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: `${20 + i * 10}px`,
                          height: `${20 + i * 10}px`,
                          background: i % 2 === 0 
                            ? 'radial-gradient(circle, rgba(107, 45, 158, 0.08) 0%, transparent 70%)'
                            : 'radial-gradient(circle, rgba(255, 87, 34, 0.06) 0%, transparent 70%)',
                          left: `${(i * 15) % 90}%`,
                          top: `${(i * 20) % 90}%`,
                          animation: `floatParticle ${8 + i * 2}s ease-in-out infinite`,
                          animationDelay: `${i * 0.5}s`
                        }}
                      />
                    ))}
                  </div>

                  {/* Content Layer */}
                  <div className="relative" style={{ zIndex: 1 }}>
                  
                  {/* Custom Success/Error Messages OUTSIDE Brevo container */}
                  <div 
                    id="custom-success-message"
                    style={{
                      display: 'none',
                      fontSize: '15px',
                      textAlign: 'left',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                      color: '#065f46',
                      backgroundColor: '#d1fae5',
                      borderRadius: '12px',
                      border: '2px solid #6ee7b7',
                      padding: '16px 20px',
                      marginBottom: '20px',
                      maxWidth: '540px',
                      boxShadow: '0 4px 12px rgba(52, 211, 153, 0.15)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', flexShrink: 0, marginTop: '2px' }} fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <div>
                        <strong>Thanks for reaching out.</strong> We&apos;ve received your message and our team will get back to you within 24 hours.
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    id="custom-error-message"
                    style={{
                      display: 'none',
                      fontSize: '15px',
                      textAlign: 'left',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                      color: '#991b1b',
                      backgroundColor: '#fee2e2',
                      borderRadius: '12px',
                      border: '2px solid #fca5a5',
                      padding: '16px 20px',
                      marginBottom: '20px',
                      maxWidth: '540px',
                      boxShadow: '0 4px 12px rgba(248, 113, 113, 0.15)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', flexShrink: 0, marginTop: '2px' }} fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      <div>
                        <strong>Message could not be sent.</strong> We apologize for the inconvenience. Please try again in a few moments, or contact us directly at <a href="mailto:Info@qualiflow.ai" style={{ color: '#991b1b', textDecoration: 'underline', fontWeight: 600 }}>Info@qualiflow.ai</a> or <a href="tel:+15512129387" style={{ color: '#991b1b', textDecoration: 'underline', fontWeight: 600 }}>(551) 212-9387</a>.
                      </div>
                    </div>
                  </div>
                  
                  <link rel="stylesheet" href="https://sibforms.com/forms/end-form/build/sib-styles.css" />
                  
                  <div className="sib-form">
                    <div id="sib-form-container" className="sib-form-container">
                      <div 
                        id="error-message" 
                        className="sib-form-message-panel" 
                        style={{
                          fontSize: '15px',
                          textAlign: 'left',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                          color: '#991b1b',
                          backgroundColor: '#fee2e2',
                          borderRadius: '12px',
                          border: '2px solid #fca5a5',
                          padding: '16px',
                          marginBottom: '20px',
                          maxWidth: '540px',
                          display: 'none'
                        }}
                      >
                        <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                          <svg viewBox="0 0 512 512" className="sib-icon sib-notification__icon">
                            <path d="M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z" />
                          </svg>
                          <span className="sib-form-message-panel__inner-text">
                            <strong>Message could not be sent.</strong> We apologize for the inconvenience. Please try again in a few moments, or contact us directly at <a href="mailto:Info@qualiflow.ai" style={{ color: '#991b1b', textDecoration: 'underline' }}>Info@qualiflow.ai</a> or <a href="tel:+15512129387" style={{ color: '#991b1b', textDecoration: 'underline' }}>(551) 212-9387</a>.
                          </span>
                        </div>
                      </div>

                      <div 
                        id="success-message" 
                        className="sib-form-message-panel" 
                        style={{
                          fontSize: '15px',
                          textAlign: 'left',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                          color: '#065f46',
                          backgroundColor: '#d1fae5',
                          borderRadius: '12px',
                          border: '2px solid #6ee7b7',
                          padding: '16px',
                          marginBottom: '20px',
                          maxWidth: '540px',
                          display: 'none'
                        }}
                      >
                        <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                          <svg viewBox="0 0 512 512" className="sib-icon sib-notification__icon">
                            <path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z" />
                          </svg>
                          <span className="sib-form-message-panel__inner-text">
                            <strong>Thank you for contacting us!</strong> Your message has been received and securely stored in accordance with our privacy policy. A member of our team will review your inquiry and respond within 24 hours. We look forward to speaking with you about QualiflowAI.
                          </span>
                        </div>
                      </div>

                      <div 
                        id="sib-container" 
                        className="sib-container--large sib-container--vertical" 
                        style={{
                          textAlign: 'center',
                          backgroundColor: 'rgba(255,255,255,1)',
                          maxWidth: '540px',
                          borderRadius: '0px',
                          borderWidth: '0px',
                          borderColor: '#C0CCD9',
                          borderStyle: 'solid',
                          direction: 'ltr'
                        }}
                      >
                        <form 
                          id="sib-form" 
                          method="POST" 
                          action="https://bc74bff7.sibforms.com/serve/MUIFAGnI3jSChbQQX_TApm2GKA1hGz3TL6a1Qb4J61TQ16ArUm5myre9Lu8TxjzxMFsVMktB5OP1qw9ROAGlIQWrXZIlqwPrVrHWer76RGFrmytuS7eIXrZfeWfRNFF1E5KMlo0Jl_XTJ1l-_Yu0KsUs3u7O7NBmIYD0N9jyvkjzaV0-K55dR2d4ksMHx6dzyZU7ZC59d_SdfVsz7Q==" 
                          data-type="subscription"
                        >
                          {/* Gradient Bar Above Form */}
                          <div style={{ 
                            height: '6px',
                            background: 'linear-gradient(90deg, #D97706 0%, #6B2D9E 50%, #9333EA 100%)',
                            borderRadius: '12px 12px 0 0',
                            marginTop: '-10px',
                            marginBottom: '16px',
                            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)'
                          }} />

                          <div style={{ padding: '0 0 5px 0' }}>
                            <div 
                              className="sib-form-block"
                              style={{
                                fontSize: '28px',
                                textAlign: 'left',
                                fontWeight: 700,
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                                color: '#1f2937',
                                backgroundColor: 'transparent',
                                marginBottom: '0px'
                              }}
                            >
                              <div style={{ 
                                background: 'linear-gradient(135deg, #6B2D9E 0%, #9333EA 100%)',
                                fontSize:40,
                                textAlign:"center",
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                              }}>Send us a Message</div>
                            </div>                          
                          </div>

                          {/* Full Name */}
                          <div style={{ padding: '0px 0' }}>
                            <div className="sib-input sib-form-block">
                              <div className="form__entry entry_block">
                                <div className="form__label-row">
                                  <label 
                                    className="entry__label" 
                                    style={{
                                      fontWeight: 600,
                                      textAlign: 'left',
                                      fontSize: '14px',
                                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                                      color: '#374151'
                                    }} 
                                    htmlFor="FULL_NAME"
                                  >
                                    Full Name <span style={{ color: '#6B2D9E' }}>*</span>
                                  </label>
                                  <div className="entry__field">
                                    <input 
                                      className="input" 
                                      maxLength={200}
                                      type="text" 
                                      id="FULL_NAME" 
                                      name="FULL_NAME" 
                                      autoComplete="off" 
                                      placeholder="Jon Doe" 
                                      data-required="true" 
                                      required 
                                    />
                                  </div>
                                </div>
                                <label 
                                  className="entry__error entry__error--primary" 
                                  style={{
                                    fontSize: '16px',
                                    textAlign: 'left',
                                    fontFamily: 'Helvetica, sans-serif',
                                    color: '#661d1d',
                                    backgroundColor: '#ffeded',
                                    borderRadius: '3px',
                                    borderColor: '#ff4949'
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Email Address */}
                          <div style={{ padding: '3px 0' }}>
                            <div className="sib-input sib-form-block">
                              <div className="form__entry entry_block">
                                <div className="form__label-row">
                                  <label 
                                    className="entry__label" 
                                    style={{
                                      fontWeight: 600,
                                      textAlign: 'left',
                                      fontSize: '14px',
                                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                                      color: '#374151'
                                    }} 
                                    htmlFor="EMAIL"
                                  >
                                    Email Address <span style={{ color: '#6B2D9E' }}>*</span>
                                  </label>
                                  <div className="entry__field">
                                    <input 
                                      className="input" 
                                      type="text" 
                                      id="EMAIL" 
                                      name="EMAIL" 
                                      autoComplete="off" 
                                      placeholder="john@company.com" 
                                      data-required="true" 
                                      required 
                                    />
                                  </div>
                                </div>
                                <label 
                                  className="entry__error entry__error--primary" 
                                  style={{
                                    fontSize: '16px',
                                    textAlign: 'left',
                                    fontFamily: 'Helvetica, sans-serif',
                                    color: '#661d1d',
                                    backgroundColor: '#ffeded',
                                    borderRadius: '3px',
                                    borderColor: '#ff4949'
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Company Name */}
                          <div style={{ padding: '3px 0' }}>
                            <div className="sib-input sib-form-block">
                              <div className="form__entry entry_block">
                                <div className="form__label-row">
                                  <label 
                                    className="entry__label" 
                                    style={{
                                      fontWeight: 600,
                                      textAlign: 'left',
                                      fontSize: '14px',
                                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                                      color: '#374151'
                                    }} 
                                    htmlFor="COMPANY_NAME"
                                  >
                                    Company Name <span style={{ color: '#6B2D9E' }}>*</span>
                                  </label>
                                  <div className="entry__field">
                                    <input 
                                      className="input" 
                                      maxLength={200}
                                      type="text" 
                                      id="COMPANY_NAME" 
                                      name="COMPANY_NAME" 
                                      autoComplete="off" 
                                      placeholder="Acme Inc." 
                                      data-required="true" 
                                      required 
                                    />
                                  </div>
                                </div>
                                <label 
                                  className="entry__error entry__error--primary" 
                                  style={{
                                    fontSize: '16px',
                                    textAlign: 'left',
                                    fontFamily: 'Helvetica, sans-serif',
                                    color: '#661d1d',
                                    backgroundColor: '#ffeded',
                                    borderRadius: '3px',
                                    borderColor: '#ff4949'
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Phone Number - Custom (outside Brevo SMS control) */}
                          <div style={{ padding: '3px 0' }}>
                            <div className="sib-form-block">
                              <div className="form__entry entry_block">
                                <div className="form__label-row">
                                  <label
                                    className="entry__label"
                                    style={{
                                      fontWeight: 600,
                                      textAlign: 'left',
                                      fontSize: '14px',
                                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                                      color: '#374151'
                                    }}
                                  >
                                    Phone Number
                                  </label>
                                  {/* Hidden inputs for Brevo form compatibility */}
                                  <input type="hidden" name="SMS__COUNTRY_CODE" value={selectedCountry.code} />
                                  <div className="phone-row">
                                    <div ref={countryDropdownRef} style={{ position: 'relative', flexShrink: 0, display: 'flex' }}>
                                      <button
                                        type="button"
                                        className="country-selector-btn"
                                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                        aria-expanded={isCountryDropdownOpen}
                                        aria-haspopup="listbox"
                                      >
                                        <span className="country-selector-value">
                                          <span style={{ fontSize: '18px' }}>{selectedCountry.flag}</span>
                                          <span>{selectedCountry.code}</span>
                                        </span>
                                        <ChevronDown size={16} style={{
                                          color: '#6b7280',
                                          transition: 'transform 0.2s ease',
                                          transform: isCountryDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                        }} />
                                      </button>

                                      {isCountryDropdownOpen && (
                                        <div className="country-dropdown">
                                          <div className="country-search-wrapper">
                                            <Search size={15} style={{ color: '#9ca3af', flexShrink: 0 }} />
                                            <input
                                              ref={countrySearchInputRef}
                                              type="text"
                                              className="country-search-input"
                                              placeholder="Search country or code..."
                                              value={countrySearch}
                                              onChange={(e) => setCountrySearch(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Escape') {
                                                  setIsCountryDropdownOpen(false);
                                                  setCountrySearch('');
                                                }
                                                if (e.key === 'Enter' && filteredCountries.length > 0) {
                                                  handleSelectCountry(filteredCountries[0]);
                                                }
                                              }}
                                            />
                                          </div>
                                          <ul className="country-list" role="listbox">
                                            {filteredCountries.length > 0 ? (
                                              filteredCountries.map((country) => (
                                                <li
                                                  key={country.code + country.name}
                                                  role="option"
                                                  aria-selected={selectedCountry.code === country.code}
                                                  className={`country-option ${selectedCountry.code === country.code ? 'country-option--selected' : ''}`}
                                                  onClick={() => handleSelectCountry(country)}
                                                >
                                                  <span style={{ fontSize: '16px' }}>{country.flag}</span>
                                                  <span className="country-option-name">{country.name}</span>
                                                  <span className="country-option-code">{country.code}</span>
                                                </li>
                                              ))
                                            ) : (
                                              <li className="country-option country-option--empty">
                                                No countries found
                                              </li>
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                    <div className="phone-input-wrapper">
                                      <input
                                        type="tel"
                                        className="input"
                                        name="SMS"
                                        autoComplete="off"
                                        placeholder="234567890"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <label
                                  className="entry__error entry__error--primary"
                                  style={{
                                    fontSize: '16px',
                                    textAlign: 'left',
                                    fontFamily: 'Helvetica, sans-serif',
                                    color: '#661d1d',
                                    backgroundColor: '#ffeded',
                                    borderRadius: '3px',
                                    borderColor: '#ff4949'
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Message */}
                          <div style={{ padding: '3px 0' }}>
                            <div className="sib-input sib-form-block">
                              <div className="form__entry entry_block">
                                <div className="form__label-row">
                                  <label 
                                    className="entry__label" 
                                    style={{
                                      fontWeight: 600,
                                      textAlign: 'left',
                                      fontSize: '14px',
                                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                                      color: '#374151'
                                    }} 
                                    htmlFor="MESSAGE"
                                  >
                                    Message <span style={{ color: '#6B2D9E' }}>*</span>
                                  </label>
                                  <div className="entry__field">
                                    <textarea
                                      className="input"
                                      maxLength={1000}
                                      id="MESSAGE"
                                      name="MESSAGE"
                                      autoComplete="off"
                                      placeholder="Tell us about your needs — project details, timeline, questions..."
                                      data-required="true"
                                      required
                                      rows={4}
                                      style={{ resize: 'vertical', minHeight: '120px' }}
                                    />
                                  </div>
                                </div>
                                <label 
                                  className="entry__error entry__error--primary" 
                                  style={{
                                    fontSize: '16px',
                                    textAlign: 'left',
                                    fontFamily: 'Helvetica, sans-serif',
                                    color: '#661d1d',
                                    backgroundColor: '#ffeded',
                                    borderRadius: '3px',
                                    borderColor: '#ff4949'
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Submit Button */}
                          <div style={{ padding: '16px 0 0 0' }}>
                            <div className="sib-form-block" style={{ textAlign: 'left' }}>
                              <button 
                                className="sib-form-block__button sib-form-block__button-with-loader" 
                                style={{
                                  fontSize: '16px',
                                  textAlign: 'center',
                                  fontWeight: 600,
                                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                                  color: '#FFFFFF',
                                  background: 'linear-gradient(135deg, #6B2D9E 0%, #8B5CF6 100%)',
                                  borderRadius: '12px',
                                  borderWidth: '0px',
                                  padding: '14px 32px',
                                  width: '100%',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 4px 12px rgba(107, 45, 158, 0.3)'
                                }} 
                                form="sib-form" 
                                type="submit"
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = 'linear-gradient(135deg, #5B1D8E 0%, #7C3AED 100%)';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(107, 45, 158, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = 'linear-gradient(135deg, #6B2D9E 0%, #8B5CF6 100%)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 45, 158, 0.3)';
                                }}
                              >
                                <svg
                                  className="icon clickable__icon progress-indicator__icon sib-hide-loader-icon"
                                  viewBox="0 0 512 512"
                                  style={{ display: 'none', width: 0, height: 0 }}
                                >
                                  <path d="M460.116 373.846l-20.823-12.022c-5.541-3.199-7.54-10.159-4.663-15.874 30.137-59.886 28.343-131.652-5.386-189.946-33.641-58.394-94.896-95.833-161.827-99.676C261.028 55.961 256 50.751 256 44.352V20.309c0-6.904 5.808-12.337 12.703-11.982 83.556 4.306 160.163 50.864 202.11 123.677 42.063 72.696 44.079 162.316 6.031 236.832-3.14 6.148-10.75 8.461-16.728 5.01z" />
                                </svg>
                                Send Message
                              </button>
                            </div>
                          </div>

                          {/* Response Text */}
                          <div style={{ padding: '16px 0 0 0' }}>
                            <div 
                              className="sib-form-block" 
                              style={{
                                fontSize: '13px',
                                textAlign: 'center',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                                color: '#6b7280',
                                backgroundColor: 'transparent'
                              }}
                            >
                              <div className="sib-text-form-block">
                                
                              </div>
                            </div>
                          </div>

                          <input type="text" name="email_address_check" defaultValue="" className="input--hidden" />
                          <input type="hidden" name="locale" defaultValue="en" />
                        </form>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />

        {/* Brevo Form Script */}
        <Script 
          src="https://sibforms.com/forms/end-form/build/main.js" 
          strategy="lazyOnload"
        />
      </div>
    </PageProvider>
  );
}
