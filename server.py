import http.server
import socketserver
import json
import sqlite3
from datetime import datetime
import os
from typing import Dict, List, Optional, Union, Any
from dataclasses import dataclass
from http import HTTPStatus

# カスタム例外クラス
class DatabaseError(Exception):
    """データベース操作に関するエラー"""
    pass

class ValidationError(Exception):
    """入力値検証に関するエラー"""
    pass

@dataclass
class FailureRecord:
    """失敗記録のデータクラス"""
    id: Optional[int] = None
    content: str = ""
    category: str = ""
    points: int = 10
    created_at: str = ""
    reflection: Optional[str] = None
    internal_factors: Optional[str] = None
    external_factors: Optional[str] = None
    internal_factors_detail: Optional[str] = None
    external_factors_detail: Optional[str] = None
    similar_cases: Optional[str] = None
    next_challenge: Optional[str] = None
    challenge_type: Optional[str] = None
    challenge_deadline: Optional[str] = None
    related_to: Optional[int] = None
    relation_type: Optional[str] = None
    related_content: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """データクラスを辞書に変換"""
        return {k: v for k, v in self.__dict__.items() if v is not None}

# 定数定義
VALID_CATEGORIES = {'能力不足', '努力不足', '環境', '運'}
DB_NAME = os.environ.get('DB_NAME', 'failures.db')
INITIAL_POINTS = 10
REFLECTION_BONUS = 20

def init_db() -> None:
    """
    データベースの初期化とテーブルの作成
    
    テーブル構造:
    - failures: 失敗の記録を保存するメインテーブル
      - id: 主キー
      - content: 失敗の内容
      - category: カテゴリ（能力不足、努力不足、環境、運）
      - points: 獲得ポイント
      - その他の関連フィールド
    """
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        
        # 外部キー制約を有効化
        c.execute('PRAGMA foreign_keys = ON')
        
        c.execute('''
            CREATE TABLE IF NOT EXISTS failures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                category TEXT NOT NULL CHECK(category IN ('能力不足', '努力不足', '環境', '運')),
                points INTEGER DEFAULT 10,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reflection TEXT,
                internal_factors TEXT,
                external_factors TEXT,
                internal_factors_detail TEXT,
                external_factors_detail TEXT,
                similar_cases TEXT,
                next_challenge TEXT,
                challenge_type TEXT,
                challenge_deadline TIMESTAMP,
                related_to INTEGER,
                relation_type TEXT,
                related_content TEXT,
                FOREIGN KEY(related_to) REFERENCES failures(id) ON DELETE CASCADE
            )
        ''')
        conn.commit()
    except sqlite3.Error as e:
        raise DatabaseError(f"データベースの初期化に失敗しました: {e}")
    finally:
        conn.close()

