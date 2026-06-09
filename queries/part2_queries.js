db = db.getSiblingDB("spotify");
//  Завдання 1. Треки для вечірки
var filter =  {
    "audio_features.danceability": { $gt: 0.7 },
    "audio_features.energy": { $gt: 0.7 },
    "duration_ms": { $gt: 180000,$lt: 300000 },
  }
const count = db.tracks.countDocuments(filter);
print("Number of tracks suitable for a party:", count);

db.tracks.find(filter, {
    _id: 0,
    track_name: 1,
    artists: 1,
    "audio_features.danceability": 1,
    "audio_features.energy": 1,
    "duration_ms": 1
}).limit(3).forEach(track => {printjson(track)});

// Завдання 2. Виконавці, у яких усі треки популярні
print("Artists with all tracks having popularity >= 60 and at least 3 tracks:")
db.tracks.aggregate([
  { $unwind: "$artists" },
  {
    $group: {
      _id: "$artists",
      tracks_count: { $sum: 1 },
      min_popularity: { $min: "$popularity" },
      avg_popularity: { $avg: "$popularity" }
    }
  },
  {
    $match: {
      tracks_count: { $gte: 3 },
      min_popularity: { $gte: 60 }
    }
  },
  {
    $project: {
      tracks_count: 1,
      min_popularity: { $round: ["$min_popularity", 1] },
      avg_popularity: { $round: ["$avg_popularity", 1] }
    }
  },
  { $sort: { avg_popularity: -1 } },
  { $limit: 20 }
]).forEach(doc => printjson(doc));