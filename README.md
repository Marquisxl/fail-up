# FailUp - 失敗トラッキング

## 概要

FailUpは、日々の失敗を記録し、それを成長の機会に変えるためのWebアプリケーションです。失敗を単なるネガティブな経験として捉えるのではなく、学びと成長のためのデータとして活用することを目指しています。

### 主な機能

- 失敗の記録と分類
- 内的・外的要因の分析
- 振り返りと学びの記録
- 次のチャレンジの設定
- 成長度の可視化（ポイントシステム）
- 関連する失敗の紐付け

## 技術スタック

### バックエンド
- Python 3.12
- SQLite3（データベース）
- HTTP Server（標準ライブラリ）

### フロントエンド
- HTML5
- CSS3
- JavaScript（Vanilla）

## セットアップ

### 必要条件
- Python 3.12以上
- pip（Pythonパッケージマネージャー）

### インストール手順

1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/failup.git
cd failup
```

2. 仮想環境の作成と有効化
```bash
python -m venv venv
source venv/bin/activate  # Unix系の場合
venv\Scripts\activate     # Windowsの場合
```

3. 依存パッケージのインストール
```bash
pip install -r requirements.txt
```

4. 環境変数の設定
```bash
# Unix系の場合
export PORT=8080
export HOST=localhost
export DB_NAME=failures.db

# Windowsの場合
set PORT=8080
set HOST=localhost
set DB_NAME=failures.db
```

5. サーバーの起動
```bash
python server.py
```

アプリケーションは http://localhost:8080 でアクセスできます。

## 使い方

### 1. 失敗の記録

1. トップページの「新規記録」フォームに以下の情報を入力：
   - 失敗の内容
   - カテゴリ（能力不足、努力不足、環境、運）
   - 内的要因と外的要因
   - 次のチャレンジ

2. 「記録する」ボタンをクリックして保存

### 2. 振り返りの追加

1. 記録された失敗をクリック
2. 振り返りの内容を入力
3. 「振り返りを追加」ボタンをクリック
   - 振り返りを追加すると20ポイント獲得

### 3. 成長の確認

- トップページで総獲得ポイントを確認
- カテゴリごとの失敗と学びの分布を確認
- 時系列での成長推移を確認

## API仕様

詳細なAPI仕様は[api_docs.md](api_docs.md)を参照してください。

## 開発ガイドライン

### コーディング規約

- PEP 8に準拠したPythonコード
- コメントは日本語で記述
- 型ヒントを積極的に活用
- docstringによるドキュメント化

### テスト

テストの実行：
```bash
python -m pytest tests/
```

### デバッグモード

開発時はデバッグモードを有効にすることをお勧めします：
```bash
export DEBUG=1
python server.py
```

## デプロイメント

### Herokuへのデプロイ

1. Herokuアカウントの作成
2. Heroku CLIのインストール
3. アプリケーションの作成と設定：

```bash
heroku create failup-app
heroku config:set PORT=8080
heroku config:set HOST=0.0.0.0
git push heroku main
```


## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。



## 今後の予定

- [ ] ユーザー認証の実装
- [ ] データのエクスポート機能
- [ ] 統計分析機能の強化
- [ ] モバイルアプリ版の開発
- [ ] チーム機能の追加
