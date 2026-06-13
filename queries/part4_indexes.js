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

// Завдання 2. Індекс для інших полів
print("Creating index for explicit, instrumentalness and speechiness...");
db.tracks.createIndex({
    "explicit": 1,
    "audio_features.instrumentalness": 1,
    "audio_features.speechiness": 1
});

res = db.tracks.find({
    explicit: false,
    "audio_features.instrumentalness": { $gte: 0.5 },
    "audio_features.speechiness": { $gte: 0.4 }
}).explain("executionStats");

printjson(res.executionStats);
// IXSCAN explicit_1_audio_features.instrumentalness_1_audio_features.speechiness_1
// {
//   executionSuccess: true,
//   nReturned: 56,
//   executionTimeMillis: 1,
//   totalKeysExamined: 557,
//   totalDocsExamined: 56,
//   executionStages: {
//     isCached: false,
//     stage: 'FETCH',
//     nReturned: 56,
//     executionTimeMillisEstimate: 0,
//     works: 557,
//     advanced: 56,
//     needTime: 500,
//     needYield: 0,
//     saveState: 0,
//     restoreState: 0,
//     isEOF: 1,
//     docsExamined: 56,
//     alreadyHasObj: 0,
//     inputStage: {
//       stage: 'IXSCAN',
//       nReturned: 56,
//       executionTimeMillisEstimate: 0,
//       works: 557,
//       advanced: 56,
//       needTime: 500,
//       needYield: 0,
//       saveState: 0,
//       restoreState: 0,
//       isEOF: 1,
//       keyPattern: {
//         explicit: 1,
//         'audio_features.instrumentalness': 1,
//         'audio_features.speechiness': 1
//       },
//       indexName: 'explicit_1_audio_features.instrumentalness_1_audio_features.speechiness_1',
//       isMultiKey: false,
//       multiKeyPaths: {
//         explicit: [],
//         'audio_features.instrumentalness': [],
//         'audio_features.speechiness': []
//       },
//       isUnique: false,
//       isSparse: false,
//       isPartial: false,
//       indexVersion: 2,
//       direction: 'forward',
//       indexBounds: {
//         explicit: [
//           '[false, false]'
//         ],
//         'audio_features.instrumentalness': [
//           '[0.5, inf.0]'
//         ],
//         'audio_features.speechiness': [
//           '[0.4, inf.0]'
//         ]
//       },
//       keysExamined: 557,
//       seeks: 501,
//       dupsTested: 0,
//       dupsDropped: 0
//     }
//   }
// }

print("\n\n");
// Завдання 3. Покривний запит
print("Check covering index...");
db.tracks.find({
  track_genre: "pop",
  popularity: { $gte: 70 }
}).explain("executionStats");

print(res.executionStats);
