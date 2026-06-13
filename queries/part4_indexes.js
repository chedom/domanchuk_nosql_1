db = db.getSiblingDB("spotify");
print("Query without indexes:");
res = db.tracks.find({
  track_genre: "pop",
  "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain('executionStats');
printjson(res.executionStats);



print("\n\n");

db.tracks.createIndex({
    "track_genre": 1,
    "popularity": -1,
    "audio_features.danceability": 1
});

print("\n\n");

print("Query with indexes:");
res = db.tracks.find({
  track_genre: "pop",
  "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain('executionStats');
printjson(res.executionStats);
print("\n\n");
