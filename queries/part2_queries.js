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

print("\n\n");

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
print("\n\n");
// Завдання 3. Нетипові треки
print("Tracks with unusual audio features:")
db.tracks.aggregate([
    {
        $group: {
            _id: "$track_genre",
            avg_tempo: { $avg: "$audio_features.tempo" },
            stddev_tempo: { $stdDevPop: "$audio_features.tempo" },
            genre_tracks: {
               $push: {
                    _id: "$_id",
                    track_name: "$track_name",
                    popularity: "$popularity",
                    artists: "$artists",
                    audio_features: { tempo: "$audio_features.tempo"}
                }
            }
        },
    },
    {
        $project: {
            avg_tempo: 1,
            genre: "$_id",
            _id: 0,
            outlier_threshold: { $add: ["$avg_tempo", { $multiply: [2, "$stddev_tempo"] }] },
            genre_tracks: "$genre_tracks"
        },
    },
    {
        $project: {
            genre: 1,
            avg_tempo: 1,
            outlier_threshold: 1,
            outlier_tracks: {
                $filter: {
                    input: "$genre_tracks",
                    as: "track",
                    cond: { $gt: ["$$track.audio_features.tempo", "$outlier_threshold"] }
                }
            }
        },
    },
    {
        $match: {
            "outlier_tracks.0": { $exists: true }
        }
    }
]).forEach(doc => printjson(doc));
print("\n\n");
// Завдання 4: Треки для фонової роботи
print("Tracks suitable for background work:")
db.tracks.find({
  "audio_features.loudness": { $lt: -10 },
  "audio_features.speechiness": { $lt: 0.1 },
  "audio_features.instrumentalness": { $gt: 0.5 },
  explicit: false
}).forEach(doc => printjson(doc));
