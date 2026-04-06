# shadcn/ui Available Components

## ✅ Currently Installed Components (31)

1. alert
2. alert-dialog
3. avatar
4. badge
5. breadcrumb
6. button
7. card
8. checkbox
9. collapsible
10. command
11. dialog
12. dropdown-menu
13. input
14. input-group
15. label
16. menubar
17. navigation-menu
18. progress
19. radio-group
20. scroll-area
21. select
22. separator
23. sheet
24. sidebar
25. skeleton
26. sonner
27. switch
28. table
29. tabs
30. textarea
31. tooltip

## 🔄 Missing Core UI Components (29)

### Form & Input Components

1. **accordion** - Collapsible content panels

   ```bash
   npx shadcn@latest add accordion
   ```

2. **calendar** - Date selection calendar

   ```bash
   npx shadcn@latest add calendar
   ```

3. **combobox** - Searchable select dropdown

   ```bash
   npx shadcn@latest add combobox
   ```

4. **field** - Form field wrapper with label and validation

   ```bash
   npx shadcn@latest add field
   ```

5. **form** - Form components with validation (React Hook Form)

   ```bash
   npx shadcn@latest add form
   ```

6. **input-otp** - One-time password input

   ```bash
   npx shadcn@latest add input-otp
   ```

7. **native-select** - Native HTML select element

   ```bash
   npx shadcn@latest add native-select
   ```

8. **slider** - Range slider input

   ```bash
   npx shadcn@latest add slider
   ```

9. **toggle** - Toggle button component

   ```bash
   npx shadcn@latest add toggle
   ```

10. **toggle-group** - Group of toggle buttons
    ```bash
    npx shadcn@latest add toggle-group
    ```

### Display & Feedback Components

11. **aspect-ratio** - Container with aspect ratio

    ```bash
    npx shadcn@latest add aspect-ratio
    ```

12. **button-group** - Group of related buttons

    ```bash
    npx shadcn@latest add button-group
    ```

13. **carousel** - Image/content carousel with Embla

    ```bash
    npx shadcn@latest add carousel
    ```

14. **chart** - Chart components with Recharts

    ```bash
    npx shadcn@latest add chart
    ```

15. **drawer** - Bottom drawer/modal

    ```bash
    npx shadcn@latest add drawer
    ```

16. **empty** - Empty state placeholder

    ```bash
    npx shadcn@latest add empty
    ```

17. **hover-card** - Hoverable card with content

    ```bash
    npx shadcn@latest add hover-card
    ```

18. **item** - List item component

    ```bash
    npx shadcn@latest add item
    ```

19. **kbd** - Keyboard key display

    ```bash
    npx shadcn@latest add kbd
    ```

20. **pagination** - Pagination controls

    ```bash
    npx shadcn@latest add pagination
    ```

21. **popover** - Floating popover container

    ```bash
    npx shadcn@latest add popover
    ```

22. **resizable** - Resizable panels

    ```bash
    npx shadcn@latest add resizable
    ```

23. **spinner** - Loading spinner
    ```bash
    npx shadcn@latest add spinner
    ```

### Navigation & Menu Components

24. **context-menu** - Right-click context menu
    ```bash
    npx shadcn@latest add context-menu
    ```

### Utility Components

25. **direction** - RTL/LTR direction provider
    ```bash
    npx shadcn@latest add direction
    ```

## 🎨 Themes (5)

```bash
npx shadcn@latest add theme-stone
npx shadcn@latest add theme-zinc
npx shadcn@latest add theme-neutral
npx shadcn@latest add theme-gray
npx shadcn@latest add theme-slate
```

## 🪝 Hooks (1)

✅ **use-mobile** - Already installed

## 📦 Blocks (100+)

Blocks are pre-built page sections and layouts:

### Dashboard Blocks

- dashboard-01

### Sidebar Blocks (16)

- sidebar-01 through sidebar-16

### Authentication Blocks (10)

- login-01 through login-05
- signup-01 through signup-05

### Chart Blocks (70+)

- Area charts (10 variants)
- Bar charts (15 variants)
- Line charts (10 variants)
- Pie charts (11 variants)
- Radar charts (14 variants)
- Radial charts (6 variants)
- Tooltip demos (9 variants)

## 🚀 Quick Install Commands

### Install All Missing Core Components

```bash
cd packages/ui

# Essential Form Components
npx shadcn@latest add accordion calendar combobox field form input-otp slider toggle toggle-group native-select

# Display & Feedback
npx shadcn@latest add aspect-ratio button-group carousel chart drawer empty hover-card item kbd pagination popover resizable spinner

# Navigation
npx shadcn@latest add context-menu

# Utility
npx shadcn@latest add direction
```

### Install Most Commonly Used Components

```bash
cd packages/ui
npx shadcn@latest add accordion calendar combobox form popover hover-card drawer pagination slider toggle
```

### Install Advanced Components

```bash
cd packages/ui
npx shadcn@latest add carousel chart resizable context-menu
```

## 📊 Component Priority Recommendations

### High Priority (Most Used)

1. ✅ form - For form validation
2. ✅ popover - For floating content
3. ✅ hover-card - For hover interactions
4. ✅ calendar - For date pickers
5. ✅ accordion - For collapsible sections
6. ✅ pagination - For data tables
7. ✅ combobox - For searchable selects
8. ✅ drawer - For mobile-friendly modals
9. ✅ context-menu - For right-click menus
10. ✅ slider - For range inputs

### Medium Priority

11. toggle - For toggle buttons
12. toggle-group - For button groups
13. carousel - For image galleries
14. chart - For data visualization
15. resizable - For split panes
16. kbd - For keyboard shortcuts
17. field - For form fields
18. input-otp - For OTP inputs
19. aspect-ratio - For responsive media
20. button-group - For related buttons

### Low Priority

21. empty - For empty states
22. item - For list items
23. spinner - For loading states (can use skeleton)
24. direction - For RTL support
25. native-select - For native selects

## 📝 Notes

- **Total Available**: 60+ UI components
- **Currently Installed**: 31 components (52%)
- **Missing**: 29 components (48%)
- **Blocks**: 100+ pre-built layouts available
- **Hooks**: 1 hook available

## 🔗 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Component Registry](https://ui.shadcn.com/docs/components)
- [Blocks](https://ui.shadcn.com/blocks)
- [Themes](https://ui.shadcn.com/themes)