class FailureHandler(http.server.SimpleHTTPRequestHandler):
    """
    失敗の記録を管理するHTTPハンドラー
    
    エンドポイント:
    - GET /api/failures: 失敗の一覧を取得
    - POST /api/failures: 新規記録を作成
    - POST /api/failures/{id}/reflection: 振り返りを追加
    - DELETE /api/failures/{id}: 記録を削除
    """
    
    def validate_failure_data(self, data: Dict[str, Any]) -> None:
        """
        失敗データのバリデーション
        
        Args:
            data: バリデーション対象のデータ
            
        Raises:
            ValidationError: バリデーションエラー時
        """
        if not data.get('content'):
            raise ValidationError("内容は必須です")
        if not data.get('category'):
            raise ValidationError("カテゴリは必須です")
        if data['category'] not in VALID_CATEGORIES:
            raise ValidationError(f"無効なカテゴリです: {data['category']}")

    def handle_database_error(self, e: sqlite3.Error) -> None:
        """データベースエラーのハンドリング"""
        self.send_error_response(
            HTTPStatus.INTERNAL_SERVER_ERROR,
            f"データベースエラー: {str(e)}"
        )

    def send_error_response(self, status: int, message: str) -> None:
        """エラーレスポンスの送信"""
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'error': message,
            'status': status
        }).encode())

    def send_json_response(self, data: Union[Dict, List], status: int = 200) -> None:
        """JSONレスポンスの送信"""
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_GET(self) -> None:
        """GETリクエストの処理"""
        if self.path == '/':
            self.path = '/index.html'
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        
        if self.path == '/api/failures':
            try:
                conn = sqlite3.connect(DB_NAME)
                c = conn.cursor()
                c.execute('''
                    SELECT f.*, r.content as related_content, r.category as related_category 
                    FROM failures f 
                    LEFT JOIN failures r ON f.related_to = r.id 
                    ORDER BY f.created_at DESC
                ''')
                
                failures = [FailureRecord(*row).to_dict() for row in c.fetchall()]
                self.send_json_response(failures)
                
            except sqlite3.Error as e:
                self.handle_database_error(e)
            finally:
                conn.close()
            return
        
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self) -> None:
        """POSTリクエストの処理"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        try:
            if self.path == '/api/failures':
                self.handle_create_failure(data)
            elif '/reflection' in self.path:
                self.handle_add_reflection(data)
            else:
                self.send_error_response(HTTPStatus.NOT_FOUND, "エンドポイントが見つかりません")
                
        except ValidationError as e:
            self.send_error_response(HTTPStatus.BAD_REQUEST, str(e))
        except sqlite3.Error as e:
            self.handle_database_error(e)
        except Exception as e:
            self.send_error_response(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                f"予期せぬエラーが発生しました: {str(e)}"
            )

    def handle_create_failure(self, data: Dict[str, Any]) -> None:
        """新規失敗記録の作成"""
        self.validate_failure_data(data)
        conn = sqlite3.connect(DB_NAME)
        try:
            c = conn.cursor()
            if 'related_to' in data and 'relation_type' in data:
                c.execute('''
                    INSERT INTO failures (
                        content, category, points, related_to, relation_type,
                        internal_factors, external_factors, internal_factors_detail,
                        external_factors_detail, similar_cases, next_challenge,
                        challenge_type, challenge_deadline
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    data['content'], data['category'], INITIAL_POINTS,
                    data['related_to'], data['relation_type'],
                    data.get('internal_factors'), data.get('external_factors'),
                    data.get('internal_factors_detail'), data.get('external_factors_detail'),
                    data.get('similar_cases'), data.get('next_challenge'),
                    data.get('challenge_type'), data.get('challenge_deadline')
                ))
            else:
                c.execute('''
                    INSERT INTO failures (
                        content, category, points,
                        internal_factors, external_factors, internal_factors_detail,
                        external_factors_detail, similar_cases, next_challenge,
                        challenge_type, challenge_deadline
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    data['content'], data['category'], INITIAL_POINTS,
                    data.get('internal_factors'), data.get('external_factors'),
                    data.get('internal_factors_detail'), data.get('external_factors_detail'),
                    data.get('similar_cases'), data.get('next_challenge'),
                    data.get('challenge_type'), data.get('challenge_deadline')
                ))
            
            failure_id = c.lastrowid
            conn.commit()
            
            c.execute('''
                SELECT f.*, r.content as related_content, r.category as related_category 
                FROM failures f 
                LEFT JOIN failures r ON f.related_to = r.id 
                WHERE f.id = ?
            ''', (failure_id,))
            
            failure = FailureRecord(*c.fetchone()).to_dict()
            self.send_json_response(failure, HTTPStatus.CREATED)
            
        finally:
            conn.close()

    def handle_add_reflection(self, data: Dict[str, Any]) -> None:
        """振り返りの追加"""
        failure_id = int(self.path.split('/')[3])
        if not data.get('reflection'):
            raise ValidationError("振り返りの内容は必須です")
        
        conn = sqlite3.connect(DB_NAME)
        try:
            c = conn.cursor()
            c.execute(
                'UPDATE failures SET reflection = ?, points = points + ? WHERE id = ?',
                (data['reflection'], REFLECTION_BONUS, failure_id)
            )
            conn.commit()
            
            c.execute('SELECT * FROM failures WHERE id = ?', (failure_id,))
            failure = FailureRecord(*c.fetchone()).to_dict()
            self.send_json_response(failure)
            
        finally:
            conn.close()

    def do_DELETE(self) -> None:
        """DELETEリクエストの処理"""
        if not self.path.startswith('/api/failures/'):
            self.send_error_response(HTTPStatus.NOT_FOUND, "エンドポイントが見つかりません")
            return
        
        try:
            failure_id = int(self.path.split('/')[3])
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            
            c.execute('DELETE FROM failures WHERE id = ?', (failure_id,))
            conn.commit()
            
            self.send_json_response({'success': True})
            
        except ValueError:
            self.send_error_response(HTTPStatus.BAD_REQUEST, "無効なIDです")
        except sqlite3.Error as e:
            self.handle_database_error(e)
        finally:
            conn.close()

    def end_headers(self) -> None:
        """CORSヘッダーの設定"""
        origin = self.headers.get('Origin', '*')
        self.send_header('Access-Control-Allow-Origin', origin)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self) -> None:
        """OPTIONSリクエストの処理（CORS対応）"""
        self.send_response(HTTPStatus.OK)
        self.end_headers()

if __name__ == '__main__':
    # データベースの初期化
    init_db()
    
    # 環境変数から設定を取得
    PORT = int(os.environ.get('PORT', 8080))
    HOST = os.environ.get('HOST', '0.0.0.0')
    
    # サーバーの起動
    Handler = FailureHandler
    
    with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
        httpd.allow_reuse_address = True
        print(f"サーバーが http://{HOST}:{PORT} で起動しました")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nサーバーをシャットダウンしています...")
            httpd.shutdown()
            httpd.server_close()
            print("サーバーを停止しました") 