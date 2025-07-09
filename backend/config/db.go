package config

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var DB *mongo.Database
var UserCollectionRef *mongo.Collection

func ConnectDB() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ Couldn't load .env file, using environment variables")
	}

	mongoString := os.Getenv("MONGOSTRING")
	dbName := os.Getenv("DB_NAME")
	userCollection := os.Getenv("USER_COLLECTION")
	log.Println("📚 Loading database configuration from environment variables", mongoString, dbName, userCollection)

	if mongoString == "" {
		mongoString = "mongodb://localhost:27017"
		log.Println("⚠️ MONGOSTRING not set, using default:", mongoString)
	}

	if dbName == "" {
		dbName = "dbRPL"
		log.Println("⚠️ DB_NAME not set, using default:", dbName)
	}

	if userCollection == "" {
		userCollection = "users"
		log.Println("⚠️ USER_COLLECTION not set, using default:", userCollection)
	}

	// Set a shorter timeout for quicker feedback during development
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoString)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("❌ Failed to create MongoDB client:", err)
	}

	// Ping the database to verify connection
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatal("❌ Failed to connect to MongoDB. Is MongoDB running? Error:", err)
	}

	DB = client.Database(dbName)
	UserCollectionRef = DB.Collection(userCollection)

	log.Println("✅ MongoDB connected to database:", dbName)
}
