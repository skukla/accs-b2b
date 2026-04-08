# Promotional Hero V2

An extended version of the Promotional Hero block with configurable CTA button background color and text color.

## What's New in V2

- **CTA Button Background Color** — Set any CSS color value for the CTA button background
- **CTA Button Text Color** — Set any CSS color value for the CTA button text

All other Promotional Hero features (layout, image ratio, content style, hover effects, etc.) work identically to the original block.

## Authoring in da.live

1. Add a **Promotional Hero V2** block to your page section
2. Edit the block content exactly as you would a standard Promotional Hero (image, heading, CTA links)
3. At the bottom of the block HTML, find the two config rows and fill in your color values:

| Row key | Value | Example |
|---------|-------|---------|
| `cta-button-color` | CSS color for button background | `#1a73e8` or `blue` |
| `cta-text-color` | CSS color for button text | `#ffffff` or `white` |

## Example

The block table has your promotional content rows followed by two color config rows:

```
| Promotional Hero V2 |                  |              |
|---------------------|------------------|--------------|
| [image]             | Heading text     | [CTA link]   |
| cta-button-color    | #1a73e8          |              |
| cta-text-color      | #ffffff          |              |
```

## Notes

- If no color values are provided, the block uses the default button styling from the original Promotional Hero
- Colors accept any valid CSS value: hex (`#ff0000`), named colors (`red`), `rgb()`, `hsl()`, etc.
- The CTA button color also applies to the button border for a cohesive look
