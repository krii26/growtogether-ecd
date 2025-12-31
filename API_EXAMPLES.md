# Milestones API Examples

## Add a Milestone with Image Upload

### JavaScript/React Example
```javascript
import API from '../api/api';

async function addMilestone(childId, milestoneData, imageFile) {
  const formData = new FormData();
  
  // Add all fields to FormData
  formData.append('child', childId);
  formData.append('category', milestoneData.category); // 'cognitive', 'social-emotional', etc.
  formData.append('title', milestoneData.title);
  formData.append('description', milestoneData.description);
  formData.append('date_achieved', milestoneData.date_achieved); // YYYY-MM-DD format
  
  if (imageFile) {
    formData.append('image', imageFile); // File object from input
  }
  
  try {
    const response = await API.post('milestones/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding milestone:', error);
    throw error;
  }
}

// Usage
const imageInput = document.querySelector('input[type="file"]');
const imageFile = imageInput.files[0];

await addMilestone(1, {
  category: 'cognitive',
  title: 'Counts to 10',
  description: 'Child can count from 1 to 10 accurately',
  date_achieved: '2025-12-15'
}, imageFile);
```

### cURL Example
```bash
# Simple milestone without image
curl -X POST http://127.0.0.1:8000/api/milestones/ \
  -H "Content-Type: application/json" \
  -d '{
    "child": 1,
    "category": "language",
    "title": "Speaks in complete sentences",
    "description": "Can form and speak complete sentences",
    "date_achieved": "2025-12-15"
  }'

# Milestone with image upload
curl -X POST http://127.0.0.1:8000/api/milestones/ \
  -F "child=1" \
  -F "category=physical" \
  -F "title=Rides a bicycle" \
  -F "description=Successfully rode a bike without training wheels" \
  -F "date_achieved=2025-12-20" \
  -F "image=@/path/to/image.jpg"
```

## Get All Milestones

### Filter by Child
```javascript
const response = await API.get('milestones/', {
  params: { child: childId }
});
// Returns array of milestones for that child
```

### cURL
```bash
curl http://127.0.0.1:8000/api/milestones/?child=1
```

## Get Specific Milestone
```javascript
const milestone = await API.get(`milestones/1/`);
console.log(milestone.data);
// {
//   id: 1,
//   child: 1,
//   category: "cognitive",
//   title: "Counts to 10",
//   description: "...",
//   date_achieved: "2025-12-15",
//   image: "http://127.0.0.1:8000/media/milestone_images/..."
// }
```

## Update Milestone
```javascript
async function updateMilestone(milestoneId, updates) {
  const response = await API.patch(`milestones/${milestoneId}/`, updates);
  return response.data;
}

// Usage
await updateMilestone(1, {
  title: 'Updated title',
  description: 'Updated description'
});
```

## Delete Milestone
```javascript
async function deleteMilestone(milestoneId) {
  await API.delete(`milestones/${milestoneId}/`);
}

// Usage
await deleteMilestone(1);
```

## API Response Examples

### Add Milestone Response (201 Created)
```json
{
  "id": 5,
  "child": 1,
  "category": "cognitive",
  "title": "Counts to 10",
  "description": "Successfully counts from 1 to 10",
  "date_achieved": "2025-12-15",
  "image": "http://127.0.0.1:8000/media/milestone_images/milestone_child1_img.jpg"
}
```

### List Milestones Response (200 OK)
```json
[
  {
    "id": 1,
    "child": 1,
    "category": "social-emotional",
    "title": "Shows affection to familiar people",
    "description": "Smiles and hugs when seeing parents",
    "date_achieved": "2025-12-01",
    "image": "http://127.0.0.1:8000/media/milestone_images/milestone_1.jpg"
  },
  {
    "id": 2,
    "child": 1,
    "category": "cognitive",
    "title": "Recognizes basic colors",
    "description": "Can identify red, blue, yellow, and green",
    "date_achieved": "2025-12-10",
    "image": "http://127.0.0.1:8000/media/milestone_images/milestone_2.jpg"
  },
  {
    "id": 3,
    "child": 1,
    "category": "language",
    "title": "Speaks in complete sentences",
    "description": "Forms sentences with 5+ words",
    "date_achieved": "2025-12-12",
    "image": null
  }
]
```

