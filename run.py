from flask import Flask, render_template, request, jsonify
from config import Config
from app.models import db, Failure

app = Flask(__name__, 
    template_folder='app/templates',
    static_folder='app/static'
)
app.config.from_object(Config)
db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/failures', methods=['GET'])
def get_failures():
    failures = Failure.query.order_by(Failure.created_at.desc()).all()
    return jsonify([failure.to_dict() for failure in failures])

@app.route('/api/failures', methods=['POST'])
def create_failure():
    data = request.json
    failure = Failure(
        content=data['content'],
        category=data['category'],
        points=10  # 初期ポイント
    )
    db.session.add(failure)
    db.session.commit()
    return jsonify(failure.to_dict()), 201

@app.route('/api/failures/<int:id>/reflection', methods=['POST'])
def add_reflection(id):
    failure = Failure.query.get_or_404(id)
    data = request.json
    failure.reflection = data['reflection']
    failure.points += 20  # 振り返り追加ボーナス
    db.session.commit()
    return jsonify(failure.to_dict())

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=8080) 