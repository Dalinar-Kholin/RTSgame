FROM golang:1.23
LABEL authors="dalinarkholin"
WORKDIR /application

COPY go.mod .
RUN go mod download

COPY . .

EXPOSE 80

RUN go build -o ./server .
CMD ["./server"]
