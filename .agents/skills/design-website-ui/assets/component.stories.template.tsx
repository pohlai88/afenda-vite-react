// Use this template only when Storybook is installed for the target package.
// In apps/web today, stories are preparatory artifacts unless Storybook is added.

import type { Meta, StoryObj } from "@storybook/react-vite"

import { ExampleComponent } from "./example-component"

const meta = {
  title: "Website/ExampleComponent",
  component: ExampleComponent,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    title: "Proof-led website component",
    description:
      "Replace this fixture copy with realistic content from the page or feature.",
  },
} satisfies Meta<typeof ExampleComponent>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Dense: Story = {
  args: {
    title: "Dense state",
    description:
      "Use this state to verify spacing, copy wrapping, and small-screen readability.",
  },
}

export const WithImage: Story = {
  render: (args) => (
    <div className="max-w-4xl">
      <ExampleComponent
        {...args}
        imageSrc="/example-image.png"
        imageAlt="Replace with a meaningful description"
      />
    </div>
  ),
}
