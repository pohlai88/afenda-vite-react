import { type Registry } from 'shadcn/schema'

export const ui: Registry['items'] = [
  {
    name: 'accordion',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/accordion.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'alert',
    type: 'registry:ui',
    files: [
      {
        path: '../../../design-system/ui-primitives/alert.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'alert-dialog',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    registryDependencies: ['button'],
    files: [
      {
        path: '../../../design-system/ui-primitives/alert-dialog.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'aspect-ratio',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/aspect-ratio.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'avatar',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/avatar.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'badge',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/badge.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'breadcrumb',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/breadcrumb.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'button',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/button.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'button-group',
    type: 'registry:ui',
    registryDependencies: ['button', 'separator'],
    files: [
      {
        path: '../../../design-system/ui-primitives/button-group.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'calendar',
    type: 'registry:ui',
    dependencies: ['react-day-picker@latest', 'date-fns'],
    registryDependencies: ['button'],
    files: [
      {
        path: '../../../design-system/ui-primitives/calendar.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'card',
    type: 'registry:ui',
    files: [
      {
        path: '../../../design-system/ui-primitives/card.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'carousel',
    type: 'registry:ui',
    files: [
      {
        path: '../../../design-system/ui-primitives/carousel.tsx',
        type: 'registry:ui',
      },
    ],
    registryDependencies: ['button'],
    dependencies: ['embla-carousel-react'],
  },
  {
    name: 'chart',
    type: 'registry:ui',
    files: [
      {
        path: '../../../design-system/ui-primitives/chart.tsx',
        type: 'registry:ui',
      },
    ],
    registryDependencies: ['card'],
    dependencies: ['recharts@3.8.0', 'lucide-react'],
  },
  {
    name: 'checkbox',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/checkbox.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'collapsible',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/collapsible.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'combobox',
    type: 'registry:ui',
    dependencies: ['@base-ui/react'],
    registryDependencies: ['button', 'input-group'],
    files: [
      {
        path: '../../../design-system/ui-primitives/combobox.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'command',
    type: 'registry:ui',
    dependencies: ['cmdk'],
    registryDependencies: ['dialog'],
    files: [
      {
        path: '../../../design-system/ui-primitives/command.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'context-menu',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/context-menu.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'dialog',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/dialog.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'drawer',
    type: 'registry:ui',
    dependencies: ['vaul'],
    files: [
      {
        path: '../../../design-system/ui-primitives/drawer.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'dropdown-menu',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/dropdown-menu.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'empty',
    type: 'registry:ui',
    files: [
      {
        path: '../../../design-system/ui-primitives/empty.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'field',
    type: 'registry:ui',
    registryDependencies: ['label', 'separator'],
    files: [
      {
        path: '../../../design-system/ui-primitives/field.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'form',
    type: 'registry:ui',
    dependencies: ['radix-ui', '@hookform/resolvers', 'zod', 'react-hook-form'],
    registryDependencies: ['button', 'label'],
    files: [
      {
        path: '../../../design-system/ui-primitives/form.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'hover-card',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/hover-card.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'input',
    type: 'registry:ui',
    files: [
      {
        path: '../../../design-system/ui-primitives/input.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'input-group',
    type: 'registry:ui',
    registryDependencies: ['button', 'input', 'textarea'],
    files: [
      {
        path: '../../../design-system/ui-primitives/input-group.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'input-otp',
    type: 'registry:ui',
    dependencies: ['input-otp'],
    files: [
      {
        path: '../../../design-system/ui-primitives/input-otp.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'item',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    registryDependencies: ['separator'],
    files: [
      {
        path: '../../../design-system/ui-primitives/item.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'label',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/label.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'menubar',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/menubar.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'navigation-menu',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/navigation-menu.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'pagination',
    type: 'registry:ui',
    registryDependencies: ['button'],
    files: [
      {
        path: '../../../design-system/ui-primitives/pagination.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'popover',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/popover.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'progress',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/progress.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'radio-group',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/radio-group.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'resizable',
    type: 'registry:ui',
    dependencies: ['react-resizable-panels@^4'],
    files: [
      {
        path: '../../../design-system/ui-primitives/resizable.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'scroll-area',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/scroll-area.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'select',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/select.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'separator',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/separator.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'sheet',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/sheet.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'sidebar',
    type: 'registry:ui',
    dependencies: ['radix-ui', 'class-variance-authority', 'lucide-react'],
    registryDependencies: [
      'button',
      'separator',
      'sheet',
      'tooltip',
      'input',
      'use-mobile',
      'skeleton',
    ],
    files: [
      {
        path: '../../../design-system/ui-primitives/sidebar.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'skeleton',
    type: 'registry:ui',
    files: [
      {
        path: '../../../design-system/ui-primitives/skeleton.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'slider',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/slider.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'sonner',
    type: 'registry:ui',
    dependencies: ['sonner', 'next-themes'],
    files: [
      {
        path: '../../../design-system/ui-primitives/sonner.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'spinner',
    type: 'registry:ui',
    dependencies: ['class-variance-authority'],
    files: [
      {
        path: '../../../design-system/ui-primitives/spinner.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'switch',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/switch.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'table',
    type: 'registry:ui',
    files: [
      {
        path: '../../../design-system/ui-primitives/table.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'tabs',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/tabs.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'textarea',
    type: 'registry:ui',
    files: [
      {
        path: '../../../design-system/ui-primitives/textarea.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'toggle',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    files: [
      {
        path: '../../../design-system/ui-primitives/toggle.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'toggle-group',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    registryDependencies: ['toggle'],
    files: [
      {
        path: '../../../design-system/ui-primitives/toggle-group.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'tooltip',
    type: 'registry:ui',
    dependencies: ['radix-ui'],
    docs: `The \`tooltip\` component has been added. Remember to wrap your app with the \`TooltipProvider\` component.

\`\`\`tsx title="app/layout.tsx"
import { TooltipProvider } from "@afenda/design-system/ui-primitives/tooltip"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
\`\`\`
`,
    files: [
      {
        path: '../../../design-system/ui-primitives/tooltip.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'kbd',
    type: 'registry:ui',
    files: [
      {
        path: '../../../design-system/ui-primitives/kbd.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'native-select',
    type: 'registry:ui',
    files: [
      {
        path: '../../../design-system/ui-primitives/native-select.tsx',
        type: 'registry:ui',
      },
    ],
  },
  {
    name: 'direction',
    type: 'registry:ui',
    files: [
      {
        path: '../../../design-system/ui-primitives/direction.tsx',
        type: 'registry:ui',
      },
    ],
  },
]
