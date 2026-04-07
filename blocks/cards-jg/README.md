# Cards V3

An enhanced card grid block that combines the full feature set of the original Cards block (image support, responsive grid) with per-card title, body text, background color, and text color controls.

## Features

- **Image** — Optional card image with 4:3 aspect ratio (same as original Cards block)
- **Title** — Bold heading (`h3`) displayed above body text
- **Body text** — Rich text supporting paragraphs, lists, and links
- **Background color** — Per-card background color (any valid CSS color value)
- **Text color** — Per-card text color (any valid CSS color value)

## Authoring in da.live

1. Add a **Cards V3** block to your page section
2. Inside it, add **Card V3** rows — each row has 5 columns:

| Column | Field | Description | Example |
|--------|-------|-------------|---------|
| 1 | Image | Card image (optional) | Upload or select an image |
| 2 | Title | Card heading (bold by default) | `Our Services` |
| 3 | Body Text | Rich text content | Paragraphs, lists, links |
| 4 | Background Color | CSS color value (optional) | `#1a73e8` or `blue` |
| 5 | Text Color | CSS color value (optional) | `#ffffff` or `white` |

3. Add as many Card V3 rows as needed — the grid auto-fills at a minimum card width of 257px

## Example Block Table

```
| Cards V3      |               |                      |         |         |
|---------------|---------------|----------------------|---------|---------|
| [image]       | Card Title    | Body text goes here  | #1a73e8 | #ffffff |
| [image]       | Second Card   | More body text here  | #f5f5f5 | #333333 |
|               | No Image Card | Works without image  | #000000 | #ffffff |
```

## Notes

- Image is optional — cards without images display title and body only
- If no background color is set, cards use the default page background
- If no text color is set, cards inherit the page text color
- Colors apply to the entire card (title + body + any links)
- Images are automatically optimized at 750px width
