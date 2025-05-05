
const http = require("http");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const PORT = 7146;

const uri = "mongodb+srv://rishitharani:finalproject@cluster-rishitha.l40h17u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Rishitha";
const client = new MongoClient(uri);

const server = http.createServer(async (req, res) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
        "Content-Type": "application/json"
    };

    console.log("Request URL:", req.url);

    let filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url);
    let extname = path.extname(filePath);
    let contentType = "text/html";

    switch (extname) {
        case ".css":
            contentType = "text/css";
            break;
        case ".js":
            contentType = "text/javascript";
            break;
        case ".png":
            contentType = "image/png";
            break;
        case ".json":
            contentType = "application/json";
            break;
    }

    if (req.url === "/api") {
        try {
            await client.connect();
            console.log("MongoDB connection established");
            const cursor = client.db("jobfinder_db").collection("jobs").find({});
            const results = await cursor.toArray();
            console.log(results);

            res.writeHead(200, headers);
            res.end(JSON.stringify(results, null, 2));
        } catch (e) {
            console.error("Error fetching from MongoDB:", e);
            res.writeHead(500, headers);
            res.end(JSON.stringify({ error: "Internal Server Error" }));
        } finally {
            await client.close();
            console.log("MongoDB connection closed");
        }
    } else {
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end("<h1>404 Not Found</h1>");
                return;
            }

            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
        });
    }
}).listen(PORT, () => {console.log(`JobFinder Server is running on port ${PORT}`);});
