# Admin Panel Guide

## Accessing the Admin Panel

1. Visit your website homepage
2. Click the **"Admin"** button in the top-right navigation
3. You'll be taken to `/admin` where you can edit all content

## What You Can Edit

### 1. Site Name
- Change the website title that appears in the header and footer

### 2. Hero Section
- **Background Image URL**: Paste any image URL to change the main banner background
- **Main Heading**: The large text at the top (currently "Sell Car Detailing")
- **Subheading**: The description text below the heading

### 3. Services (3 packages)
Each service card has:
- **Badge Text**: "Premium" or "Most Popular" label
- **Price**: Dollar amount (e.g., $85, $95, $195)
- **Service Title**: Name of the package
- **Description**: Short description
- **Image URL**: Service card image
- **Duration**: Time in minutes
- **Features**:
  - Click the checkmark/X button to toggle if a feature is included (shown on homepage)
  - Edit the feature text
  - Add new features with "+ Add Feature" button
  - Remove features with trash icon
  - Only "included" features show on the homepage with green checkmarks

### 4. About Section
- **Heading**: Section title
- **First Paragraph**: Company story
- **Second Paragraph**: Additional info
- **Stat 1 & 2**: Two statistics with values and labels (e.g., "1000+", "Cars Detailed")
- **Image URL**: About section image

### 5. Contact Information
- **Phone Number**: Business phone
- **Email**: Contact email
- **Hours**: Weekday, Saturday, Sunday hours

## Saving Your Changes

1. **Save Changes Button**: At the top and bottom of the page
2. Your changes are saved to browser localStorage
3. Refresh the homepage to see your updates live!

## Resetting

- **Reset to Defaults Button**: Restores all original content
- This action cannot be undone!

## Tips

### Finding Images
1. Use image URLs from:
   - Unsplash.com (free stock photos)
   - Your own hosted images
   - Any publicly accessible image URL
2. Copy the image URL and paste it into the "Image URL" fields

### Best Practices
- Keep descriptions concise and compelling
- Use high-quality images (1200px+ width recommended)
- Toggle features strategically - show 3-4 included features per service
- Keep prices competitive
- Update contact info to match your business

## Technical Note

All data is stored in your browser's localStorage. This means:
- Changes persist across page refreshes
- Data is specific to your browser
- Clearing browser data will reset to defaults
- For production, consider upgrading to a database backend
