# DocBooking Logo System Guide

## Overview
Complete logo system integrated across your Next.js App Router project with professional branding.

---

## 📁 Logo Files Location
All logos are stored in `/public/logos/`:

| File | Purpose | Usage |
|------|---------|-------|
| `docbooking-logo-primary.svg` | Hero section, marketing materials | Landing page hero, large displays |
| `docbooking-logo-horizontal.svg` | Navigation bar, headers | Navbar branding, compact spaces |
| `docbooking-logo-dark-bg.svg` | Dark backgrounds, footers | Footer, dark sections |
| `docbooking-icon.svg` | App icon, profile pictures | Avatars, small icons, PWA |
| `favicon.svg` | Browser tab icon | Browser tab, bookmarks |

---

## ✅ Integration Status

### Completed Implementations

#### 1. **Navbar (Header)** ✅
- **File**: `app/layout.tsx`
- **Implementation**: Replaced text "D" icon with `docbooking-logo-horizontal.svg`
- **Styling**: 
  ```html
  <img
    src="/logos/docbooking-logo-horizontal.svg"
    alt="DocBooking"
    className="h-10 w-auto"
  />
  ```
- **Height**: 40px (h-10)
- **Responsive**: Yes, maintains aspect ratio on all screens

#### 2. **Hero Section** ✅
- **File**: `app/page.tsx`
- **Implementation**: Added `docbooking-logo-primary.svg` above headline
- **Styling**:
  ```html
  <img
    src="/logos/docbooking-logo-primary.svg"
    alt="DocBooking"
    className="h-16 w-auto"
  />
  ```
- **Height**: 64px (h-16)
- **Placement**: Above "Skip OPD Queues" headline
- **Spacing**: `mb-6` margin below logo

#### 3. **Footer** ✅
- **File**: `app/page.tsx`
- **Implementation**: Replaced "DocBooking.in" text with dark background logo
- **Styling**:
  ```html
  <img
    src="/logos/docbooking-logo-dark-bg.svg"
    alt="DocBooking"
    className="h-12 w-auto"
  />
  ```
- **Height**: 48px (h-12)
- **Background**: Works perfectly on dark gray (bg-gray-900)
- **Spacing**: `mb-4` margin below logo

#### 4. **Favicon** ✅
- **File**: `app/layout.tsx`
- **Implementation**: Added to metadata
- **Configuration**:
  ```typescript
  icons: {
    icon: "/logos/favicon.svg",
  }
  ```
- **Displays in**: Browser tab, bookmarks, address bar

---

## 🎨 Logo Usage Guidelines

