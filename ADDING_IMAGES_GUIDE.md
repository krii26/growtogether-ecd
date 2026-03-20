# How to Add Images to E-Library Resources

## Option 1: Through Django Admin Panel (Recommended)

1. **Start the Django server:**
   ```bash
   python manage.py runserver
   ```

2. **Go to the admin panel:**
   - Visit: http://localhost:8000/admin/
   - Login with your superuser credentials

3. **Add/Edit a resource:**
   - Navigate to: **E-Library** section
   - Click "Add E-Library" (or edit an existing one)
   - Fill in the fields:
     - **Title**: Name of the resource
     - **Category**: Select from dropdown (Nutrition, Psychology, etc.)
     - **Resource Type**: PDF, Video, Image, or Document
     - **Description**: Brief description
     - **Image**: Click "Choose File" and upload an image from your computer
     - **File URL**: The link to the actual resource (PDF, article, etc.)
   - Click **Save**

4. **Image Requirements:**
   - Supported formats: JPG, PNG, GIF
   - Recommended size: 1200x800px (or 3:2 aspect ratio)
   - Max file size: Typically 5MB

## Option 2: Using Image URLs

If you have images hosted online, you can still use external URLs:
- The image field can accept both uploaded files and external URLs
- Make sure the URL is publicly accessible

## Where Images Are Stored

- Uploaded images are saved in: `media/library_images/`
- They're automatically served at: `http://localhost:8000/media/library_images/filename.jpg`

## Example: Adding a New Resource

**Title:** Child Nutrition Guide  
**Category:** Nutrition  
**Resource Type:** PDF  
**Description:** Complete guide to healthy eating for children  
**Image:** Upload a food-related image  
**File URL:** https://example.com/nutrition-guide.pdf  

The image will appear as the card thumbnail in the E-Library page!