## Categories Available

```javascript
const categories = {
  'social-emotional': 'Social-Emotional',
  'cognitive': 'Cognitive',
  'physical': 'Physical',
  'language': 'Language'
};
```

## Complete Add Milestone Example from Milestones.js

```javascript
const handleAddMilestone = async (e) => {
  e.preventDefault();
  
  if (!form.title.trim()) {
    setError('Please enter a milestone title');
    return;
  }

  setUploading(true);
  try {
    const formData = new FormData();
    formData.append('child', childId);
    formData.append('category', selectedCategory);
    formData.append('title', form.title);
    formData.append('description', form.description);
    
    if (form.date_achieved) {
      formData.append('date_achieved', form.date_achieved);
    }
    
    if (form.image) {
      formData.append('image', form.image);
    }

    // Make POST request
    const response = await API.post('milestones/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // Refresh milestones list
    await fetchChildAndMilestones();
    
    // Clear modal
    setShowAddModal(false);
    setForm({
      title: '',
      description: '',
      date_achieved: '',
      image: null,
      imagePreview: null
    });
    
  } catch (err) {
    console.error('Error adding milestone:', err);
    setError('Failed to add milestone. Please try again.');
  } finally {
    setUploading(false);
  }
};
```

## Image Handling Details

### File Input Handling
```javascript
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Create preview URL
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      image: file,
      imagePreview: preview
    }));
  }
};
```

### Displaying Milestone Image
```javascript
{milestone.image && (
  <div style={{
    marginTop: '10px',
    borderRadius: '4px',
    overflow: 'hidden'
  }}>
    <img
      src={milestone.image}
      alt={milestone.title}
      style={{
        width: '100%',
        height: '150px',
        objectFit: 'cover'
      }}
    />
  </div>
)}
```

## Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "child": ["This field is required."],
  "category": ["\"invalid\" is not a valid choice."],
  "title": ["This field may not be blank."]
}
```

**404 Not Found**
```json
{
  "detail": "Not found."
}
```

**413 Request Entity Too Large**
```json
{
  "image": ["File too large."]
}
```

### Error Handling in React
```javascript
try {
  await API.post('milestones/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
} catch (err) {
  if (err.response?.status === 400) {
    // Validation error
    console.log(err.response.data);
  } else if (err.response?.status === 413) {
    setError('Image file is too large');
  } else {
    setError('Failed to add milestone');
  }
}
```

## Testing with Django Admin

### Access Admin
1. Go to http://127.0.0.1:8000/admin
2. Log in with superuser credentials
3. Navigate to "Milestones"
4. View, edit, or add milestones directly

### Command Line Testing
```bash
# Open Django shell
python manage.py shell

# Create milestone
from ecd_app.models import Child, Milestone
child = Child.objects.first()
milestone = Milestone.objects.create(
    child=child,
    category='cognitive',
    title='Test Milestone',
    description='A test milestone'
)

# List all milestones
Milestone.objects.all()

# Filter by child
Milestone.objects.filter(child=child)

# Filter by category
Milestone.objects.filter(category='cognitive')
```

## Pagination (Future Enhancement)

Currently, all milestones are returned. To add pagination:

```javascript
// In API call
const response = await API.get('milestones/', {
  params: { 
    child: childId,
    page: 1,
    page_size: 10
  }
});
// response.data.results contains milestones
// response.data.count contains total count
```

## Performance Considerations

- Images are stored on disk in `media/milestone_images/`
- For production, consider cloud storage (S3, Google Cloud, etc.)
- Optimize images before upload
- Consider caching milestone lists

## Mobile Considerations

- Image upload works on mobile via file input
- Camera capture supported: `<input accept="image/*" capture>`
- Responsive grid adapts to screen size
- Touch-friendly button sizing

---

For more examples and troubleshooting, see `MILESTONES_FEATURE.md`.
