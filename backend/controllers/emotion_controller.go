package controllers

import (
    "context"
    "time"
    
    "github.com/gofiber/fiber/v2"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo/options"
    
    "backend/config"
    "backend/models"
)

// SaveEmotion menyimpan data emosi pengguna
func SaveEmotion(c *fiber.Ctx) error {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    var emotion models.Emotion
    if err := c.BodyParser(&emotion); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Format request tidak valid"})
    }

    // Set waktu pembuatan
    emotion.CreatedAt = time.Now()
    
    // Generate ID baru jika tidak disediakan
    if emotion.ID.IsZero() {
        emotion.ID = primitive.NewObjectID()
    }

    // Masukkan ke database
    result, err := config.DB.Collection("emotions").InsertOne(ctx, emotion)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Gagal menyimpan data emosi"})
    }

    return c.Status(201).JSON(fiber.Map{
        "message": "Emosi berhasil dicatat",
        "id": result.InsertedID,
    })
}

// GetEmotionStats mengambil statistik emosi untuk visualisasi
func GetEmotionStats(c *fiber.Ctx) error {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    // Tentukan pipeline agregasi
    pipeline := []bson.M{
        {
            "$group": bson.M{
                "_id": "$mood",
                "count": bson.M{"$sum": 1},
            },
        },
    }

    // Filter opsional berdasarkan periode waktu
    if period := c.Query("period"); period != "" {
        var timeFilter time.Time
        
        switch period {
        case "day":
            timeFilter = time.Now().AddDate(0, 0, -1)
        case "week":
            timeFilter = time.Now().AddDate(0, 0, -7)
        case "month":
            timeFilter = time.Now().AddDate(0, -1, 0)
        default:
            timeFilter = time.Now().AddDate(0, 0, -7) // Default ke minggu
        }
        
        pipeline = append([]bson.M{{
            "$match": bson.M{
                "created_at": bson.M{"$gte": timeFilter},
            },
        }}, pipeline...)
    }

    cursor, err := config.DB.Collection("emotions").Aggregate(ctx, pipeline)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Gagal mengambil statistik emosi"})
    }
    defer cursor.Close(ctx)

    var results []models.EmotionStats
    if err = cursor.All(ctx, &results); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Gagal memproses data emosi"})
    }

    return c.Status(200).JSON(results)
}

// GetUserEmotions mengambil emosi untuk pengguna tertentu
func GetUserEmotions(c *fiber.Ctx) error {
    userID := c.Params("id")
    if userID == "" {
        return c.Status(400).JSON(fiber.Map{"error": "ID pengguna diperlukan"})
    }

    objectID, err := primitive.ObjectIDFromHex(userID)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Format ID pengguna tidak valid"})
    }

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    var emotions []models.Emotion

    opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(50)
    cursor, err := config.DB.Collection("emotions").Find(ctx, bson.M{"user_id": objectID}, opts)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Gagal mengambil data emosi"})
    }
    defer cursor.Close(ctx)

    if err = cursor.All(ctx, &emotions); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Gagal memproses data emosi"})
    }

    return c.Status(200).JSON(emotions)
}