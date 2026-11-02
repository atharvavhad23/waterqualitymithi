const STORAGE_KEY = "rivers";

const DEFAULT_RIVERS = [
  {
    id: 1,
    slug: "mithi",
    location: "Mithi River",
    wqi: 48,
    status: "Moderate",
    ph: 7.1,
    oxygen: 4.5,
    temperature: 27,
    turbidity: 62,
    trend: "down",
    info: {
      overview:
        "An urban stream flowing through Mumbai's mangroves and neighborhoods; sunrise walks near Mahim reveal herons, kingfishers, and a surprising calm between tides.",
      biodiversity:
        "Egrets, cormorants, mudskippers, fiddler crabs, and resilient mangrove species in tidal stretches.",
      best_time_to_visit:
        "Early mornings in winter (Nov–Feb) for birds and softer light.",
      cultural_note:
        "Community cleanups and post-festival immersion drives have sparked a growing stewardship movement.",
      highlights: [
        "Birdwatching by Mahim Nature Park boardwalk",
        "Sunset views near Bandra Fort",
        "Mangrove-edge cycling paths at low tide",
      ],
      nearby_attractions: [
        "Bandra Fort",
        "Mahim Nature Park",
        "BKC promenades",
      ],
      local_tips: [
        "Carry binoculars and avoid high tide if you want exposed mudflats.",
        "Weekday dawns are quieter for spotting wildlife.",
      ],
    },
  },
  {
    id: 2,
    slug: "godavari",
    location: "Godavari",
    wqi: 72,
    status: "Good",
    ph: 7.4,
    oxygen: 7.9,
    temperature: 25,
    turbidity: 30,
    trend: "up",
    info: {
      overview:
        "India's 'Dakshin Ganga' nurtures vineyards, temples, and fertile plains; river ghats glow with evening lamps and music.",
      biodiversity:
        "River terns, bar-headed geese in winters, and rich riparian flora around upper reaches.",
      best_time_to_visit:
        "Post-monsoon to winter (Oct–Feb) for clearer skies and festivals.",
      cultural_note:
        "Kumbh Mela in Nashik and historic ghats make it a vibrant spiritual corridor.",
      highlights: [
        "Sunset aarti on Nashik ghats",
        "Vineyard tours near the upper basin",
        "River-island picnics around Rajahmundry",
      ],
      nearby_attractions: ["Trimbakeshwar", "Nashik Ghats", "Godavari Bridge"],
      local_tips: [
        "Rent a bicycle to explore riverside lanes in the early morning.",
        "Try seasonal local produce from riverside markets.",
      ],
    },
  },
  {
    id: 3,
    slug: "krishna",
    location: "Krishna",
    wqi: 66,
    status: "Moderate",
    ph: 7.0,
    oxygen: 6.2,
    temperature: 24,
    turbidity: 40,
    trend: "up",
    info: {
      overview:
        "A southern lifeline carving fertile deltas and powering hydel projects; riverside towns hum with craft and cuisine.",
      biodiversity:
        "Wetland birds, freshwater turtles, and seasonal butterflies in riparian groves.",
      best_time_to_visit: "Dec–Feb for mellow weather and clear views.",
      cultural_note:
        "Pilgrim routes and ancient temples dot its banks from source to delta.",
      highlights: [
        "River cruises near Vijayawada",
        "Sugarcane-jaggery tastings in agrarian belts",
        "Sunrise photography from low bridges",
      ],
      nearby_attractions: [
        "Prakasam Barrage",
        "Bhavani Island",
        "Sangli riverfront",
      ],
      local_tips: [
        "Carry a hat; mid-day sun can be intense even in winter.",
        "Ask locals for seasonal ferry timings across channels.",
      ],
    },
  },
  {
    id: 4,
    slug: "tapi",
    location: "Tapi",
    wqi: 58,
    status: "Moderate",
    ph: 7.3,
    oxygen: 5.6,
    temperature: 26,
    turbidity: 50,
    trend: "down",
    info: {
      overview:
        "A west-flowing river with striking sunsets over wide channels; monsoon swells transform the landscape.",
      biodiversity:
        "Kingfishers, herons, and seasonal riverine grasses supporting insect life.",
      best_time_to_visit: "Oct–Jan for cooler evenings and gentle breezes.",
      cultural_note:
        "Textile towns along the banks give it a unique rhythm of trade and tradition.",
      highlights: [
        "Golden-hour walks on Surat riverfront",
        "Street-food trails near the ghats",
        "Angling spots along quieter bends",
      ],
      nearby_attractions: [
        "Surat Riverfront",
        "Gopi Talav",
        "Dumas beach road",
      ],
      local_tips: [
        "Keep a light jacket; river breeze can be nippy after sunset.",
        "Weekends host local fairs—ask around for timings.",
      ],
    },
  },
];

function save(rivers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rivers));
  try {
    // Notify all tabs within this app
    window.dispatchEvent(new Event("rivers:updated"));
  } catch (e) {}
}

export function getRivers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      save(DEFAULT_RIVERS);
      return DEFAULT_RIVERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_RIVERS;
    return parsed;
  } catch (e) {
    return DEFAULT_RIVERS;
  }
}

export function addRiver(river) {
  const rivers = getRivers();
  const nextId = rivers.length
    ? Math.max(...rivers.map((r) => r.id || 0)) + 1
    : 1;
  const withId = { ...river, id: nextId };
  const updated = [...rivers, withId];
  save(updated);
  return withId;
}

export function deleteRiver(slug) {
  const rivers = getRivers();
  const updated = rivers.filter((r) => r.slug !== slug);
  save(updated);
  return updated;
}

export function upsertRiver(river, identifier) {
  const rivers = getRivers();
  const key = identifier || river.slug;
  const idx = rivers.findIndex((r) => r.slug === key);
  if (idx >= 0) {
    const preservedId = rivers[idx]?.id;
    rivers[idx] = { ...rivers[idx], ...river, id: preservedId };
    // If slug changed, ensure no duplicate entries with same slug remain
    const newSlug = rivers[idx].slug;
    for (let i = rivers.length - 1; i >= 0; i--) {
      if (i !== idx && rivers[i].slug === newSlug) rivers.splice(i, 1);
    }
    save(rivers);
    return rivers[idx];
  }
  return addRiver(river);
}

export function generateSlug(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function getDefaultRivers() {
  return DEFAULT_RIVERS;
}
