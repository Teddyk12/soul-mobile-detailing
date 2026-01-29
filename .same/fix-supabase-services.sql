-- Fix: Update website_content with all 6 services
-- Run this in Supabase SQL Editor

UPDATE website_content
SET services = '[
  {
    "id": "interior",
    "badge": "Interior Only",
    "image": "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=600&fit=crop&q=80",
    "title": "Interior Only",
    "price": 169.99,
    "description": "Complete interior detailing service (3 hours)",
    "features": [
      {"text": "Vacuum interior carpets, mats, seats & trunk", "included": true},
      {"text": "Clean & polish dash, console, glove box", "included": true},
      {"text": "Getting in all cracks and crevices", "included": true},
      {"text": "Clean interior & exterior windows", "included": true},
      {"text": "Clean & polish all door panels", "included": true},
      {"text": "Wipe & clean all door jambs", "included": true},
      {"text": "Spot shampooing (upgrade to full $50)", "included": false},
      {"text": "Pet-hair removal (add $50/hr)", "included": false}
    ],
    "duration": 180
  },
  {
    "id": "exterior",
    "badge": "Exterior Only",
    "image": "https://images.unsplash.com/photo-1633014041037-f5446fb4ce99?w=800&h=600&fit=crop&q=80",
    "title": "Exterior Only",
    "price": 159.99,
    "description": "Professional exterior detailing service (3 hours)",
    "features": [
      {"text": "Hand wash & Dry", "included": true},
      {"text": "Remove road tar and pitch", "included": true},
      {"text": "Clean interior & exterior windows", "included": true},
      {"text": "Clean & dress wheels, tires", "included": true},
      {"text": "Remove contaminants with clay bar", "included": true},
      {"text": "Polish and hand wax or ceramic spray wax", "included": true}
    ],
    "duration": 180
  },
  {
    "id": "gold",
    "badge": "Value",
    "image": "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=600&fit=crop&q=80",
    "title": "Gold Package",
    "price": 189.99,
    "description": "Quick professional detail inside and out (2.5 hours)",
    "features": [
      {"text": "Hand wash and dry", "included": true},
      {"text": "Quick vacuum interior carpets & trunk", "included": true},
      {"text": "Clean interior & exterior windows", "included": true},
      {"text": "Clean & dress wheels and tires", "included": true},
      {"text": "Wipe down door panels & dash", "included": true},
      {"text": "Wipe & clean door & trunk jambs", "included": true},
      {"text": "Spray on wax or ceramic spray wax", "included": true}
    ],
    "duration": 150
  },
  {
    "id": "platinum",
    "badge": "Popular",
    "image": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&q=80",
    "title": "Platinum Package",
    "price": 229.99,
    "description": "Comprehensive detail service (3 hours)",
    "features": [
      {"text": "Hand wash and dry", "included": true},
      {"text": "Vacuum interior carpets & trunk", "included": true},
      {"text": "Clean interior & exterior windows", "included": true},
      {"text": "Clean & dress wheels and tires", "included": true},
      {"text": "Wipe down dash and door panels", "included": true},
      {"text": "Clean & polish door panels", "included": true},
      {"text": "Wipe & clean door, trunk jambs", "included": true},
      {"text": "Spray on wax or ceramic spray wax", "included": true}
    ],
    "duration": 180
  },
  {
    "id": "full",
    "badge": "Best for Resale",
    "image": "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop&q=80",
    "title": "Full Package",
    "price": 279.99,
    "description": "Recommended for those selling their vehicle (4 hours)",
    "features": [
      {"text": "Hand wash and dry", "included": true},
      {"text": "Vacuum interior carpets & trunk", "included": true},
      {"text": "Clean & polish dashboard, console & glove box", "included": true},
      {"text": "Clean interior & exterior windows", "included": true},
      {"text": "Wipe & clean door & trunk jambs", "included": true},
      {"text": "Clean & polish door panels", "included": true},
      {"text": "Spot Shampoo interior (upgrade to full $50)", "included": true},
      {"text": "Clean & dress wheels and tires", "included": true},
      {"text": "De-grease engine & dress", "included": true},
      {"text": "Spray wax or ceramic spray wax", "included": true}
    ],
    "duration": 240
  },
  {
    "id": "diamond",
    "badge": "Ultimate",
    "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&q=80",
    "title": "Diamond Package",
    "price": 359.99,
    "description": "Our most comprehensive detailing service (5 hours)",
    "features": [
      {"text": "Hand wash and dry", "included": true},
      {"text": "Vacuum & shampoo interior carpets & seats", "included": true},
      {"text": "Steam clean interior where needed", "included": true},
      {"text": "Treat & condition all leather and vinyl", "included": true},
      {"text": "Clean & polish dash, console, door panels", "included": true},
      {"text": "Clean interior & exterior windows", "included": true},
      {"text": "Wipe & clean door & trunk jambs", "included": true},
      {"text": "Clean & dress wheels and tires", "included": true},
      {"text": "De-grease engine & dress", "included": true},
      {"text": "Remove contaminants with clay-bar", "included": true},
      {"text": "Revive all exterior trims", "included": true},
      {"text": "Paint polish with hand wax/sealant/ceramic", "included": true}
    ],
    "duration": 300
  }
]'::jsonb;