### Navbar Logo (Horizontal)
- **Size**: 40px height (h-10)
- **Context**: Sticky header, all pages
- **Background**: White (#ffffff)
- **When to use**: Compact spaces, persistent branding
- **Responsive**: Maintains aspect ratio on mobile

### Hero Logo (Primary)
- **Size**: 64px height (h-16) or larger on desktop
- **Context**: Landing page main section
- **Background**: Gradient blue (from-blue-50 via-white to-blue-50)
- **When to use**: Large, prominent display
- **Responsive**: Used on desktop and mobile hero

### Footer Logo (Dark Background)
- **Size**: 48px height (h-12)
- **Context**: Footer, dark sections
- **Background**: Dark gray (bg-gray-900)
- **When to use**: Dark backgrounds, footer area
- **Responsive**: Maintains visibility on dark backgrounds

### Icon Logo (Small)
- **Size**: 24px-32px (h-6 to h-8)
- **Context**: Avatars, profile pictures, small UI elements
- **Use cases**:
  - Doctor profile pictures (future enhancement)
  - App notifications
  - PWA manifest icon
  - Dashboard profiles
  - Social media sharing
- **Example**:
  ```html
  <img
    src="/logos/docbooking-icon.svg"
    alt="DocBooking"
    className="h-8 w-8 rounded-full"
  />
  ```

### Favicon
- **Size**: Automatically handled by browser
- **Location**: Browser tab, bookmarks
- **Format**: SVG (scales to any size)
- **No action needed**: Already integrated

---

## 🔄 Current Implementation Summary

### Pages Using Logos:
1. **Root Layout** (`app/layout.tsx`)
   - Navbar with horizontal logo
   - Favicon in metadata

2. **Homepage** (`app/page.tsx`)
   - Hero section with primary logo
   - Footer with dark background logo

3. **All Other Pages** (inherit from root layout)
   - Navbar logo + favicon automatically

---

## 🚀 Future Logo Usage

### Recommended Future Enhancements:

#### Doctor Detail Page (`/doctor/[id]`)
```html
<!-- Could add profile icon next to doctor name -->
<img src="/logos/docbooking-icon.svg" className="h-6 w-6 inline" />
```

#### Admin Panel (`/admin`)
Already inherits navbar logo from layout

#### Booking Modal
```html
<!-- Success state with logo -->
<img src="/logos/docbooking-icon.svg" className="h-12 w-12" />
```

#### PWA Configuration (`next.config.ts`)
```typescript
// Add to manifest for iOS
manifest: {
  icons: [
    {
      src: '/logos/docbooking-icon.svg',
      sizes: '192x192',
      type: 'image/svg+xml',
      purpose: 'any'
    }
  ]
}
```

---

## 📱 Responsive Design

All logos use `w-auto` to maintain aspect ratio:
- **Mobile**: Logos scale down automatically
- **Tablet**: Natural sizing
- **Desktop**: Full sized

Example responsive sizing:
```html
<!-- Navbar (all screens) -->
<img className="h-10 w-auto" />

<!-- Hero (all screens) -->
<img className="h-16 w-auto md:h-20 lg:h-24" />
```

---

## 🎯 Best Practices

### Do's ✅
- ✅ Use provided SVG files exactly
- ✅ Maintain aspect ratio with `w-auto`
- ✅ Use appropriate sizes from guidelines
- ✅ Check contrast on different backgrounds
- ✅ Keep appropriate spacing around logos

### Don'ts ❌
- ❌ Don't stretch or distort logos
- ❌ Don't use incorrect color variations
- ❌ Don't place on conflicting backgrounds
- ❌ Don't remove alt text
- ❌ Don't use placeholder logos alongside official ones

---

## 🔗 Implementation Checklist

- ✅ Logo files in `/public/logos/`
- ✅ Navbar logo in `app/layout.tsx`
- ✅ Favicon in metadata
- ✅ Hero logo in `app/page.tsx`
- ✅ Footer logo in `app/page.tsx`
- ✅ All images have `alt` text
- ✅ All logos maintain aspect ratio
- ✅ Responsive on mobile devices
- ✅ Professional appearance
- ✅ Consistent branding across pages

---

## 📊 Logo Specifications

| Logo | File Format | Recommended Size | Aspect Ratio |
|------|-------------|------------------|--------------|
| Primary | SVG | h-16 to h-20 | ~2:1 (landscape) |
| Horizontal | SVG | h-10 to h-12 | ~4:1 (landscape) |
| Dark Background | SVG | h-12 to h-16 | ~2:1 (landscape) |
| Icon | SVG | h-6 to h-8 | 1:1 (square) |
| Favicon | SVG | auto | 1:1 (square) |

---

## 💡 Troubleshooting

### Logo not displaying?
- ✅ Check file names are lowercase in `/public/logos/`
- ✅ Verify Next.js is serving `/public` correctly
- ✅ Check browser console for 404 errors
- ✅ Ensure SVG files are not corrupted

### Logo stretched or distorted?
- ✅ Ensure `w-auto` is set in className
- ✅ Remove any width/height attributes in SVG
- ✅ Check for fixed width constraints

### Logo not visible on dark background?
- ✅ Use `docbooking-logo-dark-bg.svg` for dark sections
- ✅ Check color contrast
- ✅ Add background color padding if needed

---

## 📝 Notes

- All SVG files are production-ready
- No external logo generation needed
- Perfect for Vercel deployment
- Cross-browser compatible
- Mobile-friendly
- PWA-ready for future iOS/Android app

---

**Status**: Production Ready ✅  
**Last Updated**: April 2026  
**Next.js Version**: 16.2.2
