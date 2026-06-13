db = db.getSiblingDB("spotify");
// Завдання 1. Топ-10 виконавців за середньою популярністю
print("Top 10 artists by average track popularity:")
db.tracks.aggregate([
    { $unwind: "$artists" },
    {
        $group: {
            _id: "$artists",
            avg_popularity: { $avg: "$popularity" },
            tracks_count: { $sum: 1 }
        }
    },
    { $match: { tracks_count: { $gte: 5 } } },
    { $sort: { avg_popularity: -1 } },
    { $limit: 10 },
    {
        $project: {
            _id: 0,
            artist: "$_id",
            avg_popularity: 1,
        }
    }
]).forEach(track => printjson(track));
print("\n\n");
// Завдання 2. Розподіл треків за настроєм
print("Track count by mood:")
db.tracks.aggregate([
    {
        $project: {
            mood: {
                $switch: {
                    branches: [
                        {
                            case: {
                                $and: [
                                    { $gte: ["$audio_features.valence", 0.5] },
                                    { $gte: ["$audio_features.energy", 0.5] }
                                ]
                            },
                            then: "happy"
                        },
                        {
                            case: {
                                $and: [
                                    { $lt: ["$audio_features.valence", 0.5] },
                                    { $gte: ["$audio_features.energy", 0.5] }
                                ]
                            },
                            then: "angry"
                        },
                        {
                            case: {
                                $and: [
                                    { $gte: ["$audio_features.valence", 0.5] },
                                    { $lt: ["$audio_features.energy", 0.5] }
                                ]
                            },
                            then: "calm"
                        },
                        {
                            case: {
                                $and: [
                                    { $lt: ["$audio_features.valence", 0.5] },
                                    { $lt: ["$audio_features.energy", 0.5] }
                                ]
                            },
                            then: "sad"
                        }
                    ],
                    default: "unknown"
                }
            }
        }
    },

    {
        $group: {
            _id: "$mood",
            count: { $sum: 1 }
        }
    },

    {
        $project: {
            _id: 0,
            mood: "$_id",
            track_count: "$count"
        }
    },
    {
        $sort: { track_count: -1 }
    }
]).forEach(doc => printjson(doc));
print("\n\n");

// Завдання 3. Найбільш «танцювальний» жанр
print("Most danceable genre:")
db.tracks.aggregate([
    {
        $group: {
            _id: "$track_genre",
            avg_danceability: { $avg: "$audio_features.danceability" },
            avg_energy: { $avg: "$audio_features.energy" },
            avg_valence: { $avg: "$audio_features.valence" },
            tracks_count: { $sum: 1 }
        }
    },
    {
        $match: {
            tracks_count: { $gte: 100 }
        }
    },
    { $sort: { avg_danceability: -1 } },
    { $limit: 1 },
]).forEach(doc => printjson(doc));