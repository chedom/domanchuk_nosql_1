print("Transforming data...");
db = db.getSiblingDB("spotify");

db.tracks.drop(); // $out

db.tracks_raw.aggregate([
  {
    $project: {
      _id: 0,

      track_id: 1,
      track_name: 1,
      album_name: 1,
      explicit: 1,
      popularity: 1,
      duration_ms: 1,
      track_genre: 1,

      artists: {
        $map: {
          input: { $split: ["$artists", ";"] },
          as: "artist",
          in: { $trim: { input: "$$artist" } }
        }
      },

      audio_features: {
        danceability: "$danceability",
        energy: "$energy",
        loudness: "$loudness",
        mode: "$mode",
        speechiness: "$speechiness",
        acousticness: "$acousticness",
        instrumentalness: "$instrumentalness",
        liveness: "$liveness",
        valence: "$valence",
        tempo: "$tempo",
        key: "$key",
        time_signature: "$time_signature"
      },

      popularity_tier: {
        $switch: {
          branches: [
            {
              case: { $gte: ["$popularity", 70] },
              then: "high"
            },
            {
              case: { $gte: ["$popularity", 40] },
              then: "medium"
            }
          ],
          default: "Low"
        }
      }
    }
  },
  {
     $out: "tracks"
  }
]);

print(`Documents: ${db.tracks.countDocuments()}`)

db.tracks.find().limit(3).forEach(doc => printjson(doc))