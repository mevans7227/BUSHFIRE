from flask import Flask, request, jsonify, render_template
import math

app = Flask(__name__)

BAL_TABLE_FFDI100 = {
    "Forest": [
        (0, 0),
        (18, 18),
        (24, 24),
        (33, 33),
        (45, 45),
        (100, 100)
    ],
    "Grassland": [
        (0, 0),
        (8, 8),
        (10, 10),
        (15, 15),
        (22, 22),
        (50, 50)
    ]
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compute_bal', methods=['POST'])
def compute_bal():
    data = request.json
    vegetation = data.get('vegetation')
    dist = data.get('distance')
    if vegetation not in BAL_TABLE_FFDI100:
        return jsonify({"error": "Unknown vegetation type"}), 400
    thresholds = BAL_TABLE_FFDI100[vegetation]
    result = None
    BAL_LEVELS = ["BAL‑FZ", "BAL‑40", "BAL‑29", "BAL‑19", "BAL‑12.5", "BAL‑LOW"]
    for i in range(len(thresholds)-1):
        lower = thresholds[i][1]
        upper = thresholds[i+1][1]
        if dist < upper:
            result = {
                "bal": BAL_LEVELS[i],
                "next_threshold": upper
            }
            break
    if result is None:
        result = {
            "bal": "BAL‑LOW",
            "next_threshold": None
        }
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
