package models

import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type Emotion struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
    UserName  string             `bson:"user_name" json:"user_name"`
    Mood      string             `bson:"mood" json:"mood"`
    Note      string             `bson:"note,omitempty" json:"note"`
    CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

type EmotionStats struct {
    Mood  string `bson:"_id" json:"mood"`
    Count int    `bson:"count" json:"count"`
}