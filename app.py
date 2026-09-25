from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from pathlib import Path
import os
import requests

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")

app = Flask(__name__)

API_KEY = os.getenv("YOUTUBE_API_KEY")

YOUTUBE_SEARCH_API = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_API = "https://www.googleapis.com/youtube/v3/videos"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/search")
def search():

    query = request.args.get("q", "").strip()

    if not query:
        return jsonify({
            "success": False,
            "message": "Masukkan kata pencarian."
        }), 400

    if not API_KEY:
        return jsonify({
            "success": False,
            "message": "API key belum terpasang di server."
        }), 500

    search_params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 100,
        "key": API_KEY
    }

    try:

        response = requests.get(
            YOUTUBE_SEARCH_API,
            params=search_params,
            timeout=15
        )

        data = response.json()

        if response.status_code != 200:

            error = data.get("error", {})

            return jsonify({
                "success": False,
                "message": error.get(
                    "message",
                    "YouTube API mengalami error."
                )
            }), response.status_code

        search_items = data.get("items", [])

        video_ids = []

        for item in search_items:

            video_id = item.get(
                "id", {}
            ).get("videoId")

            if video_id:
                video_ids.append(video_id)

        if not video_ids:
            return jsonify({
                "success": True,
                "videos": []
            })

        detail_params = {
            "part": "status,snippet",
            "id": ",".join(video_ids),
            "key": API_KEY
        }

        detail_response = requests.get(
            YOUTUBE_VIDEOS_API,
            params=detail_params,
            timeout=15
        )

        detail_data = detail_response.json()

        if detail_response.status_code != 200:
            return jsonify({
                "success": False,
                "message": "Gagal memeriksa video YouTube."
            }), detail_response.status_code

        detail_map = {
            item["id"]: item
            for item in detail_data.get("items", [])
        }

        results = []

        for item in search_items:

            video_id = item.get(
                "id", {}
            ).get("videoId")

            if not video_id:
                continue

            detail = detail_map.get(video_id)

            if not detail:
                continue

            video_status = detail.get("status", {})

            if video_status.get("uploadStatus") != "processed":
                continue

            if video_status.get("privacyStatus") != "public":
                continue

            snippet = detail.get("snippet", {})

            thumbnails = snippet.get("thumbnails", {})

            thumbnail = (
                thumbnails.get("high")
                or thumbnails.get("medium")
                or thumbnails.get("default")
                or {}
            ).get("url", "")

            results.append({
                "id": video_id,
                "title": snippet.get("title", ""),
                "channel": snippet.get("channelTitle", ""),
                "thumbnail": thumbnail,
                "published": snippet.get("publishedAt", "")
            })

        return jsonify({
            "success": True,
            "videos": results
        })

    except requests.RequestException:

        return jsonify({
            "success": False,
            "message": "Tidak dapat terhubung ke YouTube."
        }), 502

    except Exception as error:

        print("ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Terjadi kesalahan pada server."
        }), 500


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )