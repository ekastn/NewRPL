# Use the official Go image as a parent image
FROM golang:1.24.2-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the go.mod and go.sum files to the container
COPY go.mod go.sum ./

# Download all dependencies. They will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source code from the current directory to the container
COPY . .

# Build the Go app
RUN go build -o main .

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the executable
CMD ["./main"]
