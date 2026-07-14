import jsonhttps://github.com/sudesh3107/VibeMatcher/blob/main/server.py
import os
import sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, "data")
DB_PATH = os.path.join(DATA_DIR, "movies.db")
SEED_PATH = os.path.join(DATA_DIR, "movies.json")


def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            genres TEXT NOT NULL,
            rating REAL NOT NULL,
            userRating REAL NOT NULL,
            releaseYear INTEGER NOT NULL,
            status TEXT NOT NULL,
            collection TEXT NOT NULL,
            platform TEXT NOT NULL,
            price TEXT NOT NULL,
            actors TEXT NOT NULL,
            tags TEXT NOT NULL,
            explanation TEXT NOT NULL
        )
        """
    )
    conn.commit()

    count = conn.execute("SELECT COUNT(*) FROM movies").fetchone()[0]
    if count == 0 and os.path.exists(SEED_PATH):
        with open(SEED_PATH, "r", encoding="utf-8") as handle:
            seed_items = json.load(handle)
        for item in seed_items:
            conn.execute(
                """
                INSERT INTO movies (
                    id, title, type, genres, rating, userRating, releaseYear, status,
                    collection, platform, price, actors, tags, explanation
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item["id"],
                    item["title"],
                    item["type"],
                    json.dumps(item["genres"]),
                    item["rating"],
                    item["userRating"],
                    item["releaseYear"],
                    item["status"],
                    item["collection"],
                    item["platform"],
                    item["price"],
                    json.dumps(item["actors"]),
                    json.dumps(item.get("tags", [])),
                    item["explanation"],
                ),
            )
        conn.commit()

    conn.close()


def fetch_movies():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM movies ORDER BY releaseYear DESC").fetchall()
    conn.close()

    movies = []
    for row in rows:
        movies.append(
            {
                "id": row["id"],
                "title": row["title"],
                "type": row["type"],
                "genres": json.loads(row["genres"]),
                "rating": row["rating"],
                "userRating": row["userRating"],
                "releaseYear": row["releaseYear"],
                "status": row["status"],
                "collection": row["collection"],
                "platform": row["platform"],
                "price": row["price"],
                "actors": json.loads(row["actors"]),
                "tags": json.loads(row["tags"]),
                "explanation": row["explanation"],
            }
        )
    return movies


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/movies":
            payload = json.dumps(fetch_movies()).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        if parsed.path in ["/", "/index.html", "/app.js", "/favicon.ico"]:
            file_path = "/index.html" if parsed.path in ["/", "/index.html"] else parsed.path.lstrip("/")
            target = os.path.join(ROOT, file_path)
            if os.path.exists(target) and os.path.isfile(target):
                with open(target, "rb") as handle:
                    content = handle.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html" if target.endswith(".html") else "application/javascript")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return

        if parsed.path.startswith("/data/"):
            target = os.path.join(ROOT, parsed.path.lstrip("/"))
            if os.path.exists(target) and os.path.isfile(target):
                with open(target, "rb") as handle:
                    content = handle.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json" if target.endswith(".json") else "application/octet-stream")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return

        self.send_error(404)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    init_db()
    server = ThreadingHTTPServer(("0.0.0.0", 8000), Handler)
    print("Serving VibeMatcher on http://127.0.0.1:8000")
    server.serve_forever()
